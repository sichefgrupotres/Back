import { PostStatus } from '../../../posts/dto/create-post.dto';
import { ModerationResult } from './result.interface';

export interface ModerationResultGlobal {
  statusPost: PostStatus;
  alertMessage: string;
  results: ModerationResult[];
}
