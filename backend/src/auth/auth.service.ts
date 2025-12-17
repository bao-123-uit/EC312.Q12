import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  Logger,
  ConflictException 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common';
import type { AuthenticatedUser } from '../common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;
  private readonly SALT_ROUNDS = 10;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ĐĂNG KÝ TÀI KHOẢN MỚI
  // ═══════════════════════════════════════════════════════════════════════════
  
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) {
    try {
      const { email, password, full_name, phone } = userData;

      // 1. Validate input
      if (!email || !password || !full_name) {
        throw new BadRequestException('Email, password và họ tên là bắt buộc');
      }

      if (password.length < 6) {
        throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // 2. Kiểm tra email đã tồn tại chưa
      const { data: existingUser, error: checkError } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng');
      }

      // 3. Hash password với bcrypt
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // 4. Tạo user mới trong bảng users
      const { data: newUser, error: insertError } = await this.supabase
        .from('users')
        .insert({
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          full_name: full_name.trim(),
          phone: phone?.trim() || null,
          role: 'customer',
          status: 'active',
          email_verified: false,
          is_admin: false,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error(`Register insert error: ${insertError.message}`);
        throw new BadRequestException(`Không thể tạo tài khoản: ${insertError.message}`);
      }

      this.logger.log(`User registered successfully: ${email}`);

      return {
        success: true,
        message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          phone: newUser.phone,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      };

    } catch (error: any) {
      this.logger.error(`Register error: ${error.message}`);
      
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Đăng ký thất bại');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ĐĂNG NHẬP
  // ═══════════════════════════════════════════════════════════════════════════

  async login(email: string, password: string) {
    try {
      // 1. Validate input
      if (!email || !password) {
        throw new BadRequestException('Email và mật khẩu là bắt buộc');
      }

      // 2. Tìm user theo email
      const { data: userData, error: dbError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (dbError || !userData) {
        this.logger.warn(`Login failed: User not found - ${email}`);
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // 3. Kiểm tra status
      if (userData.status !== 'active') {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      // 4. So sánh password với bcrypt
      const isPasswordValid = await bcrypt.compare(password, userData.password_hash);

      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Wrong password - ${email}`);
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      // 5. Tạo JWT payload
      const payload = {
        sub: userData.id,              // userId
        email: userData.email,
        role: userData.is_admin ? 'admin' : userData.role,
      };

      // 6. Sign JWT
      const access_token = this.jwtService.sign(payload);

      // 7. Cập nhật last_login_at
      await this.supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userData.id);

      this.logger.log(`User logged in successfully: ${email}`);

      // 8. Trả về thông tin user (không có password)
      return {
        success: true,
        message: 'Đăng nhập thành công',
        access_token,
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          avatar_url: userData.avatar_url,
          address: userData.address,
          role: userData.role,
          is_admin: userData.is_admin,
          created_at: userData.created_at,
        },
        role: userData.is_admin ? 'admin' : userData.role,
      };

    } catch (error: any) {
      this.logger.error(`Login error: ${error.message}`);
      
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new UnauthorizedException('Đăng nhập thất bại');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATE TOKEN (SỬA ĐỂ DÙNG CUSTOM JWT)
  // ═══════════════════════════════════════════════════════════════════════════

  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      // 🔧 SỬA: Verify Custom JWT thay vì dùng Supabase Auth
      let payload: any;
      
      try {
        payload = this.jwtService.verify(token);
      } catch (jwtError: any) {
        this.logger.error(`JWT verify error: ${jwtError.message}`);
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // Kiểm tra payload có đủ thông tin không
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Token không chứa đủ thông tin');
      }

      // Lấy thông tin user từ bảng users để đảm bảo user còn tồn tại và active
      const { data: userData, error: dbError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', payload.sub)
        .single();

      if (dbError || !userData) {
        this.logger.error(`User not found for token: ${payload.sub}`);
        throw new UnauthorizedException('Không tìm thấy thông tin user');
      }

      // Kiểm tra user còn active không
      if (userData.status !== 'active') {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      return {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        phone: userData.phone,
        role: userData.is_admin ? UserRole.ADMIN : UserRole.CUSTOMER,
        createdAt: new Date(userData.created_at),
      };

    } catch (error: any) {
      this.logger.error(`Token validation error: ${error.message}`);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  async getUserById(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      // 1. Lấy user hiện tại
      const user = await this.getUserById(userId);
      if (!user) {
        throw new BadRequestException('Không tìm thấy user');
      }

      // 2. Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isOldPasswordValid) {
        throw new BadRequestException('Mật khẩu cũ không đúng');
      }

      // 3. Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // 4. Update password
      const { error } = await this.supabase
        .from('users')
        .update({ 
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new BadRequestException('Không thể đổi mật khẩu');
      }

      return { success: true, message: 'Đổi mật khẩu thành công' };

    } catch (error: any) {
      throw new BadRequestException(error.message || 'Đổi mật khẩu thất bại');
    }
  }
}