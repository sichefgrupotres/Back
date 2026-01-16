import { IsString, IsUUID } from 'class-validator';

export class CreateTutorialDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUUID()
  recipeId: string;

  @IsString()
  ingredients: string;

  @IsString()
  steps: string;
}
