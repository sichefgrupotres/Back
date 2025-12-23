import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

export const jwtFromAuthHeaderBearer: JwtFromRequestFunction<string> = (
  req: unknown,
): string | null => {
  if (!req || typeof req !== 'object') {
    return null;
  }

  const request = req as Request;

  const authHeader = request.headers?.authorization;

  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(' ');

  if (type.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};
