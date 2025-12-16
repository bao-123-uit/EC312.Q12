import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedUser {
  id: string;           // UUID từ Supabase Auth
  email: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  createdAt?: Date;
}
