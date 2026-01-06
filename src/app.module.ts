import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { PostsService } from './posts/posts.service';
<<<<<<< HEAD
=======

>>>>>>> dev
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        dropSchema: true,
        logging: true,
      }),
    }),

    UsersModule,

    PostsModule,

    AuthModule,

    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  async onApplicationBootstrap() {
    await this.usersService.addUsers();
    console.log('Usuarios agregados');

    await this.postsService.addPosts();
    console.log('Posts agregados');
  }
}
