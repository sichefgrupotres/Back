import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Titulo de mi post' })
  title: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'La descripción no puede superar los 100 caracteres',
  })
  @ApiProperty({ example: 'Descripción de mi post' })
  description: string;

  @IsNotEmpty({ message: 'Ingredientes de la receta' })
  @IsString({ message: 'Los ingredientes deben ser una cadena de texto' })
  @ApiProperty({ example: 'Ingredientes de mi receta' })
  ingredients: string;

  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @ApiProperty({ example: 'https://miimagen.com/imagen.jpg' })
  imagen?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPremium debe ser un valor booleano' })
  @ApiProperty({ example: 'false' })
  isPremium?: boolean;

  @IsOptional()
  @ApiProperty({
    enum: Difficulty,
    example: Difficulty.MEDIUM,
    description: 'Nivel de dificultad de la receta',
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;
}
