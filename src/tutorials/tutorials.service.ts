import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { Post } from 'src/posts/entities/post.entity';
import { Tutorial } from './entities/tutorial.entity';
import { UploadVideoClou } from 'src/services/uploadVideo';
import { TutorialResponseDto } from './dto/tutorial-response.dto';

@Injectable()
export class TutorialsService {
  constructor(
    private readonly uploadVideoClou: UploadVideoClou,

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
      const response = await this.uploadVideoClou.uploadVideo(video);
      const tutorialEntity = this.tutorialRepository.create({
        ...tutorial,
        videoUrl: response.secure_url,
        recipe,
        user: fullUser,
      });

      const savedTutorial = await this.tutorialRepository.save(tutorialEntity);

      return {
        id: savedTutorial.id,
        title: savedTutorial.title,
        description: savedTutorial.description,
        videoUrl: savedTutorial.videoUrl,
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
      throw new BadRequestException(error.message);
    }
  }
}
