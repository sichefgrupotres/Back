import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import type { AuthRequest } from 'src/auth/interfaces/auth-request.interfaces';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterPostDto } from './dto/filter-post.dto';
import { PaginatedPostResponseDto } from './dto/paginated-post-response.dto';
import { ErrorResponseDto } from './dto/error-response.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: 'Creacion de un posteo',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        difficulty: {
          type: 'string',
          enum: ['facil', 'medio', 'dificil'],
        },
        ingredients: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'difficulty', 'ingredients', 'file'],
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() post: CreatePostDto,
    @Req() req: AuthRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 200000,
            message: 'Supera el peso maximo de 200kb',
          }),
          new FileTypeValidator({ fileType: /^image\/.*/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const user = req.user as User;
    const newPost = this.postsService.create(post, file, user);
    return newPost;
  }
  @ApiOperation({
    summary: 'Ver todos los posteos',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Listado paginado de posteos',
    type: PaginatedPostResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parámetros de búsqueda inválidos',
    type: ErrorResponseDto,
  })
  @Get()
  findAll(@Query() filters: FilterPostDto) {
    return this.postsService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Ver un posteo por su Id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar un posteo',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @ApiOperation({
    summary: 'Eliminar un posteo',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.postsService.remove(id);
  }
}
