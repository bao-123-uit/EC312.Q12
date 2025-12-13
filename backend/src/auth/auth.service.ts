import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(body: any) {
    try {
      const { email, password, full_name, phone_number, address } = body;

      // Kiểm tra email đã tồn tại chưa
      const existingCustomer = await this.supabaseService.getCustomerByEmail(email);
      if (existingCustomer.data && !existingCustomer.error) {
        return { success: false, message: 'Email đã được đăng ký' };
      }

      // Kiểm tra nếu email chứa 'admin' thì gán role admin
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';

      // Tạo tài khoản mới - phù hợp với bảng users
      const customerData = {
        email,
        password_hash: password, // Trong production nên hash password
        full_name: full_name || '',
        phone: phone_number || null,
        role: role,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const result = await this.supabaseService.createCustomer(customerData);

      if (result.error) {
        console.error('Register error:', result.error);
        return {
          success: false,
          message: 'Đăng ký thất bại: ' + result.error.message,
          error: result.error,
        };
      }

      const newCustomer = result.data?.[0];

      // Nếu có địa chỉ, tạo địa chỉ trong bảng user_addresses
      if (address && newCustomer) {
        const addressData = {
          user_id: newCustomer.id,
          address_type: 'home',
          full_name: full_name,
          phone: phone_number || null,
          address_line1: address,
          city: 'TP.HCM',
          country: 'Vietnam',
          is_default: true,
        };
        await this.supabaseService.createCustomerAddress(addressData);
      }

      return {
        success: true,
        message: 'Đăng ký thành công',
        customer: newCustomer,
      };
    } catch (error) {
      console.error('Register exception:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng ký',
        error: error.message,
      };
    }
  }

  async login(body: any) {
    try {
      const { email, password } = body;
      const result = await this.supabaseService.loginCustomer(email, password);

      if (result.error || !result.data) {
        return { success: false, message: 'Email hoặc mật khẩu không đúng' };
      }

      const customer = result.data;
      return {
        success: true,
        message: 'Đăng nhập thành công',
        customer: customer,
        role: customer.role || 'customer',
      };
    } catch (error) {
      console.error('Login exception:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng nhập',
        error: error.message,
      };
    }
  }
}
