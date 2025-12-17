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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @Get()
  findOneEmail(@Query() email: string) {
    return this.usersService.findOne(email);
  }

  @ApiOperation({
    summary: 'Buscar a un usuario por su Id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar datos de un usuario',
  })
  @ApiBearerAuth()
  @Patch(':id')
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
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }
}
