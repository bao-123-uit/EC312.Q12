// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Không tìm thấy token xác thực');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token không đúng định dạng');
    }

    const token = authHeader.substring(7); // Bỏ "Bearer "

    try {
      const user = await this.authService.validateToken(token);
      request.user = user; // Gắn user vào request để sử dụng sau
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Token không hợp lệ');
    }
  }
}