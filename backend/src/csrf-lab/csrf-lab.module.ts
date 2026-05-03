import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CsrfLabController } from './csrf-lab.controller';
import { CsrfLabService } from './csrf-lab.service';

@Module({
  imports: [ConfigModule],
  controllers: [CsrfLabController],
  providers: [CsrfLabService],
  exports: [CsrfLabService],
})
export class CsrfLabModule {}
