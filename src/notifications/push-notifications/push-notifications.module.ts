/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- 1. Importar esto
import { PushNotificationsController } from './push-notifications.controller';
import { PushNotificationsService } from './push-notifications.service';
import { PushSubscription } from './entities/push-subscription.entity'; // <--- 2. Importar tu entidad

@Module({
    imports: [
        // 👇 Esto crea el repositorio que tu servicio está pidiendo
        TypeOrmModule.forFeature([PushSubscription])
    ],
    controllers: [PushNotificationsController],
    providers: [PushNotificationsService],
    exports: [PushNotificationsService],
})
export class PushNotificationsModule { }