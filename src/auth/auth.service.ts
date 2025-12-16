import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async signinService(
    credentials: LoginUserDto,
  ): Promise<{ message: string; token: string }> {
    const { email, password } = credentials;
    const foundUser = await this.usersService.findOneEmail(email);
    if (!foundUser) {
      throw new UnauthorizedException('Email y/o contraseña inccorrecto/s.!');
    }
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
      throw new UnauthorizedException('Email y/o contraseña inccorrecto/s.!');
    }

    const payload = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      rol: foundUser.roleId,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return {
      message: 'Usuario logueado con éxito',
      token: token,
    };
  }
}
