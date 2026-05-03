import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookieHeader = request.headers.cookie || '';

    const token = this.extractCookieToken(cookieHeader, 'access_token');

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy access_token trong cookie');
    }

    try {
      const user = await this.authService.validateToken(token);
      request.user = user;
      return true;
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Cookie token không hợp lệ');
    }
  }

  private extractCookieToken(cookieHeader: string, cookieName: string): string | null {
    const cookies = cookieHeader
      .split(';')
      .map((cookie: string) => cookie.trim())
      .filter(Boolean);

    const matched = cookies.find((cookie: string) =>
      cookie.startsWith(`${cookieName}=`),
    );

    if (!matched) {
      return null;
    }

    const token = matched.substring(cookieName.length + 1);
    return token || null;
  }
}
