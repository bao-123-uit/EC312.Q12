import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../../common';

/**
 * Decorator để lấy user hiện tại từ request
 * 
 * Sử dụng:
 * - @CurrentUser() user: AuthenticatedUser  -> Lấy toàn bộ user
 * - @CurrentUser('id') userId: string       -> Chỉ lấy id
 * - @CurrentUser('role') role: UserRole     -> Chỉ lấy role
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) return null;

    return data ? user[data] : user;
  },
);
        