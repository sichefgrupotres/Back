/* eslint-disable */
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { PostsService } from './posts/posts.service';
import { AdminModule } from './admin/admin.module';
import { TutorialsModule } from './tutorials/tutorials.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WebhooksModule } from './WebhooksModule/webhooks.Module';
import { ChatModule } from './chat/chat.module';
import { PushNotificationsModule } from './notifications/push-notifications/push-notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),

    // ✅ MODO DESARROLLO (TU COMPUTADORA) - ACTIVADO

    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'postgres',
    //     host: config.get('DB_HOST'),
    //     port: Number(config.get('DB_PORT')),
    //     username: config.get('DB_USER'),
    //     password: config.get('DB_PASSWORD'),
    //     database: config.get('DB_NAME'),
    //     autoLoadEntities: true,
    //     synchronize: true, // true en local para que cree las tablas
    //     logging: true,
    //   }),
    // }),

    // ☁️ MODO PRODUCCION (RENDER) - COMENTADO PARA QUE NO FALLE LOCALMENTE

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        logging: true,
      }),
    }),


    UsersModule,
    PostsModule,
    AuthModule,
    AdminModule,
    TutorialsModule,
    SubscriptionsModule,

    WebhooksModule,
    ChatModule,
    PushNotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) { }

  async onApplicationBootstrap() {
    try {
      // Intentamos cargar datos semilla, si falla no importa
      await this.usersService.addUsers();
      console.log('Usuarios verificados/agregados');

      await this.postsService.addPosts();
      console.log('Posts verificados/agregados');
    } catch (error) {
      console.warn('Omitiendo carga de datos semilla (ya existen o error):', error);
    }
  }
}