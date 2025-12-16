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
}

