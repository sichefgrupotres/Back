import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'fromDate no puede ser mayor que toDate' })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
