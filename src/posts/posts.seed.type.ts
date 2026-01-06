import { Difficulty } from './entities/post.entity';

export type PostSeed = {
  seedKey: string;
  title: string;
  description: string;
  ingredients: string;
  difficulty: Difficulty;
  isPremium: boolean;
  imageUrl: string;
  creatorSeedKey: string;
};
