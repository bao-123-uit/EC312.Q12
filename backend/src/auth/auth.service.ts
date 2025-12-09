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

      // Tách full_name thành first_name và last_name
      const nameParts = (full_name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Tạo tài khoản mới
      const customerData = {
        email,
        password_hash: password, // Trong production nên hash password
        first_name: firstName,
        last_name: lastName,
        phone: phone_number || null,
        is_verified: false,
        is_active: true,
        loyalty_points: 0,
        total_spent: 0,
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

      // Nếu có địa chỉ, tạo địa chỉ trong bảng customer_addresses
      if (address && newCustomer) {
        const addressData = {
          customer_id: newCustomer.customer_id,
          address_type: 'home',
          full_name: full_name,
          phone: phone_number || null,
          address_line1: address,
          city: 'TP.HCM', // Mặc định, có thể cải thiện sau
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

      return {
        success: true,
        message: 'Đăng nhập thành công',
        customer: result.data,
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
