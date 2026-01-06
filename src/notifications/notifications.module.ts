import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendgridProvider } from '../notifications/sengrid.provider';

@Module({
  providers: [NotificationsService, SendgridProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
