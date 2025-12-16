// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { ConfigModule } from '@nestjs/config';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { SupabaseService } from '../supabase.service';

// @Module({
//   imports: [PassportModule, ConfigModule],
//   controllers: [AuthController],
//   providers: [AuthService, SupabaseService],
//   exports: [AuthService],
// })
// export class AuthModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, RolesGuard, CustomerGuard } from './guards';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    CustomerGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    CustomerGuard,
  ],
})
export class AuthModule {}