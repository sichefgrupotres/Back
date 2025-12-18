import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
// import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) { }

async create(
  post: Partial<CreatePostDto>,
  file: Express.Multer.File,
  user: User,
) {
  const response = await this.postsRepository.uploadImage(file);

  const postCreate = {
    title: post.title,
    description: post.description,
    imageUrl: response.secure_url
  };

  const postCreated = await this.postsRepository.create(postCreate,user);

  if (!postCreated) return 'Error al crear el post';
  return 'post creado con éxito';
}

  findAll() {
    return this.postsRepository.findAll();
  }

  findOne(id: string) {
    return this.postsRepository.findOne(id);
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.postsRepository.update(id, updatePostDto);
  }

  remove(id: string) {
    return this.postsRepository.remove(id);
  }
}
