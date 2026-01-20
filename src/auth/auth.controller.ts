import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterGoogleDto } from 'src/users/dto/registerGoogle.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-google')
  @ApiOperation({
    summary: 'Inicio de sesion externa',
  })
  async registerGoogle(@Body() dto: RegisterGoogleDto) {
    console.log('REGISTER GOOGLE BODY SENGRID:', dto);
    return await this.authService.findOrCreateFromGoogle(dto);
  }

  @Post('signin')
  @ApiOperation({
    summary: 'Inicio de sesion de usuario',
  })
  @Post()
  async signin(@Body() credentials: LoginUserDto) {
    return await this.authService.signinService(credentials);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('login-google')
  // async loginGoogle(@Body('email') email: string) {
  //   return await this.authService.findOrCreateFromGoogle(email);
  // }
}
