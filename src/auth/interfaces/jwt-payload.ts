export interface ApiJwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
}
