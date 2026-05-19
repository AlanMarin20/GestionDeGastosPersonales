import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private resend: Resend | null = null;
  private fromAddress = '"GestiónGastos" <onboarding@resend.dev>';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromName =
      this.configService.get<string>('SMTP_FROM_NAME') ?? 'GestiónGastos';
    const fromEmail =
      this.configService.get<string>('SMTP_FROM_EMAIL') ?? 'onboarding@resend.dev';

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.fromAddress = `"${fromName}" <${fromEmail}>`;
      this.logger.log('Email configurado con Resend');
      return;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = this.configService.get<number>('SMTP_PORT') ?? 587;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.fromAddress = `"${fromName}" <${fromEmail ?? user}>`;
      this.logger.log(`Email configurado con SMTP: ${host}`);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.fromAddress = `"${fromName}" <${testAccount.user}>`;
      this.logger.warn(
        'SMTP no configurado — usando Ethereal (dev). Ver emails en https://ethereal.email',
      );
    }
  }

  async sendPasswordResetCode(to: string, code: string) {
    const subject = 'Tu código de verificación — GestiónGastos';
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1e293b;margin-bottom:8px">Código de verificación</h2>
        <p style="color:#475569;margin-bottom:24px">Usá este código para restablecer tu contraseña en <strong>GestiónGastos</strong>.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#0f172a">
          ${code}
        </div>
        <p style="color:#94a3b8;font-size:13px;margin-top:20px">Expira en 15 minutos. Si no solicitaste esto, ignorá este mensaje.</p>
      </div>
    `;

    if (this.resend) {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        html,
      });
      return;
    }

    const info = await this.transporter!.sendMail({
      from: this.fromAddress,
      to,
      subject,
      text: `Tu código de verificación es: ${code}\n\nEste código expira en 15 minutos. Si no solicitaste esto, ignorá este mensaje.`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`Preview del email (Ethereal): ${previewUrl}`);
    }
  }
}
