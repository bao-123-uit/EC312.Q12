/**
 * Phone Model Module
 * Module quản lý dòng máy điện thoại
 */

import { Module } from '@nestjs/common';
import { PhoneModelController } from './phone-model.controller';
import { PhoneModelService } from './phone-model.service';

@Module({
  controllers: [PhoneModelController],
  providers: [PhoneModelService],
  exports: [PhoneModelService],
})
export class PhoneModelModule {}
