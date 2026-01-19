import { ApiProperty } from '@nestjs/swagger';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../entities/subscription.entity';

export class SubscriptionResponseDto {
  @ApiProperty({ enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty()
  period: { start: Date; end: Date };

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiProperty()
  userId: string;
  @ApiProperty({
    description: 'Correo electrónico del usuario (extraído de la relación)',
    example: 'pablo@example.com',
  })
  userEmail: string;
}
