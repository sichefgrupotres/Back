import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
// import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/guards/roles.guard';
// import { Roles } from 'src/decorators/role.decorator';
// import { Role } from 'src/users/entities/user.entity';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BlockUserDto } from './dto/block-user.dto';

@ApiTags('Admin')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.ADMIN)
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
    summary: 'Obtener usuarios por id',
  })
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @ApiOperation({
    summary: 'Obtener usuarios por email',
  })
  @Get()
  findOne(@Query() email: string) {
    return this.adminService.findOneEmail(email);
  }

  @ApiOperation({
    summary: 'Cambiar el rol de un usuario',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @ApiOperation({
    summary: 'Bloquear la cuenta de un usuario',
  })
  @ApiBody({ type: BlockUserDto })
  @Patch('users/:id/block')
  blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    return this.adminService.blockUser(id, dto.blocked);
  }

  //   @Get('stats')
  //   getStats() {
  //     return this.adminService.getStats();
  //   }
}
