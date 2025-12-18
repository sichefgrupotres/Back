import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  description: string;

  // @Column({
  //   type: 'text',
  //   nullable: true,
  // })
  // imagen: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //Posts N:1 Users
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}
