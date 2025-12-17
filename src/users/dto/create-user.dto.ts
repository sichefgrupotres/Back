import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Validate,
} from 'class-validator';
import { MatchPassword } from 'src/decorators/matchPassword.decorators';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(3, 100, { message: 'Debe tener una longitud de 3 a 100 caracteres' })
  @IsString()
  @ApiProperty({ example: 'Federico' })
  name: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @Length(3, 100, { message: 'Debe tener una longitud de 3 a 100 caracteres' })
  @IsString()
  @ApiProperty({ example: 'Ferrer' })
  lastname: string;

  @IsEmail()
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsString()
  @ApiProperty({ example: 'federico@mail.com' })
  email: string;

  @IsNotEmpty({ message: 'El password es requerido' })
  @IsString()
  @Length(8, 15, { message: 'Debe tener una longitud de 8 a 15 caracteres' })
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Debe contener al menos una minúscula, una mayúscula, un número y un caracter especial: !@#$%^&*',
    },
  )
  @ApiProperty({ example: 'Federico2025$' })
  password: string;

  @ApiProperty({ example: 'Federico2025$' })
  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  confirmPassword: string;

  @IsOptional()
  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Role del usuario',
  })
  @IsEnum(Role)
  @ApiProperty({ example: Role.USER })
  roleId?: Role;
}
