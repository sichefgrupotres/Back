/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // 1️⃣ RUTA PROFILE PRIMERO (Para evitar error de UUID)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    const userId = req.user.sub || req.user.userId || req.user.id;
    return this.usersService.findOne(userId);
  }

  // 2️⃣ RUTA CHAT LIST SEGUNDA
  @Get('chat-list')
  @UseGuards(JwtAuthGuard)
  async getChatUsers(@Req() req) {
    const userId = req.user.sub || req.user.userId || req.user.id;
    if (!userId) throw new UnauthorizedException('Usuario no identificado');

    const users = await this.usersService.findAllChatUsers(userId);

    return users.map((u) => ({
      id: u.id,
      name: `${u.name || ''} ${u.lastname || ''}`.trim(),
      email: u.email,
      avatar: u.avatarUrl || 'https://ui-avatars.com/api/?name=' + u.name,
      role: u.roleId,
      isPremium: u.isPremium // Esto ya debería funcionar
    }));
  }

  // 3️⃣ RUTA COMODÍN (:id) AL FINAL
  // Si la pones antes, se "come" las peticiones a 'profile' y 'chat-list'
  @ApiOperation({
    summary: 'Buscar a un usuario por su Id',
  })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ... Resto de métodos (uploadAvatar, register, findAll, etc.) ...

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.usersService.uploadAvatar(req.user.sub, file);
  }

  @ApiOperation({
    summary: 'Registro de un nuevo usuario',
  })
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    const newUser = this.usersService.create(createUserDto);
    return newUser;
  }

  @ApiOperation({
    summary: 'Ver todos los usuarios',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: 'Buscar a un usuario por su email',
  })
  @ApiQuery({
    name: 'email',
    example: 'user@mail.com',
    required: true,
  })
  @ApiBearerAuth()
  findOneEmail(@Query() email: string) {
    return this.usersService.findOne(email);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed de usuarios' })
  @UseGuards(JwtAuthGuard)
  @Get('seeder')
  seedUsers(): Promise<{ message: string }> {
    return this.usersService.addUsers();
  }

  @ApiOperation({
    summary: 'Actualizar datos de un usuario',
  })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({
    summary: 'Eliminar cuenta de un usuario',
  })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}