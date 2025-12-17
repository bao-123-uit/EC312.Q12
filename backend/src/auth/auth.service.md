import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthenticatedUser, UserRole } from '../common';

@Injectable()
// export class AuthService {
//   constructor(private readonly supabaseService: SupabaseService) {}

//   async register(body: any) {
//     try {
//       const { email, password, full_name, phone_number, address } = body;

//       // Kiểm tra email đã tồn tại chưa
//       const existingCustomer = await this.supabaseService.getCustomerByEmail(email);
//       if (existingCustomer.data && !existingCustomer.error) {
//         return { success: false, message: 'Email đã được đăng ký' };
//       }

//       // Kiểm tra nếu email chứa 'admin' thì gán role admin
//       const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';

//       // Tạo tài khoản mới - phù hợp với bảng users
//       const customerData = {
//         email,
//         password_hash: password, // Trong production nên hash password
//         full_name: full_name || '',
//         phone: phone_number || null,
//         role: role,
//         status: 'active',
//         created_at: new Date().toISOString(),
//       };

//       const result = await this.supabaseService.createCustomer(customerData);

//       if (result.error) {
//         console.error('Register error:', result.error);
//         return {
//           success: false,
//           message: 'Đăng ký thất bại: ' + result.error.message,
//           error: result.error,
//         };
//       }

//       const newCustomer = result.data?.[0];

//       // Nếu có địa chỉ, tạo địa chỉ trong bảng user_addresses
//       if (address && newCustomer) {
//         const addressData = {
//           user_id: newCustomer.id,
//           address_type: 'home',
//           full_name: full_name,
//           phone: phone_number || null,
//           address_line1: address,
//           city: 'TP.HCM',
//           country: 'Vietnam',
//           is_default: true,
//         };
//         await this.supabaseService.createCustomerAddress(addressData);
//       }

//       return {
//         success: true,
//         message: 'Đăng ký thành công',
//         customer: newCustomer,
//       };
//     } catch (error) {
//       console.error('Register exception:', error);
//       return {
//         success: false,
//         message: 'Có lỗi xảy ra khi đăng ký',
//         error: error.message,
//       };
//     }
//   }

//   async login(body: any) {
//     try {
//       const { email, password } = body;
//       const result = await this.supabaseService.loginCustomer(email, password);

//       if (result.error || !result.data) {
//         return { success: false, message: 'Email hoặc mật khẩu không đúng' };
//       }

//       const customer = result.data;
//       return {
//         success: true,
//         message: 'Đăng nhập thành công',
//         customer: customer,
//         role: customer.role || 'customer',
//       };
//     } catch (error) {
//       console.error('Login exception:', error);
//       return {
//         success: false,
//         message: 'Có lỗi xảy ra khi đăng nhập',
//         error: error.message,
//       };
//     }
//   }
// }
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  /**
   * Xác thực token và trả về thông tin user + role
   */
  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      // 1. Verify token với Supabase Auth
      const { data: { user }, error: authError } = await this.supabase.auth.getUser(token);
      
      if (authError || !user) {
        this.logger.warn(`Token validation failed: ${authError?.message}`);
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // 2. Lấy thông tin user + role từ database
      const { data: userData, error: dbError } = await this.supabase
        .from('users')
        .select('id, email, full_name, phone, role, created_at')
        .eq('id', user.id)
        .single();

      if (dbError || !userData) {
        // Nếu chưa có trong DB (trường hợp trigger chưa chạy), tạo mới
        this.logger.warn(`User not found in DB, creating: ${user.email}`);
        await this.createUserRecord(user.id, user.email!);
        
        return {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name,
          role: UserRole.CUSTOMER, // Mặc định
          createdAt: new Date(user.created_at),
        };
      }

      return {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        phone: userData.phone,
        role: userData.role as UserRole,
        createdAt: new Date(userData.created_at),
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Validation error: ${error.message}`);
      throw new UnauthorizedException('Xác thực thất bại');
    }
  }

  /**
   * Tạo user record nếu chưa có
   */
  private async createUserRecord(userId: string, email: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        role: UserRole.CUSTOMER,
      });

    if (error) {
      this.logger.error(`Failed to create user record: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin user theo ID
   */
  async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      role: data.role as UserRole,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Kiểm tra user có role cụ thể không
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.role === role;
  }

  /**
   * Kiểm tra user có phải customer không
   */
  async isCustomer(userId: string): Promise<boolean> {
    return this.hasRole(userId, UserRole.CUSTOMER);
  }

  /**
   * Kiểm tra user có phải admin không
   */
  async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, UserRole.ADMIN);
  }
  async register(body: any) {
//     try {
//       const { email, password, full_name, phone_number, address } = body;

//       // Kiểm tra email đã tồn tại chưa
//       const existingCustomer = await this.supabaseService.getCustomerByEmail(email);
//       if (existingCustomer.data && !existingCustomer.error) {
//         return { success: false, message: 'Email đã được đăng ký' };
//       }

//       // Kiểm tra nếu email chứa 'admin' thì gán role admin
//       const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';

//       // Tạo tài khoản mới - phù hợp với bảng users
//       const customerData = {
//         email,
//         password_hash: password, // Trong production nên hash password
//         full_name: full_name || '',
//         phone: phone_number || null,
//         role: role,
//         status: 'active',
//         created_at: new Date().toISOString(),
//       };

//       const result = await this.supabaseService.createCustomer(customerData);

//       if (result.error) {
//         console.error('Register error:', result.error);
//         return {
//           success: false,
//           message: 'Đăng ký thất bại: ' + result.error.message,
//           error: result.error,
//         };
//       }

//       const newCustomer = result.data?.[0];

//       // Nếu có địa chỉ, tạo địa chỉ trong bảng user_addresses
//       if (address && newCustomer) {
//         const addressData = {
//           user_id: newCustomer.id,
//           address_type: 'home',
//           full_name: full_name,
//           phone: phone_number || null,
//           address_line1: address,
//           city: 'TP.HCM',
//           country: 'Vietnam',
//           is_default: true,
//         };
//         await this.supabaseService.createCustomerAddress(addressData);
//       }

//       return {
//         success: true,
//         message: 'Đăng ký thành công',
//         customer: newCustomer,
//       };
//     } catch (error) {
//       console.error('Register exception:', error);
//       return {
//         success: false,
//         message: 'Có lỗi xảy ra khi đăng ký',
//         error: error.message,
//       };
//     }
//   }

//   async login(body: any) {
//     try {
//       const { email, password } = body;
//       const result = await this.supabaseService.loginCustomer(email, password);

//       if (result.error || !result.data) {
//         return { success: false, message: 'Email hoặc mật khẩu không đúng' };
//       }

//       const customer = result.data;
//       return {
//         success: true,
//         message: 'Đăng nhập thành công',
//         customer: customer,
//         role: customer.role || 'customer',
//       };
//     } catch (error) {
//       console.error('Login exception:', error);
//       return {
//         success: false,
//         message: 'Có lỗi xảy ra khi đăng nhập',
//         error: error.message,
//       };
//     }
//   }
}



















































































import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
// import { SupabaseService } from '../supabase.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../common';
import type { AuthenticatedUser } from '../common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }
  // ═══════════════════════════════════════════════════════════════════════════
  // THÊM METHOD REGISTER VÀ LOGIN
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Đăng ký tài khoản mới
   */
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    address?: string;
  }) {
    try {
      // 1. Tạo user trong Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        },
      });

      if (authError) {
        this.logger.error(`Register error: ${authError.message}`);
        return {
          success: false,
          message: authError.message,
        };
      }

      // 2. Tạo record trong bảng users
      const { data: userRecord, error: dbError } = await this.supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone_number || null,
          role: 'customer',
        })
        .select()
        .single();

      if (dbError) {
        this.logger.warn(`Failed to create user record: ${dbError.message}`);
      }

      return {
        success: true,
        message: 'Đăng ký thành công',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: userData.full_name,
          role: 'customer',
        },
      };
    } catch (error: any) {
      this.logger.error(`Register error: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Đăng ký thất bại',
      };
    }
  }
  /**
   * Đăng nhập
   */
  async login(email: string, password: string) {
    try {
      // 1. Đăng nhập qua Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        this.logger.warn(`Login failed: ${authError.message}`);
        return {
          success: false,
          message: 'Email hoặc mật khẩu không đúng',
        };
      }

      // 2. Lấy thông tin user từ database
      const { data: userData, error: dbError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (dbError || !userData) {
        // Nếu chưa có trong DB, tạo mới
        const newUser = {
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
          role: 'customer',
        };

        await this.supabase.from('users').insert(newUser);

        return {
          success: true,
          message: 'Đăng nhập thành công',
          user: newUser,
          role: 'customer',
          access_token: authData.session?.access_token,
        };
      }

      return {
        success: true,
        message: 'Đăng nhập thành công',
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          created_at: userData.created_at,
        },
        role: userData.role,
        access_token: authData.session?.access_token,
      };
    } catch (error: any) {
      this.logger.error(`Login error: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Đăng nhập thất bại',
      };
    }
  }
  /**
   * Xác thực token và trả về thông tin user + role
   */
  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      // 1. Verify token với Supabase Auth
      const { data: { user }, error: authError } = await this.supabase.auth.getUser(token);
      
      if (authError || !user) {
        this.logger.warn(`Token validation failed: ${authError?.message}`);
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // 2. Lấy thông tin user + role từ database
      const { data: userData, error: dbError } = await this.supabase
        .from('users')
        .select('id, email, full_name, phone, role, created_at')
        .eq('id', user.id)
        .single();

      if (dbError || !userData) {
        // Nếu chưa có trong DB (trường hợp trigger chưa chạy), tạo mới
        this.logger.warn(`User not found in DB, creating: ${user.email}`);
        await this.createUserRecord(user.id, user.email!);
        
        return {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name,
          role: UserRole.CUSTOMER, // Mặc định
          createdAt: new Date(user.created_at),
        };
      }

      return {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        phone: userData.phone,
        role: userData.role as UserRole,
        createdAt: new Date(userData.created_at),
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Validation error: ${error.message}`);
      throw new UnauthorizedException('Xác thực thất bại');
    }
  }

  /**
   * Tạo user record nếu chưa có
   */
  private async createUserRecord(userId: string, email: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        role: UserRole.CUSTOMER,
      });

    if (error) {
      this.logger.error(`Failed to create user record: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin user theo ID
   */
  async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      role: data.role as UserRole,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Kiểm tra user có role cụ thể không
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.role === role;
  }

  /**
   * Kiểm tra user có phải customer không
   */
  async isCustomer(userId: string): Promise<boolean> {
    return this.hasRole(userId, UserRole.CUSTOMER);
  }

  /**
   * Kiểm tra user có phải admin không
   */
  async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, UserRole.ADMIN);
  }
}



































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

  constructor(private configService: ConfigService,
    private jwtService :JwtService,
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
      // 4️⃣ Tạo JWT payload
      const payload = {
        sub: userData.id,              // userId
        email: userData.email,
        role: userData.is_admin ? 'admin' : userData.role,
      };
      // 5️⃣ Sign JWT
      const access_token = this.jwtService.sign(payload);

      // 5. Cập nhật last_login_at
      await this.supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userData.id);

      this.logger.log(`User logged in successfully: ${email}`);

      // 6. Trả về thông tin user (không có password)
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
  // VALIDATE TOKEN (cho các request sau khi login)
  // ═══════════════════════════════════════════════════════════════════════════

  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      // Nếu dùng JWT token của Supabase Auth
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        // Fallback: decode token nếu là custom JWT
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // Lấy thông tin user từ bảng users
      const { data: userData, error: dbError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (dbError || !userData) {
        throw new UnauthorizedException('Không tìm thấy thông tin user');
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
      throw new UnauthorizedException(error.message || 'Token không hợp lệ');
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
