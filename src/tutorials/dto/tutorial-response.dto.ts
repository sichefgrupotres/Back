import { ApiProperty } from '@nestjs/swagger';

export class TutorialResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  videoUrl: string;

  @ApiProperty()
  thumbnailUrl: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  ingredients: Array<{ title: string; description?: string }>;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  steps: Array<{ description: string }>;

  @ApiProperty()
  recipe: {
    id: string;
    title: string;
  };

  @ApiProperty()
  user: {
    id: string;
    email: string;
  };
}
