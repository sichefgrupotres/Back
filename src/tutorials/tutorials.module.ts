import { Module } from '@nestjs/common';
import { TutorialsService } from './tutorials.service';
import { TutorialsController } from './tutorials.controller';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutorial } from './entities/tutorial.entity';
import { UploadVideoCloud } from 'src/services/uploadVideo';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tutorial, Post, User])],
  controllers: [TutorialsController],
  providers: [TutorialsService, UploadVideoCloud],
})
export class TutorialsModule {}
