import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BlockUserDto } from './dto/block-user.dto';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  usersService: any;
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'Obtener todos los usuarios',
  })
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @ApiOperation({
    summary: 'Obtener cantidad de posts por creador',
  })
  @Get('users-posts')
  getUsersPosts() {
    return this.adminService.getUsersPosts();
  }

  @ApiOperation({
    summary: 'Obtener usuarios por id',
  })
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @ApiOperation({
    summary: 'Obtener usuarios filtarizados por email o rol',
  })
  @Get('users')
  getUsers(@Query('email') email?: string, @Query('role') role?: string) {
    return this.adminService.getUsers({ email, role });
  }

  @ApiOperation({
    summary: 'Cambiar el rol de un usuario',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @ApiOperation({ summary: 'Bloquear la cuenta de un usuario' })
  @ApiBody({ type: BlockUserDto })
  @Patch('users/:id/block')
  async blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    await this.adminService.blockUser(id, dto.blocked);

    if (dto.blocked) {
      // Lanza un error 403 que NextAuth puede detectar
      throw new ForbiddenException({ error: 'USER_BLOCKED' });
    }

    return {
      message: `Usuario ${dto.blocked ? 'bloqueado' : 'desbloqueado'} correctamente`,
    };
  }
  @ApiOperation({
    summary: 'Obtener estadísticas del sistema',
  })
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
