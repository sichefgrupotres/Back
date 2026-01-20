import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '../entities/post.entity';
import { PostCategory } from '../enums/post-category.enum';

export class PostResponseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  ingredients: string;

  @ApiProperty({ enum: Difficulty })
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Indica si el post es premium',
    example: false,
  })
  isPremium: boolean;

  @ApiProperty({
    description: 'Nombre del creador del post',
    example: 'Federico Ferrer',
  })
  creatorName: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enum: PostCategory })
  category: PostCategory[];
}
