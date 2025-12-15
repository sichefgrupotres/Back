import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  título: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'La descripción no puede superar los 100 caracteres',
  })
  descripción: string;

  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  imagen: string;
}
