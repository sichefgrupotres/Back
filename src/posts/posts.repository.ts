import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/users/entities/user.entity';
import { FilterPostDto } from './dto/filter-post.dto';
import { PaginatedResponse } from 'src/interfaces/paginated-response.interface';
import postsData from '../utils/recipes.json';
import { PostSeed } from './posts.seed.type';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async findAll(filters: FilterPostDto): Promise<PaginatedResponse<Post>> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.creator', 'creator');
    // .loadRelationCountAndMap('post.favoritesCount', 'post.favoritedBy');

    if (filters.creatorId) {
      qb.andWhere('creator.id = :creatorId', {
        creatorId: filters.creatorId,
      });
    }

    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);

    qb.orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addPosts(): Promise<{ message: string }> {
    const users = await this.usersRepository.find();

    const typedPostsData = postsData as PostSeed[];
    await Promise.all(
      typedPostsData.map(async (postData) => {
        const creator = users.find(
          (user) => user.seedKey === postData.creatorSeedKey,
        );

        if (!creator) {
          throw new NotFoundException(
            `El usuario ${postData.creatorSeedKey} no existe`,
          );
        }

        const post = this.postsRepository.create({
          seedKey: postData.seedKey,
          title: postData.title,
          description: postData.description,
          ingredients: postData.ingredients,
          difficulty: postData.difficulty,
          isPremium: postData.isPremium,
          imageUrl: postData.imageUrl,
          category: [postData.category],
          creator,
        });

        await this.postsRepository
          .createQueryBuilder()
          .insert()
          .into(Post)
          .values(post)
          .orUpdate(
            [
              'description',
              'ingredients',
              'difficulty',
              'isPremium',
              'imageUrl',
              'updated_at',
            ],
            ['seedKey'],
          )
          .execute();
      }),
    );

    return { message: 'Posts agregados' };
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const result = await this.postsRepository.update(id, updatePostDto);

    if (result.affected === 0) {
      throw new NotFoundException('Post no encontrado');
    }

    return this.postsRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }
    await this.postsRepository.remove(post);

    return {
      message: 'Post eliminado correctamente',
    };
  }
}
