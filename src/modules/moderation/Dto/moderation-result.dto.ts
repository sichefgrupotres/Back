export interface ModerationResult {
  status: 'SAFE' | 'BLOCKED' | 'NEEDS_REVIEW';
  category: 'VIOLENCE' | 'RACISM' | 'SEXUAL' | 'OTHER' | 'NONE';
  reasons: string[];
  source: 'TEXT' | 'IMAGE';
}
