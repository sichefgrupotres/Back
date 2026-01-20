import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  // JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostCategory } from '../enums/post-category.enum';
import { Favorite } from 'src/favorites/entities/favorite.entity';

export enum Difficulty {
  facil = 'facil',
  medio = 'medio',
  dificil = 'dificil',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  imageUrl: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  cloudinaryId?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  ingredients: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isPremium: boolean;

  @Column({
    type: 'enum',
    enum: Difficulty,
    nullable: true,
    default: Difficulty.facil,
  })
  difficulty: Difficulty;

  @Column({
    type: 'enum',
    enum: PostCategory,
    array: true,
  })
  category: PostCategory[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  seedKey?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //Posts N:1 Users
  // @ManyToOne(() => User, (user) => user.posts)
  // @JoinColumn({ name: 'creator_id' })
  // creator: User;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  creator: User;

  @OneToMany(() => Favorite, (favorite) => favorite.post)
  favoritedBy: Favorite[];
}
