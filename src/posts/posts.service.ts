/* eslint-disable */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    const moderationResult = await this.postModerationService.moderatePost(
      post,
      user.email,
    );

    let response;
    try {
      response = await this.uploadImageClou.uploadImage(file);
    } catch (err) {
      throw new BadRequestException('Error al subir imagen: ' + err.message);
    }

    const postCreated = await this.postsRepository.create(
      { ...post, statusPost: moderationResult.statusPost },
      fullUser,
    );
    if (!postCreated) return 'Error al crear el post';
    if (moderationResult.statusPost === PostStatus.BLOCKED) {
      this.eventEmitter.emit(
        'post.blocked',
        new PostEvent(
          post.title,
          response.secure_url,
          user.email,
          moderationResult.results[0].category,
        ),
      );
    } else {
      this.eventEmitter.emit(
        'post.created',
        new PostEvent(post.title, response.secure_url, user.email),
      );
    }
    const postCreate = {
      title: post.title,
      description: post.description,
      imageUrl: response.secure_url,
      ingredients: post.ingredients,
      difficulty: post.difficulty,
      category: post.category,
      isPremium: post.isPremium,
    };
    return {
      message:moderationResult.alertMessage ,
      statusPost: moderationResult.statusPost,
      imageUrl: response.secure_url,
      post: postCreate,
    };
  }

  async findAll(
    filters: FilterPostDto,
    userId: any,
  ): Promise<PaginatedResponse<PostResponseDto>> {
    const result: PaginatedResponse<Post> =
      await this.postsRepository.findAll(filters);

    const postIds = result.data.map((p) => p.id);
    let likedPostIds = new Set<string>();

    if (userId && postIds.length > 0) {
      const favorites = await this.favoritesRepository.find({
        where: {
          user: { id: userId },
          post: { id: In(postIds) },
        },
        relations: ['post'],
      });

      likedPostIds = new Set(
        favorites.map((f) => f.post?.id).filter((id): id is string => !!id),
      );
    }

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

  async findByCreator(
    creatorId: string,
    filters: FilterPostDto,
  ): Promise<PaginatedResponse<PostResponseDto>> {
    return this.findAll(
      {
        ...filters,
        creatorId,
      },
      creatorId,
    );
  }

  async toggleFavorite(postId: string, userId: string) {
    const existingFavorite = await this.favoritesRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (existingFavorite) {
      await this.favoritesRepository.remove(existingFavorite);
      return { isFavorite: false, message: 'Eliminado de favoritos' };
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isVip =
      user.isPremium || user.roleId === 'ADMIN' || user.roleId === 'CREATOR';

    if (!isVip) {
      const count = await this.favoritesRepository.count({
        where: { user: { id: userId } },
      });

      if (count >= 5) {
        throw new BadRequestException('Límite de favoritos alcanzado');
      }
    }
    const newFavorite = this.favoritesRepository.create({
      post: { id: postId },
      user: { id: userId },
    });

    await this.favoritesRepository.save(newFavorite);
    return { isFavorite: true, message: 'Agregado a favoritos' };
  }
}
