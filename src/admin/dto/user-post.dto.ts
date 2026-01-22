export class UserPostsDto {
  username: string;
  posts: { date: string; count: number }[];
}
