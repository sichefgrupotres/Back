import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  IsInt,
  Min,
  Max,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Difficulty } from '../entities/post.entity';

export class FilterPostDto {
  //Búsqueda global (title, description, ingredients)
  @IsOptional()
  @IsString({ message: 'El texto de búsqueda debe ser una cadena' })
  @ApiProperty({
    required: false,
    example: 'pollo',
    description: 'Búsqueda global por título, descripción o ingredientes',
  })
  search?: string;

  @IsOptional()
  @IsEnum(Difficulty, {
    message: 'La dificultad debe ser facil, medio o dificil',
  })
  @ApiProperty({
    required: false,
    enum: Difficulty,
    example: Difficulty.facil,
    description: 'Filtrar recetas por nivel de dificultad',
  })
  difficulty?: Difficulty;

  @IsOptional()
  @IsBoolean({ message: 'isPremium debe ser true o false' })
  @Transform(({ value }) => value === 'true')
  @ApiProperty({
    required: false,
    example: 'true',
    description: 'Filtrar recetas premium o no premium',
  })
  isPremium?: boolean;

  @IsOptional()
  @IsString({ message: 'El nombre del creador debe ser una cadena' })
  @MaxLength(30)
  @Matches(/^\S+(?:\s+\S+)?$/, {
    message: 'creatorName debe tener máximo dos palabras',
  })
  @ApiProperty({
    required: false,
    example: 'Juan',
    description:
      'Filtrar recetas por nombre o apellido del creador (máximo dos palabras)',
  })
  creatorName?: string;

  //Fecha desde
  @IsOptional()
  @IsDateString({}, { message: 'fromDate debe ser una fecha válida' })
  @ApiProperty({
    required: false,
    example: 'AAAA-MM-DD',
    description: 'Filtrar recetas creadas desde esta fecha',
  })
  fromDate?: string;

  //Fecha hasta
  @IsOptional()
  @IsDateString({}, { message: 'toDate debe ser una fecha válida' })
  @ApiProperty({
    required: false,
    example: 'AAAA-MM-DD',
    description: 'Filtrar recetas creadas hasta esta fecha',
  })
  toDate?: string;

  //Orden por fecha
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'orderByDate debe ser asc o desc',
  })
  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Ordenar recetas por fecha de creación',
  })
  orderByDate?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Número de página empezando en 1',
  })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({
    required: false,
    example: 5,
    description: 'Cantidad de resultados por página',
  })
  limit?: number;
}
