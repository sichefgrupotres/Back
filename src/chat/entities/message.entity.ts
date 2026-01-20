/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('messages')
@Index(['room', 'createdAt']) // Índice compuesto para búsquedas rápidas
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column()
    senderName: string;

    @Column()
    @Index() // Índice para búsquedas por email
    senderEmail: string;

    @Column({ default: 'general' })
    @Index() // Índice para búsquedas por sala
    room: string;

    @CreateDateColumn()
    createdAt: Date;
}