import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
} from './entities/subscription.entity';

@Injectable()
export class SubscriptionsRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    try {
      return await this.subscriptionRepository.findOne({
        where: { stripeSubscriptionId },
        relations: ['user'],
      });
    } catch {
      throw new InternalServerErrorException(
        'Error al buscar suscripción por Stripe ID',
      );
    }
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    try {
      return await this.subscriptionRepository.findOne({
        where: [
          { userId, status: SubscriptionStatus.ACTIVE },
          { userId, status: SubscriptionStatus.TRIALING },
          { userId, status: SubscriptionStatus.PAST_DUE },
        ],
        relations: ['user'],
      });
    } catch {
      throw new InternalServerErrorException(
        'Error al buscar suscripción activa',
      );
    }
  }

  async findAllByUserId(userId: string): Promise<Subscription[]> {
    try {
      return await this.subscriptionRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        relations: ['user'],
      });
    } catch {
      throw new InternalServerErrorException(
        'Error al obtener suscripciones del usuario',
      );
    }
  }

  async upsert(data: {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date;
    userId: string;
  }): Promise<Subscription> {
    try {
      let subscription = await this.subscriptionRepository.findOne({
        where: { stripeSubscriptionId: data.stripeSubscriptionId },
      });

      if (subscription) {
        await this.subscriptionRepository.update(subscription.id, data);

        const updatedSubscription = await this.subscriptionRepository.findOne({
          where: { id: subscription.id },
          relations: ['user'],
        });

        if (!updatedSubscription) {
          throw new InternalServerErrorException(
            'No se pudo recuperar la suscripción actualizada',
          );
        }

        return updatedSubscription;
      } else {
        subscription = this.subscriptionRepository.create(data);
        return await this.subscriptionRepository.save(subscription);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        'Error al guardar suscripción: ' + message,
      );
    }
  }

  // Actualizar estado de suscripción
  async updateStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
  ): Promise<void> {
    try {
      const result = await this.subscriptionRepository.update(subscriptionId, {
        status,
        ...(status === SubscriptionStatus.CANCELED && {
          canceledAt: new Date(),
        }),
      });

      if (result.affected === 0) {
        throw new NotFoundException('Suscripción no encontrada');
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar estado');
    }
  }

  async updateCancelAtPeriodEnd(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean,
  ): Promise<void> {
    try {
      const result = await this.subscriptionRepository.update(subscriptionId, {
        cancelAtPeriodEnd,
      });

      if (result.affected === 0) {
        throw new NotFoundException('Suscripción no encontrada');
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar cancelación');
    }
  }
}
