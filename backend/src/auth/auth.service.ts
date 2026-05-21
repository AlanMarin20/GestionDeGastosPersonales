import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomInt, randomBytes } from 'crypto';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

const RESET_CODE_TTL_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private dataSource: DataSource,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Verificá tu correo antes de iniciar sesión');
    }

    return this.buildAuthResponse(user.id, user.email);
  }

  async register(name: string, email: string, password: string) {
    const user = await this.usersService.create({ name, email, password });
    const code = String(randomInt(100000, 999999));
    const codeHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
    await this.usersService.saveResetCode(user!.id, codeHash, expiresAt);
    await this.emailService.sendRegistrationVerificationCode(user!.email, code);
    return { message: 'Cuenta creada. Verificá tu correo para activarla.' };
  }

  async verifyRegistrationEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user?.resetCodeHash || !user.resetCodeExpiresAt) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (new Date() > user.resetCodeExpiresAt) {
      await this.usersService.clearResetCode(user.id);
      throw new BadRequestException('El código expiró. Solicitá uno nuevo.');
    }

    const hash = createHash('sha256').update(code.trim()).digest('hex');
    if (hash !== user.resetCodeHash) {
      throw new BadRequestException('Código incorrecto');
    }

    await this.usersService.setEmailVerified(user.id);
    await this.usersService.clearResetCode(user.id);

    return { message: 'Correo verificado. Ya podés iniciar sesión.' };
  }

  async resendRegistrationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No existe una cuenta asociada a ese correo');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Esta cuenta ya está verificada');
    }

    const code = String(randomInt(100000, 999999));
    const codeHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
    await this.usersService.saveResetCode(user.id, codeHash, expiresAt);
    await this.emailService.sendRegistrationVerificationCode(user.email, code);

    return { message: 'Nuevo código enviado.' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findPublicById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const userRoles = await this.dataSource.getRepository(UserRole).find({
      where: { user: { id: userId } },
      relations: { role: true },
    });

    return {
      ...user,
      roles: userRoles
        .map((ur) => ur.role?.nombre)
        .filter((name): name is string => Boolean(name)),
    };
  }

  async generateLinkCode(userId: string): Promise<{ codigoVinculacion: string; expiraEn: Date }> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(12);
    const raw = Array.from(bytes, (b) => chars[b % chars.length]).join('');
    const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
    const expiraEn = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await this.dataSource.query(
      `UPDATE usuarios
       SET codigo_vinculacion = $1,
           codigo_expira_en   = $2
       WHERE id = $3`,
      [code, expiraEn, userId],
    );

    return { codigoVinculacion: code, expiraEn };
  }

  async activateAdvisor(userId: string): Promise<{ roles: string[] }> {
    const asesorRole = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { nombre: 'asesor' } });

    if (!asesorRole) {
      throw new BadRequestException(
        'El rol de asesor no está configurado en el sistema',
      );
    }

    const existing = await this.dataSource.getRepository(UserRole).findOne({
      where: { user: { id: userId }, role: { id: asesorRole.id } },
      relations: { user: true, role: true },
    });

    if (!existing) {
      const userRole = this.dataSource.getRepository(UserRole).create({
        user: { id: userId } as User,
        role: { id: asesorRole.id } as Role,
      });
      await this.dataSource.getRepository(UserRole).save(userRole);
    }

    return { roles: ['asesor'] };
  }

  /*
  OAuth de terceros (Google/Apple) deshabilitado temporalmente.
  getGoogleAuthorizationUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new BadRequestException(
        'Google OAuth no está configurado en el servidor',
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  getAppleAuthorizationUrl() {
    const clientId = process.env.APPLE_CLIENT_ID;
    const redirectUri = process.env.APPLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new BadRequestException(
        'Apple OAuth no está configurado en el servidor',
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'form_post',
      scope: 'name email',
    });

    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  async loginWithGoogleCode(code: string) {
    if (!code) {
      throw new BadRequestException('No se recibió el código de Google');
    }

    const tokenData = await this.exchangeGoogleCode(code);
    const idToken = String(tokenData.id_token ?? '');

    if (!idToken) {
      throw new UnauthorizedException(
        'Google no devolvió un token de identidad válido',
      );
    }

    const profile = await this.validateGoogleIdToken(idToken);
    return this.resolveSocialUser(profile.email, profile.name);
  }

  async loginWithAppleCode(code: string) {
    if (!code) {
      throw new BadRequestException('No se recibió el código de Apple');
    }

    const tokenData = await this.exchangeAppleCode(code);
    const idToken = String(tokenData.id_token ?? '');

    if (!idToken) {
      throw new UnauthorizedException(
        'Apple no devolvió un token de identidad válido',
      );
    }

    const profile = await this.parseAppleIdToken(idToken);
    return this.resolveSocialUser(profile.email, profile.name);
  }

  buildOAuthSuccessRedirect(accessToken: string) {
    const url = new URL('/auth/callback', this.frontendUrl);
    url.searchParams.set('access_token', accessToken);
    return url.toString();
  }

  buildOAuthErrorRedirect(message: string) {
    const url = new URL('/auth/callback', this.frontendUrl);
    url.searchParams.set('error', message);
    return url.toString();
  }

  private async buildAuthResponse(userId: string, email: string) {
    const payload = { sub: userId, email };
    const publicUser = await this.usersService.findPublicById(userId);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: publicUser,
    };
  }

  private async resolveSocialUser(email: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      return this.buildAuthResponse(existingUser.id, existingUser.email);
    }

    const fallbackName =
      name?.trim() || normalizedEmail.split('@')[0] || 'Usuario';
    const generatedPassword = randomBytes(24).toString('hex');

    const newUser = await this.usersService.create({
      name: fallbackName,
      email: normalizedEmail,
      password: generatedPassword,
    });

    if (!newUser) {
      throw new UnauthorizedException(
        'No se pudo crear la cuenta social del usuario',
      );
    }

    return this.buildAuthResponse(newUser.id, newUser.email);
  }

  private async exchangeGoogleCode(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        'Variables de entorno de Google OAuth incompletas',
      );
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new UnauthorizedException('No se pudo autenticar con Google');
    }

    return (await response.json()) as Record<string, unknown>;
  }

  private async validateGoogleIdToken(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new BadRequestException(
        'Variables de entorno de Google OAuth incompletas',
      );
    }

    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(tokenInfoUrl);

    if (!response.ok) {
      throw new UnauthorizedException('Token de Google inválido');
    }

    const tokenInfo = (await response.json()) as Record<string, unknown>;
    const aud = String(tokenInfo.aud ?? '');
    const email = String(tokenInfo.email ?? '').trim().toLowerCase();
    const emailVerified = String(tokenInfo.email_verified ?? '').toLowerCase();
    const name = String(tokenInfo.name ?? tokenInfo.given_name ?? '').trim();

    if (aud !== clientId) {
      throw new UnauthorizedException('La audiencia del token de Google no coincide');
    }

    if (!email || emailVerified !== 'true') {
      throw new UnauthorizedException(
        'Google no devolvió un correo verificado para esta cuenta',
      );
    }

    return {
      email,
      name,
    };
  }

  private async exchangeAppleCode(code: string) {
    const clientId = process.env.APPLE_CLIENT_ID;
    const clientSecret = process.env.APPLE_CLIENT_SECRET;
    const redirectUri = process.env.APPLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        'Variables de entorno de Apple OAuth incompletas',
      );
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new UnauthorizedException('No se pudo autenticar con Apple');
    }

    return (await response.json()) as Record<string, unknown>;
  }

  private async parseAppleIdToken(idToken: string) {
    const clientId = process.env.APPLE_CLIENT_ID;

    if (!clientId) {
      throw new BadRequestException(
        'Variables de entorno de Apple OAuth incompletas',
      );
    }

    let payload: Record<string, unknown>;

    try {
      const verificationResult = await jwtVerify(idToken, this.appleJwks, {
        issuer: 'https://appleid.apple.com',
        audience: clientId,
      });
      payload = verificationResult.payload as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Token de Apple inválido');
    }

    const email = String(payload.email ?? '').trim().toLowerCase();
    const emailVerified = String(payload.email_verified ?? '').toLowerCase();

    if (!email || (emailVerified && emailVerified !== 'true')) {
      throw new UnauthorizedException(
        'Apple no devolvió un correo verificado para esta cuenta',
      );
    }

    return {
      email,
      name: '',
    };
  }
  */

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No existe una cuenta asociada a ese correo');
    }

    const code = String(randomInt(100000, 999999));
    const codeHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

    await this.usersService.saveResetCode(user.id, codeHash, expiresAt);
    await this.emailService.sendPasswordResetCode(email, code);
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user?.resetCodeHash || !user.resetCodeExpiresAt) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (new Date() > user.resetCodeExpiresAt) {
      await this.usersService.clearResetCode(user.id);
      throw new BadRequestException('El código expiró. Solicitá uno nuevo.');
    }

    const hash = createHash('sha256').update(code.trim()).digest('hex');
    if (hash !== user.resetCodeHash) {
      throw new BadRequestException('Código incorrecto');
    }

    return { valid: true };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user?.resetCodeHash || !user.resetCodeExpiresAt) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (new Date() > user.resetCodeExpiresAt) {
      await this.usersService.clearResetCode(user.id);
      throw new BadRequestException('El código expiró. Solicitá uno nuevo.');
    }

    const hash = createHash('sha256').update(code.trim()).digest('hex');
    if (hash !== user.resetCodeHash) {
      throw new BadRequestException('Código incorrecto');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordHash(user.id, newHash);
    await this.usersService.clearResetCode(user.id);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findPublicById(userId))!.email,
    );
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordHash(userId, newHash);

    return { message: 'Contraseña actualizada correctamente' };
  }

  private async buildAuthResponse(userId: string, email: string) {
    const payload = { sub: userId, email };
    const publicUser = await this.usersService.findPublicById(userId);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: publicUser,
    };
  }
}
