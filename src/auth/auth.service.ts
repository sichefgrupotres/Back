import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterGoogleDto } from 'src/users/dto/registerGoogle.dto';
import { Repository } from 'typeorm';
import { AuthProvider, User, UserStatus } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
// import { AuthProvider, UserStatus } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async signinService(
    credentials: LoginUserDto,
  ): Promise<{ message: string; token: string }> {
    const { email, password } = credentials;

    const foundUser = await this.usersService.findOneEmail(email);

    if (!foundUser.password) {
      throw new UnauthorizedException(
        'Este usuario debe iniciar sesión con Google',
      );
    }

    const validPassword = await bcrypt.compare(password!, foundUser.password);
    if (!validPassword) {
      throw new UnauthorizedException('Email y/o contraseña inccorrecto/s.!');
    }

    const payload = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      rol: foundUser.roleId,
    };

    const token = this.jwtService.sign(payload);
    return {
      message: 'Usuario logueado con éxito',
      token: token,
    };
  }

  async findOrCreateFromGoogle(dto: RegisterGoogleDto) {
    let user = await this.usersRepository.findOne({
      where: { googleId: dto.googleId },
    });

    if (user) {
      return user;
    }

    user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (user && !user.googleId) {
      user.googleId = dto.googleId;
      user.provider = AuthProvider.GOOGLE;

      return await this.usersRepository.save(user);
    }

    if (user) {
      return user;
    }

    const newUser = this.usersRepository.create({
      email: dto.email,
      name: dto.name ?? null,
      lastname: dto.lastname ?? null,
      googleId: dto.googleId,
      provider: AuthProvider.GOOGLE,
      status: UserStatus.ACTIVE,
      password: null,
    });

    return await this.usersRepository.save(newUser);
  }
}
