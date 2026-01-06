import { Repository } from 'typeorm';
import type { DeepPartial } from 'typeorm';
import { AuthProvider, User, UserStatus } from './entities/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterGoogleDto } from './dto/registerGoogle.dto';
import usersData from '../utils/users.json';
import { UserSeed } from './user-seed.type';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.usersRepository.find();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });

    if (exists) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Separar confirmPassword y password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, password, ...rest } = createUserDto;

    // Hash solo si password existe
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      provider: AuthProvider.LOCAL,
    });

    return this.usersRepository.save(user);
  }

  async addUsers(): Promise<{ message: string }> {
    const users = usersData as UserSeed[];

    await Promise.all(
      users.map(async (userData) => {
        const user = this.usersRepository.create({
          name: userData.name,
          lastname: userData.lastname,
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10),
          roleId: userData.roleId,
          provider: userData.provider,
          seedKey: userData.seedKey,
          status: UserStatus.ACTIVE,
        });
        await this.usersRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(user)
          .orIgnore()
          .execute();
      }),
    );

    return { message: 'Usuarios agregados' };
  }

  async createGoogleUser(data: RegisterGoogleDto) {
    const userGoogle: DeepPartial<User> = {
      email: data.email,
      name: data.name ?? null,
      lastname: data.lastname ?? null,
      googleId: data.googleId,
      provider: AuthProvider.GOOGLE,
      status: UserStatus.ACTIVE,
      password: null,
    };

    const user = this.usersRepository.create(userGoogle);
    return await this.usersRepository.save(user);
  }

  async findOne(id: string) {
    try {
      return await this.usersRepository.findOneBy({ id });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Error inesperado');
    }
  }

  async findOneEmail(email: string) {
    try {
      return await this.usersRepository.findOneBy({ email });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Error inesperado');
    }
  }
  async findByGoogleId(googleId: string) {
    return await this.usersRepository.findOne({
      where: { googleId },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userUpdated = await this.usersRepository.update(id, updateUserDto);
    return userUpdated;
  }

  async findBy(id: string) {
    return this.usersRepository.findBy(id);
  }
}
