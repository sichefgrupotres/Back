import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiJwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: jwtFromRequest as unknown as (
        req: Request,
      ) => string | null,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: ApiJwtPayload): ApiJwtPayload {
    console.log('Payload JWT:', payload);
    return payload;
  }
}
