import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from 'src/users/entities/user.entity';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
  })
  @IsEnum(Role)
  role: Role;
}
