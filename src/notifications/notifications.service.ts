import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendgridProvider } from './sengrid.provider';
import { UserRegisteredEvent } from '../users/users.events';
import { PostEvent } from 'src/posts/post.event';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly sendgrid: SendgridProvider,
    private readonly userRepository: UsersRepository,
  ) { }

  @OnEvent('user.registered', { async: true })
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    await this.notifyUserRegistration(event.email, event.name);
  }

  private async notifyUserRegistration(
    email: string,
    name: string,
  ): Promise<void> {
    const subject = '¡Bienvenido a SiChef!';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #fdf7f2; margin:0; padding:0; }
            .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05); }
            .header { text-align:center; padding:30px 20px 10px; }
            .header img { max-width:140px; }
            .content { padding:30px 40px; text-align:center; color:#5c3a1a; }
            .content h1 { font-size:22px; margin-bottom:10px; color:#8B4513; }
            .content p { font-size:16px; line-height:1.6; margin:10px 0; }
            .button { background-color:#ff6f3c; color:#8B4513 !important; text-decoration:none !important; font-weight:bold; padding:12px 28px; border-radius:6px; font-size:15px; display:inline-block; margin-top:25px; }
            .hero { margin-top:30px; }
            .hero img { width:100%; display:block; border-bottom-left-radius:8px; border-bottom-right-radius:8px; }
            .closing { font-size:13px; color:#8B4513; text-align:center; margin-top:10px; font-style:italic; }
            .footer { font-size:12px; color:#888; text-align:center; padding:20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1768880003/Logo_phn7hm.png" alt="SiChef Logo" />
            </div>
            <div class="content">
              <h1>¡Bienvenido a SiChef!</h1>
              <p>Hola <strong>${name}</strong>,</p>
              <p>Gracias por registrarte en <strong>SiChef</strong>. Aquí vas a compartir tus recetas y descubrir nuevas ideas.</p>
              <p>Tu cuenta ya está lista—cuando quieras, empezá a cocinar y publicar.</p>
              <a href="http://localhost:3000/login" class="button">Ir al login</a>
            </div>
            <div class="hero">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1767070573/dnngdc7zpccdelxbiefm.webp" alt="Bienvenido a SiChef" />
            </div>
            <div class="closing">El equipo de SiChef – ¡Buen provecho!</div>
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

  @OnEvent('post.created', { async: true })
  async handlePostCreated(event: PostEvent): Promise<void> {
    await this.notifyPostCreated(event.email, event.title, event.imageUrl);
  }

  private async notifyPostCreated(
    email: string,
    title: string,
    imageUrl: string,
  ): Promise<void> {
    const subject = '¡Gracias por tu aporte en SiChef!';
    const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', sans-serif; background-color: #fdf7f2; margin:0; padding:0; }
          .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05); }
          .header { text-align:center; padding:20px; }
          .header img { max-width:140px; }
          .content { padding:30px 40px; text-align:center; color:#5c3a1a; }
          .content h1 { font-size:22px; margin-bottom:10px; color:#8B4513; }
          .content p { font-size:16px; line-height:1.6; margin:10px 0; }
          .hero { margin-top:20px; }
          .hero img { width:100%; display:block; border-radius:8px; }
          .closing { font-size:13px; color:#8B4513; text-align:center; margin-top:10px; font-style:italic; }
          .footer { font-size:12px; color:#888; text-align:center; padding:20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1768880003/Logo_phn7hm.png" alt="SiChef Logo" />
          </div>
          <div class="content">
            <h1>¡Gracias por tu posteo!</h1>
            <p>Tu receta <strong>${title}</strong> ya está publicada en <strong>SiChef</strong>.</p>
            <p>Tu creatividad suma a la comunidad—seguí compartiendo y explorando nuevas ideas.</p>
          </div>
          <div class="hero">
            <img src="${imageUrl}" alt="Imagen del post" />
          </div>
          <div class="closing">El equipo de SiChef – ¡Buen provecho!</div>
          <div class="footer">
            Este correo fue enviado a ${email}.<br />
            © 2026 SiChef. Todos los derechos reservados.
          </div>
        </div>
      </body>
    </html>
  `;
    await this.sendgrid.sendMail(email, subject, html);
  }

  @OnEvent('post.blocked', { async: true })
  async handlePostBlocked(event: PostEvent): Promise<void> {
    const category = event.moderationCategory ?? 'contenido inadecuado';
    await this.notifyPostBlockedUser(
      event.email,
      event.title,
      event.imageUrl,
      category,
    );

    const admins = await this.userRepository.findAdmins();
    for (const admin of admins) {
      await this.notifyPostBlockedAdmin(
        admin.email,
        event.title,
        event.imageUrl,
        event.email,
        category,
      );
    }
  }

  private async notifyPostBlockedUser(
    email: string,
    title: string,
    imageUrl: string,
    category: string,
  ): Promise<void> {
    const subject = 'Tu publicación fue bloqueada en SiChef';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #fdf7f2; margin:0; padding:0; }
            .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05); }
            .header { text-align:center; padding:20px; }
            .header img { max-width:140px; }
            .content { padding:30px 40px; text-align:center; color:#5c3a1a; }
            .content h1 { font-size:22px; margin-bottom:10px; color:#8B4513; }
            .content p { font-size:16px; line-height:1.6; margin:10px 0; }
            .hero { margin-top:20px; }
            .hero img { width:100%; display:block; border-radius:8px; }
            .closing { font-size:13px; color:#8B4513; text-align:center; margin-top:10px; font-style:italic; }
            .footer { font-size:12px; color:#888; text-align:center; padding:20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1768880003/Logo_phn7hm.png" alt="SiChef Logo" />
            </div>
            <div class="content">
              <h1>Tu publicación fue bloqueada</h1>
              <p>Tu receta <strong>${title}</strong> fue bloqueada por <strong>${category}</strong>.</p>
              <p>Buscamos mantener la comunidad segura y respetuosa. Podés ajustar tu contenido y volver a publicarlo.</p>
            </div>
            <div class="hero">
              <img src="${imageUrl}" alt="Imagen del post bloqueado" />
            </div>
            <div class="closing">El equipo de SiChef – ¡Buen provecho!</div>
            <div class="footer">
              Este correo fue enviado a ${email}.<br />
              © 2026 SiChef. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
    `;
    await this.sendgrid.sendMail(email, subject, html);
  }

  private async notifyPostBlockedAdmin(
    adminEmail: string,
    title: string,
    imageUrl: string,
    userEmail: string,
    category: string,
  ): Promise<void> {
    const subject = 'Un post fue bloqueado en SiChef';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #fdf7f2; margin:0; padding:0; }
            .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05); }
            .header { text-align:center; padding:20px; }
            .header img { max-width:140px; }
            .content { padding:30px 40px; text-align:center; color:#5c3a1a; }
            .content h1 { font-size:22px; margin-bottom:10px; color:#8B4513; }
            .content p { font-size:16px; line-height:1.6; margin:10px 0; }
            .hero { margin-top:20px; }
            .hero img { width:100%; display:block; border-radius:8px; }
            .closing { font-size:13px; color:#8B4513; text-align:center; margin-top:10px; font-style:italic; }
            .footer { font-size:12px; color:#888; text-align:center; padding:20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1768880003/Logo_phn7hm.png" alt="SiChef Logo" />
            </div>
            <div class="content">
              <h1>Post bloqueado</h1>
              <p>El post <strong>${title}</strong> del usuario <strong>${userEmail}</strong> fue bloqueado por <strong>${category}</strong>.</p>
              <p>Revisá el caso en el panel de administración para seguimiento y auditoría.</p>
            </div>
            <div class="hero">
              <img src="${imageUrl}" alt="Imagen del post bloqueado" />
            </div>
            <div class="closing">El equipo de SiChef – ¡Buen provecho!</div>
            <div class="footer">
              Este correo fue enviado a ${adminEmail}.<br />
              © 2026 SiChef. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
    `;
    await this.sendgrid.sendMail(adminEmail, subject, html);
  }

  @OnEvent('post.review', { async: true })
  async handlePostReview(event: PostEvent): Promise<void> {
    const category = event.moderationCategory ?? 'contenido sensible';
    await this.notifyPostReviewUser(
      event.email,
      event.title,
      event.imageUrl,
      category,
    );

    const admins = await this.userRepository.findAdmins();
    for (const admin of admins) {
      await this.notifyPostReviewAdmin(
        admin.email,
        event.title,
        event.imageUrl,
        event.email,
        category,
      );
    }
  }

  private async notifyPostReviewUser(
    email: string,
    title: string,
    imageUrl: string,
    category: string,
  ): Promise<void> {
    const subject = 'Tu publicación está en revisión en SiChef';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #fdf7f2; margin:0; padding:0; }
            .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05); }
            .header { text-align:center; padding:20px; }
            .header img { max-width:140px; }
            .content { padding:30px 40px; text-align:center; color:#5c3a1a; }
            .content h1 { font-size:22px; margin-bottom:10px; color:#8B4513; }
            .content p { font-size:16px; line-height:1.6; margin:10px 0; }
            .hero { margin-top:20px; }
            .hero img { width:100%; display:block; border-radius:8px; }
            .closing { font-size:13px; color:#8B4513; text-align:center; margin-top:10px; font-style:italic; }
            .footer { font-size:12px; color:#888; text-align:center; padding:20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1768880003/Logo_phn7hm.png" alt="SiChef Logo" />
            </div>
            <div class="content">
              <h1>Tu publicación está en revisión</h1>
              <p>Tu receta <strong>${title}</strong> fue marcada para revisión por <strong>${category}</strong>.</p>
              <p>El equipo de moderación la evaluará y te avisaremos el resultado en breve.</p>
            </div>
            <div class="hero">
              <img src="${imageUrl}" alt="Imagen del post en revisión" />
            </div>
            <div class="closing">El equipo de SiChef – ¡Buen provecho!</div>
            <div class="footer">
              Este correo fue enviado a ${email}.<br />
              © 2026 SiChef. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
    `;
    await this.sendgrid.sendMail(email, subject, html);
  }

  private async notifyPostReviewAdmin(
    adminEmail: string,
    title: string,
    imageUrl: string,
    userEmail: string,
    category: string,
  ): Promise<void> {
    const subject = 'Un post está en revisión en SiChef';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #fdf7f2; margin:0; padding:0; }
            .container { max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05); }
            .header { text-align:center; padding:20px; }
            .header img { max-width:140px; }
            .content { padding:30px 40px; text-align:center; color:#5c3a1a; }
            .content h1 { font-size:22px; margin-bottom:10px; color:#8B4513; }
            .content p { font-size:16px; line-height:1.6; margin:10px 0; }
            .hero { margin-top:20px; }
            .hero img { width:100%; display:block; border-radius:8px; }
            .closing { font-size:13px; color:#8B4513; text-align:center; margin-top:10px; font-style:italic; }
            .footer { font-size:12px; color:#888; text-align:center; padding:20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/dolxpfwt3/image/upload/v1768880003/Logo_phn7hm.png" alt="SiChef Logo" />
            </div>
            <div class="content">
              <h1>Publicación en revisión</h1>
              <p>El post <strong>${title}</strong> del usuario <strong>${userEmail}</strong> fue marcado para revisión por <strong>${category}</strong>.</p>
              <p>Revisalo en el panel de administración para resolver el caso y dejar trazabilidad.</p>
            </div>
            <div class="hero">
              <img src="${imageUrl}" alt="Imagen del post en revisión" />
            </div>
            <div class="closing">El equipo de SiChef – ¡Buen provecho!</div>
            <div class="footer">
              Este correo fue enviado a ${adminEmail}.<br />
              © 2026 SiChef. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
    `;
    await this.sendgrid.sendMail(adminEmail, subject, html);
  }
}
