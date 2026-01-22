import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TutorialsService } from './tutorials.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormDataInterceptor } from 'src/common/interceptors/formdata.interceptor';
import type { AuthRequest } from 'src/auth/interfaces/auth-request.interfaces';
import { User } from 'src/users/entities/user.entity';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';

@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @ApiOperation({
    summary: 'Obtener los tutoriales del usuario autenticado',
  })
  @ApiBearerAuth()
  @Get('my-tutorials')
  @UseGuards(AuthGuard('jwt'))
  async getMyTutorials(@Req() req: AuthRequest) {
    const user = req.user;
    const userId = user?.sub ?? user?.id ?? user?.userId;

    if (!userId) {
      throw new BadRequestException('Usuario sin ID');
    }

    const tutorials = await this.tutorialsService.getTutorialsByUser(userId);
    return { data: tutorials };
  }

  @ApiOperation({
    summary: 'Creación de un tutorial con video',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        recipeId: { type: 'string' },
        ingredients: { type: 'string' },
        steps: { type: 'string' },
        video: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'title',
        'description',
        'recipeId',
        'ingredients',
        'steps',
        'video',
      ],
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('video'), FormDataInterceptor)
  async createTutorial(
    @Body() dto: CreateTutorialDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 100_000_000,
            message: 'El video supera el tamaño máximo permitido de 100MB',
          }),
          new FileTypeValidator({
            fileType: /^video\/.*/,
          }),
        ],
      }),
    )
    video: Express.Multer.File,
  ) {
    const user = req.user as User;
    if (!user) {
      throw new BadRequestException('Usuario no válido');
    }

    return await this.tutorialsService.create(dto, video, file, req.user);
  }

  @Get('user/:userId')
  async getTutorialsByUser(@Param('userId') userId: string) {
    return this.tutorialsService.getTutorialsByUser(userId);
  }

  @ApiOperation({ summary: 'Ver todos los tutoriales' })
  @Get()
  findAll() {
    return this.tutorialsService.findAll();
  }

  @ApiOperation({ summary: 'Ver un tutorial por ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorialsService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un tutorial' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTutorialDto: UpdateTutorialDto,
  ) {
    return this.tutorialsService.update(id, updateTutorialDto);
  }

  @ApiOperation({ summary: 'Eliminar un tutorial' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorialsService.remove(id);
  }

  @Get('by-recipe/:id')
  findByRecipe(@Param('id') id: string) {
    return this.tutorialsService.findByRecipe(id);
  }
}
