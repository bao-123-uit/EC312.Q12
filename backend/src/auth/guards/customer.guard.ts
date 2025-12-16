import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../common';

/**
 * Guard chỉ cho phép CUSTOMER truy cập
 * Sử dụng: @UseGuards(JwtAuthGuard, CustomerGuard)
 */
@Injectable()
export class CustomerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Chưa đăng nhập');
    }

    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException(
        'Chỉ khách hàng (customer) mới được thực hiện thao tác này'
      );
    }

    return true;
  }
}