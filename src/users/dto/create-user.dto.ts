import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { Genero } from '../entities/user.entity';
import { MatchPassword } from 'src/decorators/matchPassword.decorators';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(3, 100, { message: 'Debe tener una longitud de 3 a 100 caracteres' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @Length(3, 100, { message: 'Debe tener una longitud de 3 a 100 caracteres' })
  @IsString()
  apellido: string;

  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de cumpleaños es requerida' })
  cumpleaños: string;

  @IsOptional()
  @IsEnum(Genero, {
    message:
      'El género debe ser masculino, femenino, no_binario o no_responder',
  })
  genero?: Genero;

  @Length(3, 100, { message: 'Debe tener una longitud de 3 a 100 caracteres' })
  @IsString()
  nacionalidad: string;

  @IsEmail()
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsString()
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
  password: string;

  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  confirmPassword: string;

  @IsOptional()
  @IsUrl({}, { message: 'El avatar debe ser una URL válida' })
  avatarUrl: string;

  @IsString()
  @Length(5, 50, { message: 'Debe tener una longitud de 5 a 20 caracteres' })
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/, {
    message: 'La ciudad solo puede contener letras, acentos y espacios',
  })
  ciudad: string;

  @IsString()
  @Length(5, 50, { message: 'Debe tener una longitud de 5 a 50 caracteres' })
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/, {
    message: 'El país solo puede contener letras, acentos y espacios',
  })
  paisDeResidencia: string;
}
