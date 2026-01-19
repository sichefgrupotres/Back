import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto } from './dto/create.checkout.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import type { AuthRequest } from 'src/auth/interfaces/auth-request.interfaces';
import { ActiveSubscriptionResponseDto } from './dto/ActiveSubscriptionResponseDto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SubscriptionResponseDto } from './dto/subscriptionResponseDto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({
    summary: 'Crear sesión de checkout para suscripción',
    description:
      'Crea una sesión de Stripe Checkout para que el usuario se suscriba',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Sesión de checkout creada exitosamente',
    schema: {
      example: {
        sessionId: 'cs_test_xxxxx',
        url: 'https://checkout.stripe.com/c/pay/cs_test_xxxxx',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o plan no configurado',
  })
  @UseGuards(AuthGuard)
  @Post('create-checkout')
  createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    return this.subscriptionsService.createCheckoutSession(
      userId,
      createCheckoutDto,
    );
  }

  @ApiOperation({
    summary: 'Obtener suscripción activa del usuario',
    description: 'Retorna la suscripción activa del usuario autenticado',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Suscripción activa encontrada' })
  @ApiNotFoundResponse({ description: 'No se encontró suscripción activa' })
  @UseGuards(AuthGuard)
  @Get('active')
  getActiveSubscription(
    @Req() req: AuthRequest,
  ): Promise<ActiveSubscriptionResponseDto | null> {
    return this.subscriptionsService.getUserActiveSubscription(req.user.userId);
  }

  @ApiOperation({ summary: 'Obtener todas las suscripciones (Admin)' })
  @UseGuards(AuthGuard)
  @Get('admin/all')
  async getAllSubscriptions(): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionsService.getAllSubscriptionsForAdmin();
  }

  @ApiOperation({
    summary: 'Actualizar plan de suscripción',
    description:
      'Cambia el plan entre mensual y anual. El cambio se aplicará al finalizar el período actual.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Plan actualizado correctamente',
    schema: {
      example: {
        message:
          'Plan actualizado exitosamente. El cambio será efectivo al finalizar tu período actual.',
        currentPlan: 'yearly',
        newPeriodEnd: '2026-02-16T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'No se encontró suscripción activa' })
  @ApiBadRequestResponse({
    description: 'Plan inválido o mismo plan actual',
  })
  @UseGuards(AuthGuard)
  @Put('update')
  @HttpCode(HttpStatus.OK)
  updatePlan(
    @Body() updateDto: UpdateSubscriptionDto,
    @Req() req: AuthRequest,
  ) {
    return this.subscriptionsService.updateSubscriptionPlan(
      req.user.userId,
      updateDto.plan,
    );
  }

  @ApiOperation({
    summary: 'Cancelar suscripción',
    description: 'Cancela la suscripción activa del usuario',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Suscripción cancelada correctamente' })
  @ApiNotFoundResponse({ description: 'No se encontró suscripción activa' })
  @UseGuards(AuthGuard)
  @Delete('cancel')
  @HttpCode(HttpStatus.OK)
  cancelSubscription(
    @Body() cancelDto: CancelSubscriptionDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.userId;
    return this.subscriptionsService.cancelSubscription(
      userId,
      cancelDto.immediately ?? false,
    );
  }
}
