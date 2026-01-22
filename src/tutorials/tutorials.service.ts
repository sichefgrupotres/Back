/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { Post } from 'src/posts/entities/post.entity';
import { Tutorial } from './entities/tutorial.entity';
import { UploadVideoCloud } from 'src/services/uploadVideo';
import { TutorialResponseDto } from './dto/tutorial-response.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';

@Injectable()
export class TutorialsService {
  constructor(
    private readonly uploadVideoClou: UploadVideoCloud,

    @InjectRepository(Tutorial)
    private readonly tutorialRepository: Repository<Tutorial>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    tutorial: CreateTutorialDto,
    video: Express.Multer.File,
    file: Express.Multer.File,
    user: any,
  ): Promise<TutorialResponseDto> {
    const userId = user.sub ?? user.id ?? user.userId;
    if (!userId) throw new BadRequestException('Usuario sin ID');

    const fullUser = await this.usersRepository.findOneBy({ id: userId });
    if (!fullUser) throw new BadRequestException('Usuario no encontrado');

    const recipe = await this.postsRepository.findOneBy({
      id: tutorial.recipeId,
    });
    if (!recipe) throw new BadRequestException('Receta no encontrada');

    try {
      let ingredients = tutorial.ingredients;
      let steps = tutorial.steps;

      if (typeof tutorial.ingredients === 'string') {
        try {
          ingredients = JSON.parse(tutorial.ingredients);
        } catch (e) {
          throw new BadRequestException('Formato de ingredients inválido');
        }
      }

      if (typeof tutorial.steps === 'string') {
        try {
          steps = JSON.parse(tutorial.steps);
        } catch (e) {
          throw new BadRequestException('Formato de steps inválido');
        }
      }

      const upload = await this.uploadVideoClou.uploadVideo(file);
      const response = await this.uploadVideoClou.uploadVideo(video);

      const tutorialEntity = this.tutorialRepository.create({
        title: tutorial.title,
        description: tutorial.description,
        videoUrl: response.secure_url,
        thumbnailUrl: upload.thumbnailUrl,
        ingredients,
        steps,
        recipe,
        user: fullUser,
      });

      const savedTutorial = await this.tutorialRepository.save(tutorialEntity);
      return {
        id: savedTutorial.id,
        title: savedTutorial.title,
        description: savedTutorial.description,
        videoUrl: savedTutorial.videoUrl,
        thumbnailUrl: upload.thumbnailUrl,
        ingredients: savedTutorial.ingredients,
        steps: savedTutorial.steps,
        recipe: {
          id: recipe.id,
          title: recipe.title,
        },
        user: {
          id: fullUser.id,
          email: fullUser.email,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al crear tutorial');
    }
  }

  async getTutorialsByUser(userId: string): Promise<Tutorial[]> {
    const tutorials = await this.tutorialRepository.find({
      where: { user: { id: userId } },
      relations: ['recipe', 'user'],
      order: { createdAt: 'DESC' },
    });

    return tutorials;
  }

  findAll() {
    return this.tutorialRepository.find({
      relations: ['recipe', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tutorial> {
    const tutorial = await this.tutorialRepository.findOne({
      where: { id },
      relations: ['recipe', 'user'],
    });

    if (!tutorial) {
      throw new BadRequestException('Tutorial no encontrado');
    }
    return tutorial;
  }

  update(id: string, updateTutorialDto: UpdateTutorialDto) {
    return this.tutorialRepository.update(id, updateTutorialDto);
  }

  remove(id: string) {
    return this.tutorialRepository.delete(id);
  }

  async findByRecipe(recipeId: string): Promise<Tutorial> {
    const tutorial = await this.tutorialRepository.findOne({
      where: { recipe: { id: recipeId } },
      relations: ['recipe', 'user'],
    });

    if (!tutorial) {
      throw new BadRequestException('Tutorial no encontrado para esta receta');
    }

    return tutorial;
  }
}
