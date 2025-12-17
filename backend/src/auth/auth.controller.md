File: backend/src/auth/auth.controller.ts
-----------------------------------------

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Headers,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, CustomerGuard, RolesGuard } from './guards';
import { Roles, CurrentUser, CustomerOnly } from './decorators';
import { UserRole } from '../common';
import type { AuthenticatedUser } from '../common';

// DTOs
class RegisterDto {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

class LoginDto {
  email: string;
  password: string;
}

class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS (không cần authentication)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * POST /auth/register - Đăng ký tài khoản mới
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  /**
   * POST /auth/login - Đăng nhập
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body.email, body.password);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTECTED ENDPOINTS (cần authentication)
  // ═══════════════════════════════════════════════════════════════════════════

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
  @HttpCode(HttpStatus.OK)
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
   * PUT /auth/change-password - Đổi mật khẩu
   * Yêu cầu: Đã đăng nhập
   */
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * GET /auth/customer-only-test - Test endpoint chỉ cho customer
   */
  @Get('customer-only-test')
  @CustomerOnly()
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