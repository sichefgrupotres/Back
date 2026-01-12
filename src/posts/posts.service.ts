import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { User } from 'src/users/entities/user.entity';
import { UploadImagenClou } from 'src/services/uploadImage';
import { FilterPostDto } from './dto/filter-post.dto';
import { PaginatedResponse } from 'src/interfaces/paginated-response.interface';
import { PostResponseDto } from './dto/post-response.dto';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private readonly uploadImageClou: UploadImagenClou,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(post: CreatePostDto, file: Express.Multer.File, user: any) {
    const userId = user.userId || user.id;
    if (!userId) {
      throw new BadRequestException('Usuario sin ID');
    }

    const fullUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!fullUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const response = await this.uploadImageClou.uploadImage(file);

    const postCreate = {
      title: post.title,
      description: post.description,
      imageUrl: response.secure_url,
      ingredients: post.ingredients,
      difficulty: post.difficulty,
      category: post.category,
      isPremium: post.isPremium,
    };

    const postCreated = await this.postsRepository.create(postCreate, fullUser);

    if (!postCreated) return 'Error al crear el post';

    return {
      message: 'post creado con éxito',
      imageUrl: response.secure_url,
    };
  }

  async findAll(
    filters: FilterPostDto,
  ): Promise<PaginatedResponse<PostResponseDto>> {
    const result: PaginatedResponse<Post> =
      await this.postsRepository.findAll(filters);

    const data: PostResponseDto[] = result.data.map((post: Post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      ingredients: post.ingredients,
      difficulty: post.difficulty,
      category: post.category,
      isPremium: post.isPremium,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      creatorName: `${post.creator?.name ?? 'Desconocido'} ${post.creator?.lastname ?? ''}`,
    }));

    return {
      data,
      meta: result.meta,
    };
  }

  async addPosts(): Promise<{ message: string }> {
    return await this.postsRepository.addPosts();
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

  async findByCreator(userId: string, filters: FilterPostDto) {
    return this.postsRepository.findAll({ ...filters, creatorId: userId });
  }
}
