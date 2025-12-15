import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  async create(user: CreateUserDto) {
    const newUser = this.usersRepository.create(user);
    await this.usersRepository.save(newUser);

    return 'Usuario creado con exito';
  }
}
