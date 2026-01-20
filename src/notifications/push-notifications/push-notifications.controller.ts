/* eslint-disable */
import { Controller, Post, Get, Body } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
    constructor(private readonly pushNotificationsService: PushNotificationsService) {
        console.log('🎯 PushNotificationsController inicializado');
    }

    @Get('vapid-public-key')
    getVapidPublicKey() {
        return {
            publicKey: this.pushNotificationsService.getVapidPublicKey()
        };
    }

    @Post('subscribe')
    async subscribe(@Body() body: { subscription: any; userEmail: string }) {
        console.log(`📥 Nueva suscripción recibida para: ${body.userEmail}`);
        await this.pushNotificationsService.saveSubscription(
            body.userEmail,
            body.subscription
        );
        return { success: true };
    }

    @Post('unsubscribe')
    async unsubscribe(@Body() body: { userEmail: string }) {
        console.log(`📥 Desuscripción recibida para: ${body.userEmail}`);
        await this.pushNotificationsService.removeSubscription(body.userEmail);
        return { success: true };
    }
}