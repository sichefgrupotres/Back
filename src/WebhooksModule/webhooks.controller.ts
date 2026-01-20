import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { InvoiceWithSubscription } from 'src/WebhooksModule/interfaces/InvoiceWithSubscription';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private stripe: Stripe;
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private configService: ConfigService,
    private subscriptionsService: SubscriptionsService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-12-15.clover',
      },
    );
  }

  @ApiOperation({
    summary: 'Webhook de Stripe',
    description: 'Endpoint para recibir eventos de Stripe',
  })
  @ApiExcludeEndpoint()
  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    if (!req.rawBody) {
      this.logger.error('Raw body is missing from request');
      throw new BadRequestException('Invalid request body');
    }
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const stack = err instanceof Error ? err.stack : undefined;

      this.logger.error(
        `Webhook signature verification failed: ${message}`,
        stack,
      );
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.log(`Webhook received: ${event.type}`);

    // Manejar diferentes eventos
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          await this.handleSubscriptionUpdate(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object;
          await this.handleInvoicePaid(invoice);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          await this.handlePaymentFailed(invoice);
          break;
        }

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const stack = err instanceof Error ? err.stack : undefined;

      this.logger.error(
        `Webhook signature verification failed: ${message}`,
        stack,
      );
      throw new BadRequestException('Webhook signature verification failed');
    }

    return { received: true };
  }

  // HANDLERS DE EVENTOS
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const context = `Sub-${subscription.id.slice(-6)}`;

    this.logger.log(`Processing subscription update`, context);
    this.logger.log(`Status: ${subscription.status}`, context);
    this.logger.log(`User ID: ${subscription.metadata.userId}`, context);

    await this.subscriptionsService.handleSubscriptionEvent(subscription);

    // Logs según estado
    if (subscription.status === 'trialing' && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end * 1000);
      this.logger.log(
        `Usuario en trial hasta ${trialEnd.toLocaleDateString('es-AR')}`,
        context,
      );
    } else if (subscription.status === 'active') {
      this.logger.log('Suscripción activa', context);
    } else if (subscription.status === 'past_due') {
      this.logger.warn('Suscripción en período de gracia (PAST_DUE)', context);
    } else if (subscription.status === 'unpaid') {
      this.logger.warn(
        'Suscripción UNPAID - Se cancelará automáticamente',
        context,
      );
    }

    this.logger.log('Subscription updated successfully', context);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const context = `Sub-${subscription.id.slice(-6)}`;
    this.logger.log('Processing subscription deletion', context);
    this.logger.log(`User ID: ${subscription.metadata.userId}`, context);

    await this.subscriptionsService.handleSubscriptionEvent(subscription);

    this.logger.log('Subscription deleted successfully', context);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const context = `Inv-${invoice.id.slice(-6)}`;
    const invoiceData = invoice as unknown as InvoiceWithSubscription;
    this.logger.log('Invoice paid', context);
    this.logger.log(
      `Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`,
      context,
    );
    this.logger.log(`Subscription: ${invoiceData.subscription}`, context);

    try {
      if (invoiceData.subscription) {
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          invoiceData.subscription,
        );

        await this.subscriptionsService.handleSubscriptionEvent(
          stripeSubscription,
        );

        this.logger.log(
          'Invoice paid handled - Subscription updated to ACTIVE',
          context,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Error processing webhook: ${message}`, stack, context);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const context = `Inv-${invoice.id.slice(-6)}`;
    const invoiceData = invoice as unknown as InvoiceWithSubscription;

    this.logger.warn('Payment failed', context);
    this.logger.log(
      `Amount: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`,
      context,
    );
    this.logger.log(`Subscription: ${invoiceData.subscription}`, context);
    this.logger.log(`Attempt count: ${invoice.attempt_count}`, context);

    try {
      if (!invoiceData.subscription) {
        this.logger.warn('No hay suscripcion asociada a esa invoice', context);
        return;
      }

      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        invoiceData.subscription,
      );

      // Actualiza en DB (pasará a past_due)
      await this.subscriptionsService.handleSubscriptionEvent(
        stripeSubscription,
      );

      const userId = stripeSubscription.metadata.userId;

      if (userId) {
        const nextRetry = invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleString(
              'es-AR',
            )
          : 'N/A';

        this.logger.warn(
          `Usuario ${userId} - Pago fallido | ` +
            `Estado: ${stripeSubscription.status.toUpperCase()} | ` +
            `Intento: ${invoice.attempt_count} de 4 | ` +
            `Monto: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()} | ` +
            `Próximo reintento: ${nextRetry}`,
          context,
        );

        if (stripeSubscription.status === 'past_due') {
          this.logger.log(
            'Usuario mantiene acceso premium (período de gracia)',
            context,
          );
        }
      }

      this.logger.log(
        'Payment failed handled - Usuario en período de gracia',
        context,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Error processing webhook: ${message}`, stack, context);
    }
  }
}
