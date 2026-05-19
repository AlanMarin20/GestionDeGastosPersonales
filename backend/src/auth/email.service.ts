import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = this.configService.get<number>('SMTP_PORT') ?? 587;
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') ?? 'GestiónGastos';
    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL') ?? user;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Email configurado con SMTP: ${host}`);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.warn(
        `SMTP no configurado — usando Ethereal (dev). Ver emails en https://ethereal.email`,
      );
    }

    (this.transporter as any)._fromName = fromName;
    (this.transporter as any)._fromEmail = fromEmail;
  }

  async sendPasswordResetCode(to: string, code: string) {
    const from = `"${(this.transporter as any)._fromName}" <${(this.transporter as any)._fromEmail ?? 'noreply@gestgastos.local'}>`;

    const info = await this.transporter.sendMail({
      from,
      to,
      subject: 'Tu código de verificación — GestiónGastos',
      text: `Tu código de verificación es: ${code}\n\nEste código expira en 15 minutos. Si no solicitaste esto, ignorá este mensaje.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#1e293b;margin-bottom:8px">Código de verificación</h2>
          <p style="color:#475569;margin-bottom:24px">Usá este código para restablecer tu contraseña en <strong>GestiónGastos</strong>.</p>
          <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#0f172a">
            ${code}
          </div>
          <p style="color:#94a3b8;font-size:13px;margin-top:20px">Expira en 15 minutos. Si no solicitaste esto, ignorá este mensaje.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`Preview del email (Ethereal): ${previewUrl}`);
    }
  }
}
