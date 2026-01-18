import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('tutorials')
export class Tutorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  videoUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'jsonb', default: [] })
  ingredients: Array<{ title: string; description?: string }>;

  @Column({ type: 'jsonb', default: [] })
  steps: Array<{ description: string }>;

  @ManyToOne(() => Post, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipeId' })
  recipe: Post;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
