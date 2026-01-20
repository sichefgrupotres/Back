export class PostEvent {
  constructor(
    public readonly title: string,
    public readonly imageUrl: string,
    public readonly email: string,
    public readonly moderationCategory?:
      | 'VIOLENCE'
      | 'SEXUAL'
      | 'INSULTO'
      | 'NONE',
    public readonly recipeCategory?: string,
  ) {}
}
