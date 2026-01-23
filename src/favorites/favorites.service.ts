/* eslint-disable */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>,

        // Inyectamos el repo de usuarios para verificar si es Premium/Admin
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async toggleFavorite(userId: string, postId: string) {
        // 1. Buscamos si ya existe el favorito
        const existingFavorite = await this.favoriteRepository.findOne({
            where: {
                user: { id: userId },
                post: { id: postId },
            },
        });

        if (existingFavorite) {
            // ---------------------------------------------------------
            // CASO BORRAR (Dislike): Siempre permitimos borrar
            // ---------------------------------------------------------
            await this.favoriteRepository.remove(existingFavorite);
            return { isFavorite: false, message: 'Eliminado de favoritos' };
        } else {
            // ---------------------------------------------------------
            // CASO AGREGAR (Like): Aquí verificamos el límite 🛑
            // ---------------------------------------------------------

            // A. Buscamos al usuario
            const user = await this.usersRepository.findOne({ where: { id: userId } });

            if (!user) throw new BadRequestException('Usuario no encontrado');

            // B. Casting a 'any' para evitar error de TypeScript si 'role' no está en la Entity
            const userAny = user as any;

            // C. Definimos quién es VIP (Premium, Admin o Creador)
            // Verificamos tanto 'role' como 'roleId' por seguridad
            const isVip =
                userAny.isPremium === true ||
                userAny.role === 'ADMIN' || userAny.roleId === 'ADMIN' ||
                userAny.role === 'CREATOR' || userAny.roleId === 'CREATOR';

            // D. Si NO es VIP, contamos cuántos favoritos tiene ya
            if (!isVip) {
                const count = await this.favoriteRepository.count({
                    where: { user: { id: userId } },
                });

                // Si ya tiene 5 o más, lanzamos el error
                if (count >= 5) {
                    throw new BadRequestException('Límite de favoritos alcanzado');
                }
            }

            // E. Si pasó las pruebas, guardamos
            const newFavorite = this.favoriteRepository.create({
                user: { id: userId },
                post: { id: postId },
            });
            await this.favoriteRepository.save(newFavorite);

            return { isFavorite: true, message: 'Agregado a favoritos' };
        }
    }

    // Obtener favoritos del usuario
    async getUserFavorites(userId: string) {
        const favorites = await this.favoriteRepository.find({
            where: { user: { id: userId } },
            relations: ['post', 'post.creator'], // Traemos la info del creador
            order: { createdAt: 'DESC' }
        });

        return favorites.map(fav => {
            const post = fav.post;
            // Validación por seguridad si el post no existe
            if (!post) return null;

            return {
                ...post,
                isFavorite: true,
                // Mapeo manual para que el frontend reciba los datos planos
                creatorName: post.creator ? `${post.creator.name} ${post.creator.lastname || ''}`.trim() : 'Desconocido',
                avatarUrl: post.creator?.avatarUrl || '',
                creatorId: post.creator?.id || '',
                creator: undefined // Limpiamos el objeto anidado para no enviar data extra
            };
        }).filter(item => item !== null); // Filtramos posibles nulos
    }
}