import { AuthProvider, Role } from './entities/user.entity';

export type UserSeed = {
  seedKey: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  roleId: Role;
  provider: AuthProvider;
};
