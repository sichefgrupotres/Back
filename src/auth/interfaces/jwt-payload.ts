export interface ApiJwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  isPremium?: boolean; // 👈 Agrega esto si no está
}
