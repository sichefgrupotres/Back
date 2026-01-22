import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionsRepository } from './subscriptions.repository';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
} from './entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create.checkout.dto';
import { SubscriptionWithDetails } from './interfaces/SubscriptionWithDetails';
import { ActiveSubscriptionResponseDto } from './dto/ActiveSubscriptionResponseDto';
import { SubscriptionResponseDto } from './dto/subscriptionResponseDto';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>(
      'STRIPE_SECRET_KEY',
      '',
    );

    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutDto) {
    const existingSub =
      await this.subscriptionsRepository.findActiveByUserId(userId);
    if (
      existingSub &&
      (existingSub.status === SubscriptionStatus.ACTIVE ||
        existingSub.status === SubscriptionStatus.TRIALING ||
        existingSub.status === SubscriptionStatus.PAST_DUE)
    ) {
      this.logger.warn(`Usuario ${userId} intentó duplicar suscripción.`);
      throw new BadRequestException(
        'Ya tienes una suscripción activa o en periodo de prueba',
      );
    }
    const customerId = await this.getOrCreateCustomer(userId);
    const priceId = this.getPriceIdForPlan(dto.plan);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
        metadata: {
          userId,
          plan: dto.plan,
        },
      },
      payment_method_collection: 'always',
    });
    this.logger.log(
      `Checkout session creada para usuario ${userId}: ${session.id}`,
    );
    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      this.logger.warn(
        `Sesión de checkout ${session.id} no contiene una suscripción.`,
      );
      return;
    }

    this.logger.log(`Finalizando checkout para suscripción: ${subscriptionId}`);

    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    return await this.handleSubscriptionEvent(subscription);
  }

  async handleSubscriptionEvent(
    stripeSubscription: Stripe.Subscription,
  ): Promise<Subscription> {
    const userId = stripeSubscription.metadata.userId;
    const stripeData = stripeSubscription as unknown as SubscriptionWithDetails;
    if (!stripeData.items?.data?.[0]) {
      this.logger.error(
        `Items faltantes en suscripción ${stripeSubscription.id}`,
      );
      throw new BadRequestException('Items faltantes en la suscripción');
    }

    const subscriptionItem = stripeData.items.data[0];

    if (
      !subscriptionItem.current_period_start ||
      !subscriptionItem.current_period_end
    ) {
      this.logger.error(
        `Fechas de período faltantes en suscripción ${stripeSubscription.id}`,
      );
      throw new BadRequestException(
        'Fechas de período faltantes en la suscripción',
      );
    }
    if (!userId) {
      throw new BadRequestException('userId no encontrado en metadata');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const subscriptionData = {
      stripeSubscriptionId: stripeSubscription.id,

      stripePriceId: subscriptionItem.price.id,
      status: stripeSubscription.status as SubscriptionStatus,
      plan:
        (stripeData.metadata.plan as SubscriptionPlan) ||
        SubscriptionPlan.MONTHLY,
      currentPeriodStart: new Date(
        subscriptionItem.current_period_start * 1000,
      ),
      currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      ...(stripeData.canceled_at && {
        canceledAt: new Date(stripeData.canceled_at * 1000),
      }),
      userId: userId,
    };

    const savedSubscription = await this.subscriptionsRepository.upsert(
      subscriptionData as any,
    );

    const premiumStatuses = ['active', 'trialing', 'past_due'];
    const isPremium = premiumStatuses.includes(stripeSubscription.status);

    await this.userRepository.update(userId, { isPremium: isPremium });

    this.logger.log(
      ` Usuario ${userId} actualizado automáticamente -> isPremium: ${isPremium} (Estado Stripe: ${stripeSubscription.status})`,
    );

    this.logger.log(
      `Suscripción ${stripeSubscription.id} actualizada - Status: ${stripeSubscription.status}`,
    );

    if (stripeSubscription.status === 'unpaid') {
      this.logger.warn(
        `Suscripción ${stripeSubscription.id} pasó a UNPAID tras 4 reintentos fallidos`,
      );
      await this.cancelSubscriptionDueToNonPayment(stripeSubscription.id);
    }
    return savedSubscription;
  }

  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.name || ''} ${user.lastname || ''}`.trim(),
      metadata: { userId: user.id },
    });

    await this.userRepository.update(userId, {
      stripeCustomerId: customer.id,
    });
    this.logger.log(
      `Cliente de Stripe creado para usuario ${userId}: ${customer.id}`,
    );
    return customer.id;
  }

  private getPriceIdForPlan(plan: SubscriptionPlan): string {
    const priceId = this.configService.get<string>(
      plan === SubscriptionPlan.MONTHLY
        ? 'STRIPE_PRICE_ID_MONTHLY'
        : 'STRIPE_PRICE_ID_YEARLY',
    );
    if (!priceId) {
      throw new BadRequestException(
        `Price ID no configurado para el plan ${plan}`,
      );
    }

    return priceId;
  }

  async getUserActiveSubscription(
    userId: string,
  ): Promise<ActiveSubscriptionResponseDto | null> {
    const subscription =
      await this.subscriptionsRepository.findActiveByUserId(userId);

    if (!subscription) {
      return null;
    }

    return {
      plan: subscription.plan,
      status: subscription.status as 'active' | 'trialing' | 'past_due',
      period: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
      },
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }

  async getAllSubscriptionsForAdmin(): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptionsRepository.findAllForAdmin();
    return subscriptions.map((sub) => {
      return {
        plan: sub.plan,
        status: sub.status,
        period: {
          start: sub.currentPeriodStart,
          end: sub.currentPeriodEnd,
        },
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        userEmail: sub.user?.email || 'Email no disponible',
        userId: sub.userId,
        createdAt: sub.createdAt,
      };
    });
  }

  private async cancelSubscriptionDueToNonPayment(
    stripeSubscriptionId: string,
  ): Promise<void> {
    const context = `Cancel-${stripeSubscriptionId.slice(-6)}`;

    try {
      this.logger.warn('Cancelando suscripción por falta de pago', context);

      const subscription =
        await this.subscriptionsRepository.findByStripeSubscriptionId(
          stripeSubscriptionId,
        );

      if (!subscription) {
        this.logger.error(
          'Suscripción no encontrada en BD',
          undefined,
          context,
        );
        return;
      }

      await this.stripe.subscriptions
        .cancel(stripeSubscriptionId)
        .catch((err: unknown) => {
          if (
            err &&
            typeof err === 'object' &&
            'code' in err &&
            err.code === 'resource_missing'
          ) {
            this.logger.warn('Ya cancelada en Stripe', context);
          } else {
            throw err;
          }
        });

      await this.subscriptionsRepository.updateStatus(
        subscription.id,
        SubscriptionStatus.CANCELED,
      );

      await this.userRepository.update(subscription.userId, {
        isPremium: false,
      });

      this.logger.log('Cancelación completada', context);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Error en cancelación: ${message}`, stack, context);
    }
  }

  async cancelSubscription(userId: string, immediately = false) {
    const subscription =
      await this.subscriptionsRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw new NotFoundException('Suscripción activa no encontrada');
    }

    if (immediately) {
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      await this.userRepository.update(userId, { isPremium: false });
    } else {
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        },
      );

      await this.subscriptionsRepository.updateCancelAtPeriodEnd(
        subscription.id,
        true,
      );
    }

    return { message: 'Suscripción cancelada correctamente' };
  }

  async updateSubscriptionPlan(
    userId: string,
    newPlan: SubscriptionPlan,
  ): Promise<{ message: string; currentPlan: string }> {
    const subscription =
      await this.subscriptionsRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw new NotFoundException('No tienes una suscripción activa');
    }

    if (subscription.plan === newPlan) {
      throw new BadRequestException('Ya tienes este plan activo');
    }

    const newPriceId = this.getPriceIdForPlan(newPlan);

    try {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );

      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: 'none',
          metadata: {
            userId,
            plan: newPlan,
          },
        },
      );

      this.logger.log(
        `Plan actualizado en Stripe para usuario ${userId}: ${subscription.plan} → ${newPlan}`,
      );

      return {
        message: `Solicitud de cambio de plan enviada. El cambio se reflejará cuando Stripe lo confirme.`,
        currentPlan: newPlan,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error al actualizar plan en Stripe: ${errorMessage}`,
        errorStack,
      );
      throw new BadRequestException(
        `No se pudo actualizar el plan: ${errorMessage}`,
      );
    }
  }
}
