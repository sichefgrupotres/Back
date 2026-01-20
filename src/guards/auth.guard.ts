import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Se requiere un Token');
    }

    try {
      const secret = process.env.JWT_SECRET;

      const payload = this.jwtService.verify<JwtPayload>(token, { secret });

      if (!payload.exp) {
        throw new UnauthorizedException('Token sin expiración');
      }

      const expDate = new Date(payload.exp * 1000);

      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        expReadable: expDate.toLocaleString('es-AR'),
      };
      return true;
    } catch {
      throw new UnauthorizedException('Error al validar el token');
    }
  }
}
