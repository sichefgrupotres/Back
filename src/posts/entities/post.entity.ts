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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  titulo: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  descripcion: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  imagen: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //Posts N:1 Users
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}
