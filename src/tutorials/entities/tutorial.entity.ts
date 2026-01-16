import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tutorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('text')
  ingredients: string;

  @Column('text')
  steps: string;

  @Column()
  videoUrl: string;

  @ManyToOne(() => Post, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  recipe: Post;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
