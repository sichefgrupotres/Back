/* eslint-disable */
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
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { FavoritesService } from 'src/favorites/favorites.service';
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
import { FormDataInterceptor } from 'src/common/interceptors/formdata.interceptor';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly favoritesService: FavoritesService,
  ) {}

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
        category: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['Desayunos', 'Almuerzos', 'Meriendas', 'Cenas', 'Postres'],
          },
        },
        ingredients: { type: 'string' },
        isPremium: {
          type: 'boolean',
          example: false,
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'title',
        'description',
        'difficulty',
        'ingredients',
        'isPremium',
        'category',
        'file',
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'), FormDataInterceptor)
  async create(
    @Body() post: CreatePostDto,
    @Req() req: AuthRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000,
            message: 'Supera el peso maximo de 2000kb',
          }),
          new FileTypeValidator({ fileType: /^image\/.*/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const user = req.user as User;
    if (!user) throw new BadRequestException('Usuario no válido');
    return this.postsService.create(post, file, user);
  }

  // 1. ENDPOINT PARA OBTENER LA LISTA (Debe ir ANTES de :id)
  @ApiOperation({ summary: 'Obtener mis posts favoritos' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('favorites/my-list')
  async getMyFavorites(@Req() req: AuthRequest) {
    if (!req.user) throw new UnauthorizedException('Usuario no autenticado');

    const userId = req.user.userId || req.user.id;
    return this.favoritesService.getUserFavorites(userId);
  }

  // 2. ENDPOINT PARA TOGGLE FAVORITE (Dar like)
  @ApiOperation({ summary: 'Agregar o quitar de favoritos' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':id/favorite')
  async toggleFavorite(
    @Param('id', ParseUUIDPipe) postId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user) throw new UnauthorizedException('Usuario no autenticado');

    const userId = req.user.userId || req.user.id;
    return this.favoritesService.toggleFavorite(userId, postId);
  }

  @ApiOperation({ summary: 'Ver mis posteos' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('my-posts')
  findMyPosts(@Req() req: AuthRequest, @Query() filters: FilterPostDto) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const userId = req.user.userId || req.user.id;
    return this.postsService.findByCreator(userId, filters);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed de posts (solo desarrollo)' })
  @ApiOkResponse({ description: 'Seed de posts realizado' })
  @Get('seeder')
  seedPosts(): Promise<{ message: string }> {
    return this.postsService.addPosts();
  }

  @ApiOperation({
    summary: 'Ver todos los posteos (público)',
  })
  @ApiOkResponse({
    description: 'Listado paginado de posteos',
    type: PaginatedPostResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parámetros de búsqueda inválidos',
    type: ErrorResponseDto,
  })
  @Get()
  findAll(@Req() req: any, @Query() filters: FilterPostDto) {
    let userId = undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // 👇 Ahora esta línea funcionará porque ya agregaste la función abajo
      const decoded = this.decodeToken(token);

      if (decoded) {
        // Buscamos el ID en las propiedades comunes (sub, userId, o id)
        userId = decoded.sub || decoded.userId || decoded.id;
        console.log('✅ Usuario identificado en Posts:', userId);
      }
    }

    return this.postsService.findAll(filters, userId);
  }
  @ApiOperation({
    summary: 'Ver un posteo por su Id',
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar un posteo',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @ApiOperation({
    summary: 'Eliminar un posteo',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }

  // 👇 FUNCIÓN AUXILIAR PARA LEER EL TOKEN
  private decodeToken(token: string) {
    try {
      const base64Payload = token.split('.')[1];
      const payloadBuffer = Buffer.from(base64Payload, 'base64');
      return JSON.parse(payloadBuffer.toString());
    } catch (e) {
      return null;
    }
  }
}
