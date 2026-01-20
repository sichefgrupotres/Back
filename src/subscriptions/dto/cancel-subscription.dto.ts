import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelSubscriptionDto {
  @ApiProperty({
    example: false,
    description:
      'Si es true, cancela inmediatamente. Si es false, cancela al final del período',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  immediately?: boolean;
}
