import {
  BadRequestException,
  Injectable,
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomBytes, timingSafeEqual } from 'crypto';

type LabUser = {
  id: string;
  email: string;
};

type LabSession = {
  sessionId: string;
  userId: string;
  userEmail: string;
  csrfToken: string;
};

@Injectable()
export class CsrfLabService {
  private readonly logger = new Logger(CsrfLabService.name);
  private readonly sessions = new Map<string, LabSession>();
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async loginAsVictim(victimEmail?: string) {
    const normalizedVictimEmail = victimEmail?.toLowerCase().trim();
    const victimUser = await this.getVictimUser(normalizedVictimEmail);

    const sessionId = this.generateToken(24);
    const csrfToken = this.generateToken(24);

    this.sessions.set(sessionId, {
      sessionId,
      userId: victimUser.id,
      userEmail: victimUser.email,
      csrfToken,
    });

    return {
      sessionId,
      csrfToken,
      user: victimUser,
    };
  }

  async getUserBySessionId(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session không hợp lệ hoặc đã hết hạn');
    }

    const { data: userData, error } = await this.supabase
      .from('users')
      .select('id,email')
      .eq('id', session.userId)
      .single();

    if (error || !userData) {
      throw new UnauthorizedException('Không tìm thấy người dùng trong session');
    }

    const user: LabUser = {
      id: userData.id,
      email: userData.email,
    };

    return { user, session };
  }

  async getCsrfToken(sessionId: string) {
    const { session } = await this.getUserBySessionId(sessionId);
    return session.csrfToken;
  }

  async changeEmailInsecure(sessionId: string, newEmail: string) {
    const { user, session } = await this.getUserBySessionId(sessionId);
    const normalizedEmail = this.normalizeEmail(newEmail);

    await this.ensureEmailNotTaken(normalizedEmail, user.id);

    const { data: updatedUser, error: updateError } = await this.supabase
      .from('users')
      .update({
        email: normalizedEmail,
        email_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id,email')
      .single();

    if (updateError || !updatedUser) {
      this.logger.error(
        `Insecure change email failed: ${updateError?.message || 'No user returned'}`,
      );
      throw new BadRequestException('Không thể đổi email trong database');
    }

    session.userEmail = updatedUser.email;

    const latestUser: LabUser = {
      id: updatedUser.id,
      email: updatedUser.email,
    };

    return {
      success: true,
      mode: 'insecure',
      message:
        'Email đã đổi thành công và đã ghi trực tiếp vào database (endpoint này cố tình không có CSRF protection).',
      user: latestUser,
    };
  }

  async changeEmailSecure(
    sessionId: string,
    newEmail: string,
    csrfTokenFromHeader: string,
  ) {
    const { user, session } = await this.getUserBySessionId(sessionId);

    if (!csrfTokenFromHeader) {
      throw new UnauthorizedException('Thiếu CSRF token');
    }

    const expected = Buffer.from(session.csrfToken);
    const actual = Buffer.from(csrfTokenFromHeader);

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new UnauthorizedException('CSRF token không hợp lệ');
    }

    const normalizedEmail = this.normalizeEmail(newEmail);
    await this.ensureEmailNotTaken(normalizedEmail, user.id);

    const { data: updatedUser, error: updateError } = await this.supabase
      .from('users')
      .update({
        email: normalizedEmail,
        email_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id,email')
      .single();

    if (updateError || !updatedUser) {
      this.logger.error(
        `Secure change email failed: ${updateError?.message || 'No user returned'}`,
      );
      throw new BadRequestException('Không thể đổi email trong database');
    }

    session.userEmail = updatedUser.email;

    const latestUser: LabUser = {
      id: updatedUser.id,
      email: updatedUser.email,
    };

    return {
      success: true,
      mode: 'secure',
      message: 'Email đã đổi thành công trong database (đã qua kiểm tra CSRF token).',
      user: latestUser,
    };
  }

  private async getVictimUser(victimEmail?: string): Promise<LabUser> {
    if (victimEmail) {
      const { data, error } = await this.supabase
        .from('users')
        .select('id,email')
        .eq('email', victimEmail)
        .single();

      if (error || !data) {
        throw new BadRequestException('Không tìm thấy user theo victimEmail');
      }

      return {
        id: data.id,
        email: data.email,
      };
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('id,email')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) {
      throw new BadRequestException('Không tìm thấy user để khởi tạo CSRF lab');
    }

    return {
      id: data.id,
      email: data.email,
    };
  }

  private async ensureEmailNotTaken(targetEmail: string, currentUserId: string) {
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', targetEmail)
      .maybeSingle();

    if (data && data.id !== currentUserId) {
      throw new ConflictException('Email đã được sử dụng');
    }
  }

  private normalizeEmail(email: string) {
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      throw new BadRequestException('Email mới là bắt buộc');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new BadRequestException('Email không hợp lệ');
    }

    return normalizedEmail;
  }

  private generateToken(size: number) {
    return randomBytes(size).toString('hex');
  }
}
