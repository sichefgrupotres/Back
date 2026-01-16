import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async getUsers(filters: {
    email?: string;
    role?: string;
  }): Promise<User[] | User> {
    const { email, role } = filters;

    if (email) {
      return this.getUserByEmail(email);
    }

    if (role) {
      return this.getUsersByRole(role);
    }

    return this.getAllUsers();
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.usersService.findOneEmail(email);
  }

  async getUsersByRole(roleName: string): Promise<User[]> {
    return this.usersService.findUsersByRole(roleName);
  }

  async updateUserRole(id: string, roleId: Role): Promise<{ message: string }> {
    await this.usersService.update(id, { roleId });
    return { message: 'User role updated successfully' };
  }

  async blockUser(id: string, blocked: boolean): Promise<{ message: string }> {
    await this.usersService.update(id, { blocked });
    return {
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
    };
  }

  async getStats(): Promise<{ totalUsers: number; timestamp: Date }> {
    return {
      totalUsers: await this.usersService.count(),
      timestamp: new Date(),
    };
  }
}
