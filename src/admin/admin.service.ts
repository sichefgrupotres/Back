import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role } from 'src/users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async getAllUsers() {
    return this.usersService.findAll();
  }

  async getUserById(id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneEmail(email: string) {
    const user = await this.usersService.findOneEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(id: string, roleId: Role) {
    return this.usersService.update(id, { roleId });
  }

  async blockUser(id: string, blocked: boolean) {
    return this.usersService.update(id, { blocked });
  }

  //   async getStats() {
  //     return {
  //       totalUsers: await this.usersService.count(),
  //       timestamp: new Date(),
  //     };
  //   }
}
