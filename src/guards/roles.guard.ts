import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 1. Verificación Clásica (¿Tiene el rol exacto?)
    const hasRole = requiredRoles.includes(user.role || user.roleId);

    // 2. 👇 LA MAGIA: Si se requiere 'PREMIUM' y el usuario tiene isPremium=true, ¡PASA!
    const isPremiumAllowed = requiredRoles.includes('PREMIUM') && user.isPremium === true;

    // 3. También dejamos pasar a ADMIN o CREATOR si la ruta pide PREMIUM (opcional, pero recomendado)
    const isAdminOrCreator = (user.role === 'ADMIN' || user.role === 'CREATOR') && requiredRoles.includes('PREMIUM');

    return hasRole || isPremiumAllowed || isAdminOrCreator;
  }
}