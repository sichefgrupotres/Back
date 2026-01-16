import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
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

@Controller()
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

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
  @Post('tutorial')
  @UseInterceptors(FileInterceptor('video'), FormDataInterceptor)
  async createTutorial(
    @Body() dto: CreateTutorialDto,
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

    return await this.tutorialsService.create(dto, video, user);
  }
}
