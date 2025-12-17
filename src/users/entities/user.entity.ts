import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/entities/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum Genero {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  NO_BINARIO = 'no_binario',
  NO_RESPONDER = 'no_responder',
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  CREATOR = 'creator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  lastname: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  @Exclude()
  password: string;

  @Column({
    name: 'roleId',
    type: 'enum',
    enum: Role,
    nullable: false,
    default: Role.USER,
  })
  roleId: Role;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.creator)
  posts: [];
}
