/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('push_subscriptions')
export class PushSubscription {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index() // Para búsquedas rápidas por email
    userEmail: string;

    @Column('jsonb') // Guarda el objeto de suscripción completo
    subscription: any;

    @CreateDateColumn()
    createdAt: Date;
}