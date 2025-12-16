import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(post: CreatePostDto, user: User): Promise<Post> {
    if (!user) {
      throw new BadRequestException('Usuario no válido');
    }
    const newPost = this.postsRepository.create({
      ...post,
      creator: user,
    });
    return await this.postsRepository.save(newPost);
  }
}
