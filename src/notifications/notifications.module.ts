import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendgridProvider } from '../notifications/sengrid.provider';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [NotificationsService, SendgridProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
