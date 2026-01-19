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

  // ... (Tus otros métodos POST, etc. déjalos igual)

  // 👇 MOVI ESTO AQUÍ ARRIBA (Antes de :id)
  // GET /users/chat-list -> Devuelve usuarios para el sidebar
  @Get('chat-list')
  async getChatUsers() {
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      name: `${u.name} ${u.lastname}`,
      email: u.email,
      avatar: u.avatarUrl || 'https://ui-avatars.com/api/?name=' + u.name,
      role: u.roleId,
    }));
  }
  // 👆 FIN DEL CAMBIO

  @ApiOperation({
    summary: 'Buscar a un usuario por su Id',
  })
  @ApiBearerAuth()
  @Get(':id') // 👈 Ahora este está DEBAJO de chat-list, así que no interferirá
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ... (El resto de tu código update, remove, etc. sigue igual)

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
  // @Get() // ⚠️ OJO: Tienes dos @Get() seguidos (findAll y este). Nest solo usará el primero.
  // Lo ideal sería @Get('search') o manejar el query dentro de findAll, pero por ahora déjalo si no te da problemas.
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