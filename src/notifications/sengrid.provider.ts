import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class SendgridProvider {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendMail(to: string, subject: string, html: string) {
    const msg = {
      to,
      from: {
        email: process.env.MAIL_FROM_EMAIL!,
        name: process.env.MAIL_FROM_NAME!,
      },
      subject,
      html,
    };

    await sgMail.send(msg);
  }
}
