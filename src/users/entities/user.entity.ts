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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  apellido: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  fechaDeNacimiento: Date;

  @Column({
    type: 'enum',
    enum: Genero,
    default: Genero.NO_RESPONDER,
  })
  genero: Genero;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nacionalidad: string;

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
  password: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatarUrl: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  ciudad: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  paisDeResidencia: string;

  @Column({ name: 'role_id' })
  roleId: number;

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
