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
import { UploadApiResponse, v2 } from 'cloudinary';
import bufferToStream from 'buffer-to-stream';

const toStream = bufferToStream;

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(post: Partial<CreatePostDto>, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({
      ...post,
      creator: user,
    });

    if (!user) {
      throw new BadRequestException('Usuario no válido');
    }
    return await this.postsRepository.save(newPost);
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error || !result) {
            throw new Error('Error al guardar');
          } else {
            resolve(result);
          }
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async findAll() {
    return await this.postsRepository.find();
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
