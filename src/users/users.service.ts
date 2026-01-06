import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/usersResponse.dto';
import { RegisterGoogleDto } from './dto/registerGoogle.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(user: CreateUserDto) {
    const usercreated = this.usersRepository.create(user);
    if (!(await usercreated)) return { message: 'Error al crear el usuario' };
    return {
      message: 'Usuario creado correctamente',
    };
  }

  async findOneEmail(email: string) {
    const foundEmail = await this.usersRepository.findOneEmail(email);
    if (!foundEmail) {
      throw new NotFoundException('Email no encontrado');
    }
    return foundEmail;
  }

  async addUsers(): Promise<{ message: string }> {
    return await this.usersRepository.addUsers();
  }

  async findByGoogleId(googleId: string) {
    return this.usersRepository.findOne(googleId);
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  findOne(id: string) {
    return this.usersRepository.findOne(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<UserResponseDto> | undefined> {
    await this.usersRepository.update(id, updateUserDto);
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.lastname !== undefined) {
      user.lastname = updateUserDto.lastname;
    }

    return {
      id: user.id,
      name: user.name ?? undefined,
      lastname: user.lastname ?? undefined,
      email: user.email,
    };
  }
  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async createGoogleUser(data: RegisterGoogleDto) {
    return await this.usersRepository.createGoogleUser(data);
  }
}
