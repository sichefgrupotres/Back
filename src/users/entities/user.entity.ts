import { Exclude } from 'class-transformer';
import { Post } from 'src/posts/entities/post.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
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
  ADMIN = 'ADMIN',
  USER = 'USER',
  CREATOR = 'CREATOR',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name?: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastname?: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  @Exclude()
  password?: string | null;

  @Column({
    name: 'roleId',
    type: 'enum',
    enum: Role,
    nullable: false,
    default: Role.USER,
  })
  roleId?: Role;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status?: UserStatus;

  @Column({ name: 'stripe_customer_id', unique: true, nullable: true })
  stripeCustomerId?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  seedKey?: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider | null;

  @Column({
    default: false,
  })
  blocked: boolean;

  @Column({ nullable: true })
  avatarUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];
}
