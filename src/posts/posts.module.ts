import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsRepository } from './posts.repository';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryConfig } from 'src/config/cloudinary';
import { UploadImagenClou } from 'src/services/uploadImage';
import { ModerationModule } from 'src/modules/moderation/moderation.module';
import { PostModerationService } from 'src/modules/moderationPost/post-moderation.service';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { Favorite } from 'src/favorites/entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Favorite]),
    AuthModule,
    FavoritesModule,
    ModerationModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    CloudinaryConfig,
    UploadImagenClou,
    ModerationModule,
    PostModerationService,
  ],
  exports: [PostsService],
})
export class PostsModule {}
