import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { Post } from 'src/posts/entities/post.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UploadImagenClou } from 'src/services/uploadImage';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post]), NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UploadImagenClou],
  exports: [UsersService, UsersRepository, TypeOrmModule],
})
export class UsersModule {}
