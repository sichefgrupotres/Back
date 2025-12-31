import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { User } from 'src/users/entities/user.entity';
import { UploadImagenClou } from 'src/services/uploadImage';
import { FilterPostDto } from './dto/filter-post.dto';
import { PaginatedResponse } from 'src/interfaces/paginated-response.interface';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private readonly uploadImageClou: UploadImagenClou,
  ) {}

  async create(post: CreatePostDto, file: Express.Multer.File, user: User) {
    const response = await this.uploadImageClou.uploadImage(file);

    const postCreate = {
      title: post.title,
      description: post.description,
      imageUrl: response.secure_url,
      ingredients: post.ingredients,
      difficulty: post.difficulty,
      isPremium: post.isPremium,
    };

    const postCreated = await this.postsRepository.create(postCreate, user);

    if (!postCreated) return 'Error al crear el post';

    return {
      message: 'post creado con éxito',
      imageUrl: response.secure_url,
    };
  }

  async findAll(
    filters: FilterPostDto,
  ): Promise<PaginatedResponse<PostResponseDto>> {
    const result = await this.postsRepository.findAll(filters);

    return {
      data: result.data.map((post) => ({
        title: post.title,
        description: post.description,
        ingredients: post.ingredients,
        difficulty: post.difficulty,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        creatorName: `${post.creator.name} ${post.creator.lastname}`,
      })),
      meta: result.meta,
    };
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
