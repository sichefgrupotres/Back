import { ApiProperty } from '@nestjs/swagger';
import { PostResponseDto } from './post-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class PaginatedPostResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  data: PostResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
