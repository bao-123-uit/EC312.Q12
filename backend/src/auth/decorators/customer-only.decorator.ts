import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CustomerGuard } from '../guards/customer.guard';

/**
 * Decorator kết hợp để bảo vệ endpoint chỉ cho CUSTOMER
 * Sử dụng: @CustomerOnly() thay vì @UseGuards(JwtAuthGuard, CustomerGuard)
 */
export function CustomerOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, CustomerGuard)
  );
}