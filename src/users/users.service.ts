import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/usersResponse.dto';
import { RegisterGoogleDto } from './dto/registerGoogle.dto';
import { UploadImagenClou } from 'src/services/uploadImage';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private readonly uploadImageClou: UploadImagenClou,
  ) {}

  async create(user: CreateUserDto): Promise<{ message: string }> {
    const usercreated = await this.usersRepository.create(user);
    if (!usercreated) {
      return { message: 'Error al crear el usuario' };
    }
    return { message: 'Usuario creado correctamente' };
  }

  async findOneEmail(email: string): Promise<User> {
    const foundEmail = await this.usersRepository.findOneEmail(email);
    if (!foundEmail) {
      throw new NotFoundException('Email no encontrado');
    }
    return foundEmail;
  }

  async addUsers(): Promise<{ message: string }> {
    return this.usersRepository.addUsers();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne(googleId);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<UserResponseDto>> {
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

  async createGoogleUser(data: RegisterGoogleDto): Promise<User> {
    return this.usersRepository.createGoogleUser(data);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const result = await this.uploadImageClou.uploadImage(file);

    await this.usersRepository.update(userId, {
      avatarUrl: result.secure_url,
    });

    return { avatarUrl: result.secure_url };
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async findUsersByRole(roleName: string): Promise<User[]> {
    return this.usersRepository.findUsersByRole(roleName);
  }

  remove(id: string) {
    if (!id) {
      throw new Error('Usuario no encontrado');
    }

    return this.usersRepository.remove(id);
  }
}
