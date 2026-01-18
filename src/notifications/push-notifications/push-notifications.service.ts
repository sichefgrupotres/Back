/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushNotificationsService {
    constructor(
        @InjectRepository(PushSubscription)
        private readonly pushSubscriptionRepository: Repository<PushSubscription>,
    ) {
        console.log('🎯 PushNotificationsService inicializado');

        const vapidKeys = {
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY
        };

        if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
            console.warn('⚠️ VAPID keys no configuradas. Push notifications deshabilitadas.');
            console.log('VAPID_PUBLIC_KEY:', vapidKeys.publicKey ? 'EXISTE' : 'NO EXISTE');
            console.log('VAPID_PRIVATE_KEY:', vapidKeys.privateKey ? 'EXISTE' : 'NO EXISTE');
            return;
        }

        webpush.setVapidDetails(
            `mailto:${process.env.VAPID_EMAIL || 'noreply@sichef.com'}`,
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );

        console.log('✅ Web Push configurado correctamente');
    }

    getVapidPublicKey(): string {
        return process.env.VAPID_PUBLIC_KEY || '';
    }

    async saveSubscription(userEmail: string, subscription: any) {
        const normalizedEmail = userEmail.toLowerCase();

        // Buscar si ya existe una suscripción para este usuario
        const existing = await this.pushSubscriptionRepository.findOne({
            where: { userEmail: normalizedEmail }
        });

        if (existing) {
            // Actualizar la suscripción existente
            existing.subscription = subscription;
            await this.pushSubscriptionRepository.save(existing);
            console.log(`🔄 Suscripción actualizada para: ${userEmail}`);
        } else {
            // Crear nueva suscripción
            const newSubscription = this.pushSubscriptionRepository.create({
                userEmail: normalizedEmail,
                subscription
            });
            await this.pushSubscriptionRepository.save(newSubscription);
            console.log(`✅ Suscripción guardada para: ${userEmail}`);
        }
    }

    async removeSubscription(userEmail: string) {
        const normalizedEmail = userEmail.toLowerCase();
        await this.pushSubscriptionRepository.delete({ userEmail: normalizedEmail });
        console.log(`❌ Suscripción eliminada para: ${userEmail}`);
    }

    async sendPushNotification(
        userEmail: string,
        title: string,
        body: string,
        icon?: string,
        url?: string
    ) {
        const normalizedEmail = userEmail.toLowerCase();

        // Buscar la suscripción en la BD
        const subscriptionRecord = await this.pushSubscriptionRepository.findOne({
            where: { userEmail: normalizedEmail }
        });

        if (!subscriptionRecord) {
            console.log(`⚠️ No hay suscripción para: ${userEmail}`);
            return false;
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/chef-avatar.jpg',
            url: url || '/chat',
            sender: title
        });

        try {
            await webpush.sendNotification(subscriptionRecord.subscription, payload);
            console.log(`📤 Push enviado a: ${userEmail}`);
            return true;
        } catch (error: any) {
            console.error(`❌ Error enviando push a ${userEmail}:`, error.message);

            // Si la suscripción expiró, eliminarla
            if (error.statusCode === 410 || error.statusCode === 404) {
                await this.pushSubscriptionRepository.delete({ userEmail: normalizedEmail });
                console.log(`🗑️ Suscripción expirada eliminada: ${userEmail}`);
            }

            return false;
        }
    }
}