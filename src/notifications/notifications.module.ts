import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
})
export class NotificationsModule {}
