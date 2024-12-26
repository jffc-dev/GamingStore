import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: body,
    });
  }

  async sendEmailTest(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        console.log(to);
        console.log(subject);
        console.log(body);
        resolve(1);
      }, 10000);
    });

    await promise;
  }
}
