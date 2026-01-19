/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }

    // HELPER: Genera un ID de sala consistente ordenado alfabéticamente
    private getRoomId(user1: string, user2: string): string {
        if (user1 === 'general' || user2 === 'general') return 'general';
        return [user1.toLowerCase().trim(), user2.toLowerCase().trim()]
            .sort()
            .join('_');
    }

    // 1. GUARDAR MENSAJE
    // 1. GUARDAR MENSAJE (MODIFICADO PARA DEBUG)
    async createMessage(content: string, senderName: string, senderEmail: string, rawRoom: string) {
        console.log('💾 Intento de guardar mensaje:', { content, senderEmail, rawRoom }); // <--- LOG 1

        try {
            let finalRoom = rawRoom.toLowerCase().trim();

            // Si es una sala privada, ordenamos los emails
            if (finalRoom.includes('_')) {
                const parts = finalRoom.split('_');
                if (parts.length === 2) {
                    finalRoom = this.getRoomId(parts[0], parts[1]);
                }
            }

            const newMessage = this.messageRepository.create({
                content,
                senderName,
                senderEmail, // <--- VERIFICA QUE ESTA COLUMNA EXISTA EN TU ENTIDAD Y BD
                room: finalRoom,
                createdAt: new Date() // <--- ASEGURAMOS LA FECHA
            });

            const saved = await this.messageRepository.save(newMessage);
            console.log('✅ Mensaje guardado en BD con ID:', saved.id); // <--- LOG 2
            return saved;

        } catch (error) {
            console.error('🔥 ERROR CRÍTICO SQL AL GUARDAR MENSAJE:', error); // <--- AQUÍ SALDRÁ EL ERROR ROJO
            throw error;
        }
    }

    // 2. OBTENER HISTORIAL DE MENSAJES
    async getMessages(rawRoom: string) {
        let searchRoom = rawRoom.toLowerCase().trim();

        // Ordenamos los emails antes de buscar
        if (searchRoom.includes('_')) {
            const parts = searchRoom.split('_');
            if (parts.length === 2) {
                searchRoom = this.getRoomId(parts[0], parts[1]);
            }
        }

        const messages = await this.messageRepository.find({
            where: { room: searchRoom },
            order: { createdAt: 'DESC' },
            take: 100, // Límite alto para pruebas
        });
        return messages.reverse();
    }

    // 3. OBTENER MENSAJES NO LEÍDOS POR USUARIO
    async getUnreadMessages(userEmail: string) {
        const email = userEmail.toLowerCase().trim();

        // Obtenemos todos los mensajes donde el usuario está involucrado
        const messages = await this.messageRepository
            .createQueryBuilder('message')
            .where('message.room LIKE :email', { email: `%${email}%` })
            .orWhere('message.room = :general', { general: 'general' })
            .orderBy('message.createdAt', 'DESC')
            .take(50)
            .getMany();

        return messages;
    }
}