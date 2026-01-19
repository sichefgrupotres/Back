import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Nuevo plan de suscripción',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.YEARLY,
  })
  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  plan: SubscriptionPlan;
}
