import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BlockUserDto } from './dto/block-user.dto';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  usersService: any;
  constructor(private readonly adminService: AdminService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los usuarios',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener cantidad de posts por creador',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users-posts')
  getUsersPosts() {
    return this.adminService.getUsersPosts();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuarios por id',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuarios filtarizados por email o rol',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  getUsers(@Query('email') email?: string, @Query('role') role?: string) {
    return this.adminService.getUsers({ email, role });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar el rol de un usuario',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bloquear la cuenta de un usuario' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBody({ type: BlockUserDto })
  @Patch('users/:id/block')
  async blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    await this.adminService.blockUser(id, dto.blocked);
    return {
      message: `Usuario ${dto.blocked ? 'bloqueado' : 'desbloqueado'} correctamente`,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estadísticas del sistema',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
