import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/usersResponse.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(user: CreateUserDto) {
    const usercreated = this.usersRepository.create(user);
    if (!(await usercreated)) return 'Error al crear el usuario';
    return 'Usuario creado con exito';
  }

  findOneEmail(email: string) {
    const foundEmail = this.usersRepository.findOneEmail(email);
    if (!foundEmail) {
      throw new NotFoundException('Email no encontrado');
    }
    return foundEmail;
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
  ): Promise<UserResponseDto> {
    await this.usersRepository.update(id, updateUserDto);
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.lastname,
      email: user.email,
    };
  }
  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
