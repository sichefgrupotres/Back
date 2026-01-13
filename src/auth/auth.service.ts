import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterGoogleDto } from 'src/users/dto/registerGoogle.dto';
import { Repository } from 'typeorm';
import {
  AuthProvider,
  Role,
  User,
  UserStatus,
} from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async signinService(credentials: LoginUserDto) {
    const { email, password } = credentials;

    const user = await this.usersService.findOneEmail(email);

    if (!user) {
      throw new BadRequestException('Usuario no válido');
    }

    if (user.blocked) {
      throw new ForbiddenException('Usuario bloqueado');
    }

    if (!user.password) {
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.roleId,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          role: user.roleId,
          avatarUrl: user.avatarUrl,
        },
        token,
      };
    }

    if (!password) {
      throw new UnauthorizedException('Contraseña requerida');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Email y/o contraseña incorrecto/s');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.roleId,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.roleId,
        avatarUrl: user.avatarUrl ?? null,
      },
      token,
    };
  }

  async findOrCreateFromGoogle(dto: RegisterGoogleDto) {
    let user = await this.usersRepository.findOne({
      where: [{ googleId: dto.googleId }, { email: dto.email }],
    });

    if (!user) {
      user = await this.usersRepository.findOne({
        where: [{ email: dto.email }, { googleId: dto.googleId }],
      });

      if (user && !user.googleId) {
        user.googleId = dto.googleId;
        user.provider = AuthProvider.GOOGLE;
        await this.usersRepository.save(user);
      }

      if (!user) {
        user = this.usersRepository.create({
          email: dto.email,
          name: dto.name ?? null,
          lastname: dto.lastname ?? undefined,
          googleId: dto.googleId,
          roleId: (dto.roleId as Role) || Role.USER,
          provider: AuthProvider.GOOGLE,
          status: UserStatus.ACTIVE,
          avatarUrl: dto.avatarUrl ?? undefined,
          password: null,
        });

        await this.usersRepository.save(user);
      }
      if (user && !user.avatarUrl && dto.avatarUrl) {
        user.avatarUrl = dto.avatarUrl;
        await this.usersRepository.save(user);
      }
    }

    if (user.blocked) {
      throw new ForbiddenException('Usuario bloqueado');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roleId,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.roleId,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }
}
