import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { NotificationsService } from './notifications.service';
import { SendgridProvider } from './sengrid.provider';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [NotificationsService, SendgridProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
