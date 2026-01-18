/* eslint-disable */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PushNotificationsService } from '../notifications/push-notifications/push-notifications.service'; // 👈 IMPORTAR

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string[]> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly pushNotificationsService: PushNotificationsService // 👈 INYECTAR
  ) { }

  async handleConnection(client: Socket) {
    client.join('general');
    console.log(`🔌 Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);

    for (const [email, socketIds] of this.connectedUsers.entries()) {
      const index = socketIds.indexOf(client.id);
      if (index > -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.connectedUsers.delete(email);
        }
        break;
      }
    }
  }

  @SubscribeMessage('setup-user')
  async handleSetupUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() email: string
  ) {
    if (!email) return;

    const normalizedEmail = email.toLowerCase().trim();
    client.join(normalizedEmail);

    if (!this.connectedUsers.has(normalizedEmail)) {
      this.connectedUsers.set(normalizedEmail, []);
    }
    this.connectedUsers.get(normalizedEmail)!.push(client.id);

    console.log(`✅ Usuario registrado: ${normalizedEmail} (Socket: ${client.id})`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    if (!room) return;

    console.log(`🚪 Cliente ${client.id} entrando a sala: ${room}`);

    const historial = await this.chatService.getMessages(room);

    const formattedHistory = historial.map((msg) => ({
      text: msg.content,
      sender: msg.senderName,
      avatar: null,
      time: msg.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      id: msg.id,
      room: msg.room,
      email: msg.senderEmail,
    }));

    client.emit('load-history', formattedHistory);

    console.log(`📜 Enviado historial de ${formattedHistory.length} mensajes`);
  }

  @SubscribeMessage('enviar-mensaje')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      text: string;
      sender: string;
      email: string;
      avatar: string;
      room: string;
    },
  ) {
    if (!body.text || !body.email || !body.room) {
      console.error('❌ Mensaje inválido recibido');
      return;
    }

    const roomTarget = body.room || 'general';
    const senderEmail = body.email.toLowerCase().trim();

    console.log(`📤 Procesando mensaje de ${senderEmail} para sala ${roomTarget}`);

    const savedMsg = await this.chatService.createMessage(
      body.text,
      body.sender,
      senderEmail,
      roomTarget,
    );

    const payload = {
      id: savedMsg.id,
      text: savedMsg.content,
      sender: savedMsg.senderName,
      email: senderEmail,
      avatar: body.avatar,
      time: savedMsg.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      room: savedMsg.room,
    };

    // LÓGICA DE DISTRIBUCIÓN
    if (roomTarget === 'general') {
      this.server.to('general').emit('nuevo-mensaje', payload);
      console.log(`✅ Mensaje enviado a sala general`);
    } else {
      if (roomTarget.includes('_')) {
        const [rawEmail1, rawEmail2] = roomTarget.split('_');
        const email1 = rawEmail1.toLowerCase().trim();
        const email2 = rawEmail2.toLowerCase().trim();

        console.log(`👥 Mensaje privado entre ${email1} y ${email2}`);

        this.server.to(email1).to(email2).emit('nuevo-mensaje', payload);

        // 🔔 ENVIAR PUSH A USUARIOS OFFLINE
        const recipients = [email1, email2].filter(e => e !== senderEmail);

        for (const recipientEmail of recipients) {
          const isOnline = this.connectedUsers.has(recipientEmail);

          if (!isOnline) {
            console.log(`📤 Usuario offline detectado: ${recipientEmail}. Enviando push...`);

            await this.pushNotificationsService.sendPushNotification(
              recipientEmail,
              'Nuevo mensaje en SiChef',
              `${body.sender}: ${body.text}`,
              body.avatar,
              '/chat'
            );
          } else {
            console.log(`✅ Usuario online: ${recipientEmail}`);
          }
        }
      } else {
        this.server.to(roomTarget).emit('nuevo-mensaje', payload);
      }
    }
  }

  @SubscribeMessage('get-online-users')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineEmails = Array.from(this.connectedUsers.keys());
    client.emit('online-users', onlineEmails);
  }
}