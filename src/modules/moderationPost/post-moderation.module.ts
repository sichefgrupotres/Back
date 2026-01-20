import { Module } from '@nestjs/common';
import { PostModerationService } from './post-moderation.service';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [ModerationModule],
  providers: [PostModerationService],
})
export class PostModule {}
