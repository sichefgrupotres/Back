import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendgridProvider } from './sengrid.provider';
import { UserRegisteredEvent } from '../users/users.events';

@Injectable()
export class NotificationsService {
  constructor(private readonly sendgrid: SendgridProvider) {}

  @OnEvent('user.registered', { async: true })
  async handleUserRegistered(event: UserRegisteredEvent) {
    try {
      await this.notifyUserRegistration(event.email, event.name);
    } catch (err) {
      console.error('[Notifications] Error enviando email de registro:', err);
    }
  }

  async notifyUserRegistration(email: string, name: string) {
    const subject = '¡Bienvenido a SiChef!';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              background-color: #fdf7f2;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0,0,0,0.05);
            }
            .header {
              text-align: center;
              padding: 30px 20px 10px;
              background-color: #ffffff;
            }
            .header img {
              max-width: 140px;
            }
            .content {
              padding: 30px 40px;
              text-align: center;
              color: #5c3a1a;
            }
            .content h1 {
              font-size: 22px;
              margin-bottom: 10px;
              color: #8B4513;
            }
            .content p {
              font-size: 16px;
              line-height: 1.6;
              margin: 10px 0;
            }
            .button {
              background-color: #ff6f3c;
              color: #8B4513 !important;
              text-decoration: none !important;
              font-weight: bold;
              padding: 12px 28px;
              border-radius: 6px;
              font-size: 15px;
              display: inline-block;
              margin-top: 25px;
            }
            .hero {
              margin-top: 30px;
            }
            .hero img {
              width: 100%;
              display: block;
              border-bottom-left-radius: 8px;
              border-bottom-right-radius: 8px;
            }
            .footer {
              font-size: 12px;
              color: #888888;
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Logo -->
            <div class="header">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1767670185/ux3vpzuzfsyefgaimezi.png" alt="SiChef Logo" />
            </div>

            <!-- Texto -->
            <div class="content">
              <h1>¡Bienvenido a SiChef!</h1>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Gracias por registrarte en <strong>SiChef</strong>. Estamos felices de tenerte en nuestra comunidad.</p>
              <p>Aquí podrás poner en práctica tus habilidades, compartir recetas y aprender de los mejores.</p>
              <a href="http://localhost:3000/login" class="button">Ir al login</a>
            </div>

            <!-- Imagen grande -->
            <div class="hero">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1767070573/dnngdc7zpccdelxbiefm.webp" alt="Bienvenido a SiChef" />
            </div>

            <!-- Footer -->
            <div class="footer">
              Este correo fue enviado a ${email}. Si no sos vos, ignorá este mensaje.<br />
              © 2026 SiChef. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
    `;
    await this.sendgrid.sendMail(email, subject, html);
  }
}
