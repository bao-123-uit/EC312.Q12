// import { Controller, Post, Body } from '@nestjs/common';
// import { AuthService } from './auth.service';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('register')
//   async register(@Body() body: any) {
//     return await this.authService.register(body);
//   }

//   @Post('login')
//   async login(@Body() body: any) {
//     return await this.authService.login(body);
//   }
// }
import {
  Controller,
  Get,
  Post,
  Headers,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, CustomerGuard, RolesGuard } from './guards';
import { Roles, CurrentUser, CustomerOnly } from './decorators';
import {  UserRole } from '../common';
import type { AuthenticatedUser } from '../common';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /auth/me - Lấy thông tin user hiện tại
   * Yêu cầu: Đã đăng nhập
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  /**
   * POST /auth/validate - Validate token và trả về user info
   * Dùng cho frontend để kiểm tra token còn hợp lệ không
   */
  @Post('validate')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const token = authHeader.substring(7);
    const user = await this.authService.validateToken(token);

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  /**
   * GET /auth/customer-only-test - Test endpoint chỉ cho customer
   */
  @Get('customer-only-test')
  @CustomerOnly()  // Sử dụng decorator kết hợp
  async customerOnlyTest(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      message: '✅ Bạn đang truy cập với vai trò CUSTOMER',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * GET /auth/admin-only-test - Test endpoint chỉ cho admin
   */
  @Get('admin-only-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminOnlyTest(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      message: '✅ Bạn đang truy cập với vai trò ADMIN',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
