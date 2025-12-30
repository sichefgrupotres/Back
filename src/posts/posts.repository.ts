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
import { parseLocalDate } from 'src/utils/date.utils';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(post: CreatePostDto, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({
      ...post,
      creator: user,
    });

    if (!user) {
      throw new BadRequestException('Usuario no válido');
    }
    return await this.postsRepository.save(newPost);
  }

  async findAll(filters: FilterPostDto): Promise<PaginatedResponse<Post>> {
    const {
      search,
      difficulty,
      creatorName,
      fromDate,
      toDate,
      orderByDate,
      page,
      limit,
    } = filters;

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (fromDate && toDate) {
      const startDate = parseLocalDate(fromDate);
      const endDate = parseLocalDate(toDate, true);

      if (startDate > endDate) {
        throw new BadRequestException('fromDate no puede ser mayor que toDate');
      }
    }

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.creator', 'creator');

    if (startDate) {
      query.andWhere('post.createdAt >= :fromDate', {
        fromDate: startDate,
      });
    }

    if (endDate) {
      query.andWhere('post.createdAt <= :toDate', {
        toDate: endDate,
      });
    }
    if (search) {
      query.andWhere(
        `(post.title ILIKE :search 
        OR post.description ILIKE :search 
        OR post.ingredients ILIKE :search)`,
        { search: `%${search}%` },
      );
    }
    if (difficulty) {
      query.andWhere('post.difficulty = :difficulty', { difficulty });
    }

    if (creatorName) {
      const parts = creatorName.trim().split(/\s+/);

      if (parts.length === 1) {
        query.andWhere(
          `(creator.name ILIKE :term OR creator.lastname ILIKE :term)`,
          { term: `%${parts[0]}%` },
        );
      } else {
        query.andWhere(
          `(creator.name ILIKE :name AND creator.lastname ILIKE :lastname)`,
          {
            name: `%${parts[0]}%`,
            lastname: `%${parts[1]}%`,
          },
        );
      }
    }

    query.orderBy('post.createdAt', orderByDate === 'asc' ? 'ASC' : 'DESC');

    const pageNumber = page ?? 1;
    const pageSize = limit ?? 5;

    query.skip((pageNumber - 1) * pageSize).take(pageSize);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      //información adicional sobre paginación, datos para la navegación
      meta: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
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
