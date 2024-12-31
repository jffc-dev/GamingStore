import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvService } from '../env/env.service';

interface SendEmailProps {
  to: string;
  subject: string;
  body: string;
}
@Injectable()
export class NotificationsService {
  constructor(private readonly envService: EnvService) {}
  async sendEmail({ to, subject, body }: SendEmailProps): Promise<void> {
    const host = this.envService.get('MAIL_HOST');
    const port = this.envService.get('MAIL_PORT');
    const user = this.envService.get('MAIL_USER');
    const pass = this.envService.get('MAIL_PASS');

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: true,
      auth: {
        user: user,
        pass: pass,
      },
    });

    await transporter.sendMail({
      from: user,
      to,
      subject,
      html: body,
    });
  }
}
