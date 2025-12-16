// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ROLES_KEY } from '../decorators/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles =
//       this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
//         context.getHandler(),
//         context.getClass(),
//       ]);

//     // Không yêu cầu role → cho phép
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true;
//     }

//     const { user } = context.switchToHttp().getRequest();

//     return requiredRoles.some(
//       (role) => user?.role === role
//     );
//   }
// }
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách roles được phép từ decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Nếu không có decorator @Roles(), cho phép tất cả
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Chưa xác thực');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Bạn cần quyền ${requiredRoles.join(' hoặc ')} để thực hiện thao tác này`
      );
    }

    return true;
  }
}