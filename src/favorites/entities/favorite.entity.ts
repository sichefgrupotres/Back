/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity'; // 👈 Importamos Post

@Entity()
@Unique(['user', 'post']) // 🔒 Un usuario no puede dar like 2 veces al mismo post
export class Favorite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    // Relación con Usuario
    @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
    user: User;

    // Relación con Post (Receta)
    @ManyToOne(() => Post, (post) => post.favoritedBy, { onDelete: 'CASCADE' })
    post: Post; // 👈 Aquí guardamos la relación
}