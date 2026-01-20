import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { Post } from 'src/posts/entities/post.entity';
import { UploadImagenClou } from 'src/services/uploadImage';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post]),
    forwardRef(() => NotificationsModule), // ✅ AQUÍ
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UploadImagenClou],
  exports: [UsersService, UsersRepository, TypeOrmModule],
})
export class UsersModule {}
