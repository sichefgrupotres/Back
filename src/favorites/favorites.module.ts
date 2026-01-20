/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity'; // 👈 Asegúrate que la ruta sea correcta

@Module({
    imports: [
        // Registramos la entidad para que TypeORM pueda inyectar el repositorio
        TypeOrmModule.forFeature([Favorite]),
    ],
    controllers: [], // No necesitamos controlador propio porque usaremos el de Posts
    providers: [FavoritesService],
    exports: [FavoritesService], // 🚨 IMPORTANTE: Esto permite usar el servicio en PostsModule
})
export class FavoritesModule { }