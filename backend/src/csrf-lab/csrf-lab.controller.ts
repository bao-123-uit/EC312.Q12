import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CsrfLabService } from './csrf-lab.service';

class ChangeEmailDto {
  newEmail!: string;
}

class LoginLabDto {
  victimEmail?: string;
}

@Controller('csrf-lab')
export class CsrfLabController {
  private readonly sessionCookieName = 'csrf_lab_session';

  constructor(private readonly csrfLabService: CsrfLabService) {}

  /**
   * Tạo session demo và set cookie để mô phỏng người dùng đã đăng nhập.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginLabDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sessionId, csrfToken, user } =
      await this.csrfLabService.loginAsVictim(body?.victimEmail);

    response.cookie(this.sessionCookieName, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return {
      success: true,
      message: 'Đăng nhập lab thành công',
      user,
      csrfToken,
      guide: {
        insecureEndpoint: '/csrf-lab/insecure/change-email',
        secureEndpoint: '/csrf-lab/secure/change-email',
      },
    };
  }

  /**
   * GET login helper để set cookie trực tiếp từ browser.
   */
  @Get('login')
  @HttpCode(HttpStatus.OK)
  async loginGet(
    @Query('victimEmail') victimEmail: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sessionId, csrfToken, user } =
      await this.csrfLabService.loginAsVictim(victimEmail);

    response.cookie(this.sessionCookieName, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return {
      success: true,
      message: 'Đăng nhập lab thành công',
      user,
      csrfToken,
      guide: {
        insecureEndpoint: '/csrf-lab/insecure/change-email',
        secureEndpoint: '/csrf-lab/secure/change-email',
      },
    };
  }

  @Get('me')
  async me(@Req() request: Request) {
    const sessionId = this.getSessionIdFromCookie(request);
    const { user } = await this.csrfLabService.getUserBySessionId(sessionId);

    return {
      success: true,
      user,
    };
  }

  /**
   * Endpoint bị lỗi CSRF: chỉ cần cookie là đổi được email.
   */
  @Post('insecure/change-email')
  @HttpCode(HttpStatus.OK)
  async changeEmailInsecure(
    @Req() request: Request,
    @Body() body: ChangeEmailDto,
  ) {
    const sessionId = this.getSessionIdFromCookie(request);
    return await this.csrfLabService.changeEmailInsecure(sessionId, body.newEmail);
  }

  /**
   * Trả CSRF token để frontend hợp lệ lấy và gửi trong header.
   */
  @Get('secure/csrf-token')
  async getSecureCsrfToken(@Req() request: Request) {
    const sessionId = this.getSessionIdFromCookie(request);

    return {
      success: true,
      csrfToken: await this.csrfLabService.getCsrfToken(sessionId),
      headerName: 'x-csrf-token',
    };
  }

  /**
   * Endpoint an toàn: yêu cầu token trong header x-csrf-token.
   */
  @Post('secure/change-email')
  @HttpCode(HttpStatus.OK)
  async changeEmailSecure(@Req() request: Request, @Body() body: ChangeEmailDto) {
    const sessionId = this.getSessionIdFromCookie(request);
    const csrfToken = request.header('x-csrf-token') || '';

    return await this.csrfLabService.changeEmailSecure(
      sessionId,
      body.newEmail,
      csrfToken,
    );
  }

  private getSessionIdFromCookie(request: Request) {
    const cookieHeader = request.headers.cookie || '';
    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith(`${this.sessionCookieName}=`),
    );

    if (!sessionCookie) {
      throw new UnauthorizedException('Thiếu session cookie');
    }

    const [, sessionId] = sessionCookie.split('=');

    if (!sessionId) {
      throw new UnauthorizedException('Session cookie không hợp lệ');
    }

    return sessionId;
  }
}
