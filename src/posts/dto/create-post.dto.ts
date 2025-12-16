import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Difficulty } from '../entities/post.entity';

export class CreatePostDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  title: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'La descripción no puede superar los 100 caracteres',
  })
  description: string;

  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  imagen: string;

  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  ingredients: string;

  @IsOptional()
  @IsBoolean({ message: 'isPremium debe ser un valor booleano' })
  isPremium?: boolean;

  @IsEnum(Difficulty, {
    message: 'La dificultad debe ser easy, medium o hard',
  })
  difficulty: Difficulty;
}
