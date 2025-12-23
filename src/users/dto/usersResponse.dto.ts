import { AuthProvider, Role } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  name?: string;
  lastname?: string;
  email: string;
  roleId: Role;
  provider: AuthProvider;
}
