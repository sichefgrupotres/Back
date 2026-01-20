import { IsString, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTutorialDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsUUID()
  recipeId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @IsArray()
  ingredients: Array<{ title: string; description?: string }>;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        description: { type: 'string' },
      },
    },
  })
  @IsArray()
  steps: Array<{ description: string }>;
}
