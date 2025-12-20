import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DesignController } from './design.controller';
import { DesignService } from './design.service';
import { SupabaseService } from '../supabase.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  ],
  controllers: [DesignController],
  providers: [DesignService, SupabaseService],
  exports: [DesignService],
})
export class DesignModule {}
