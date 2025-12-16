import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    // Trả về object user với role mặc định là customer nếu chưa có
    return { 
      userId: payload.sub, 
      email: payload.email,
      role: payload.user_metadata?.role || 'customer',
    };
  }
}