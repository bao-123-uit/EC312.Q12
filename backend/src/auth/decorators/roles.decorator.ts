// import { SetMetadata } from '@nestjs/common';
// export const ROLES_KEY = 'roles';
// export const Roles = (...roles: string[]) =>
//   SetMetadata(ROLES_KEY, roles);
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common';

export const ROLES_KEY = 'roles';

/**
 * Decorator để chỉ định roles được phép truy cập
 * Sử dụng: @Roles(UserRole.ADMIN) hoặc @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);