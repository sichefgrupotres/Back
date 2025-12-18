import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.usersRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    try {
      const { password } = user;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.usersRepository.create({
        ...user,
        password: hashedPassword,
        // roleId: user.roleId || 'user',
        status: UserStatus.ACTIVE,
      });
      await this.usersRepository.save(newUser);
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      return await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneEmail(email: string) {
    try {
      return await this.usersRepository.findOneBy({ email });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userUpdated = await this.usersRepository.update(id, updateUserDto);
    return userUpdated;
  }
}
