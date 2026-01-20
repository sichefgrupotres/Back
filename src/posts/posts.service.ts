/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto, PostStatus } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { User } from 'src/users/entities/user.entity';
import { UploadImagenClou } from 'src/services/uploadImage';
import { FilterPostDto } from './dto/filter-post.dto';
import { PostEvent } from 'src/posts/post.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginatedResponse } from 'src/interfaces/paginated-response.interface';
import { PostResponseDto } from './dto/post-response.dto';
import { Post } from './entities/post.entity';
import { PostModerationService } from '../modules/moderationPost/post-moderation.service';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/favorites/entities/favorite.entity';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private readonly uploadImageClou: UploadImagenClou,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly postModerationService: PostModerationService,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
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

    const moderationResult = await this.postModerationService.moderatePost(
      postCreate,
      user.email,
    );

    const postCreated = await this.postsRepository.create(
      { ...postCreate, statusPost: moderationResult.statusPost },
      fullUser,
    );
    if (!postCreated) return 'Error al crear el post';
    if (moderationResult.statusPost === PostStatus.BLOCKED) {
      this.eventEmitter.emit(
        'post.blocked',
        new PostEvent(
          postCreate.title,
          response.secure_url,
          user.email,
          moderationResult.results[0].category,
        ),
      );
    } else {
      this.eventEmitter.emit(
        'post.created',
        new PostEvent(postCreate.title, response.secure_url, user.email),
      );
    }
    return {
      statusPost: moderationResult.statusPost,
      imageUrl: response.secure_url,
      post: postCreated,
    };
  }

  // 👇 AQUÍ ESTABA EL ERROR, YA CORREGIDO
  async findAll(
    filters: FilterPostDto,
    userId: any,
  ): Promise<PaginatedResponse<PostResponseDto>> {
    const result: PaginatedResponse<Post> =
      await this.postsRepository.findAll(filters);

    const postIds = result.data.map((p) => p.id);
    let likedPostIds = new Set<string>();

    if (userId && postIds.length > 0) {
      // Traemos los favoritos del usuario que coincidan con estos posts
      const favorites = await this.favoritesRepository.find({
        where: {
          user: { id: userId },
          post: { id: In(postIds) },
        },
        relations: ['post'], // 👈 CLAVE 1: Cargamos la relación explícitamente
      });

      // 👈 CLAVE 2: Usamos ?.id y filtramos para que no explote si algo viene vacío
      likedPostIds = new Set(
        favorites.map((f) => f.post?.id).filter((id): id is string => !!id),
      );
    }

    // Mapeamos agregando isFavorite
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
      isFavorite: likedPostIds.has(post.id),
    }));

    return { data, meta: result.meta };
  }

  async addPosts(): Promise<{ message: string }> {
    return this.postsRepository.addPosts();
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
