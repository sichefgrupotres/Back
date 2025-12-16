import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async create(post: CreatePostDto, user: User) {
    const postCreated = await this.postsRepository.create(post, user);
    if (!postCreated) return 'Error al crear el post';
    return 'post creado con éxito';
  }

  findAll() {
    return this.postsRepository.findAll();
  }

  findOne(id: string) {
    return this.postsRepository.findOne(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: string) {
    return this.postsRepository.remove(id);
  }
}
