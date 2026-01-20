import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum SubscriptionStatus {
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum SubscriptionPlan {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stripe_subscription_id', unique: true })
  stripeSubscriptionId: string;

  @Column({ name: 'stripe_price_id' })
  stripePriceId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INCOMPLETE,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
  })
  plan: SubscriptionPlan;

  @Column({ name: 'current_period_start', type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
