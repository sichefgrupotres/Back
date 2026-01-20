/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,
    ) { }

    async toggleFavorite(userId: string, postId: string) { // 👈 Recibimos postId
        // 1. Buscamos si existe
        const existingFavorite = await this.favoriteRepository.findOne({
            where: {
                user: { id: userId },
                post: { id: postId }, // 👈 Buscamos por post
            },
        });

        if (existingFavorite) {
            // 2. BORRAR (Dislike)
            await this.favoriteRepository.remove(existingFavorite);
            return { isFavorite: false, message: 'Eliminado de favoritos' };
        } else {
            // 3. CREAR (Like)
            const newFavorite = this.favoriteRepository.create({
                user: { id: userId },
                post: { id: postId },
            });
            await this.favoriteRepository.save(newFavorite);

            return { isFavorite: true, message: 'Agregado a favoritos' };
        }
    }

    // Obtener favoritos del usuario (Para el perfil)
    async getUserFavorites(userId: string) {
        const favorites = await this.favoriteRepository.find({
            where: { user: { id: userId } },
            relations: ['post'], // 👈 Cargamos los datos del Post
            order: { createdAt: 'DESC' }
        });

        // Limpiamos la respuesta para devolver solo los posts
        return favorites.map(fav => ({
            ...fav.post,
            isFavorite: true
        }));
    }
}