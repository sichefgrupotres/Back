import { Difficulty } from './entities/post.entity';
import { PostCategory } from './enums/post-category.enum';

export type PostSeed = {
  seedKey: string;
  title: string;
  description: string;
  ingredients: string;
  difficulty: Difficulty;
  isPremium: boolean;
  imageUrl: string;
  category: PostCategory;
  creatorSeedKey: string;
};
