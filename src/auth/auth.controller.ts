import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  async signin(@Body() credentials: LoginUserDto) {
    return this.authService.signinService(credentials)
  }

}

