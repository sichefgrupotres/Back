import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service'; // Importa tu servicio
import { AuthRequest } from 'src/auth/interfaces/auth-request.interfaces';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const activeSub =
      await this.subscriptionsService.getUserActiveSubscription(userId);

    if (!activeSub) {
      throw new ForbiddenException(
        'Este contenido requiere suscripción Premium. Suscríbete para acceder.',
      );
    }

    if (activeSub.status === 'past_due') {
      request['premiumWarning'] =
        'Hay un problema con tu método de pago. Actualízalo para mantener el acceso premium.';
    }

    request['subscription'] = activeSub;

    return true;
  }
}
