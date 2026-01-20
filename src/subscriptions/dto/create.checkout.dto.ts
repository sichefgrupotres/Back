import { IsEnum, IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Plan de suscripción',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  plan: SubscriptionPlan;

  @ApiProperty({
    description: 'URL de éxito',
    example: 'http://localhost:3000/subscription/success',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: 'successUrl must be a valid URL starting with http:// or https://',
  })
  successUrl: string;

  @ApiProperty({
    description: 'URL de cancelación',
    example: 'http://localhost:3000/subscription/cancel',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: 'cancelUrl must be a valid URL starting with http:// or https://',
  })
  cancelUrl: string;
}
