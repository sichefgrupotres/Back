import { PostStatus } from '../../../posts/dto/create-post.dto';

export interface ModerationResult {
  status: PostStatus;
  category: 'VIOLENCE' | 'SEXUAL' | 'INSULTO' | 'NONE';
  source: 'TEXT' | 'IMAGE';
  cleanText?: string;
  originalText?: string;
}
