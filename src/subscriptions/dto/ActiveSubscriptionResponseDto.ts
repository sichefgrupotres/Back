import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class ActiveSubscriptionResponseDto {
  @ApiProperty({
    description: 'Plan de suscripción activo',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'Estado de la suscripción',
    enum: ['active', 'trialing', 'past_due'],
    example: 'active',
  })
  status: 'active' | 'trialing' | 'past_due';

  @ApiProperty({
    description: 'Período de facturación actual',
    example: {
      start: '2026-01-16T15:45:52.000Z',
      end: '2026-02-16T15:45:52.000Z',
    },
  })
  period: {
    start: Date;
    end: Date;
  };

  @ApiProperty({
    description:
      'Indica si la suscripción está programada para cancelarse al final del período',
    example: false,
  })
  cancelAtPeriodEnd: boolean;
}
