import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:5173';
  private readonly appleJwks = createRemoteJWKSet(
    new URL('https://appleid.apple.com/auth/keys'),
  );

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // 1. Buscamos al usuario por su correo
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // 2. Comparamos la contraseña encriptada
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // 3. Si todo es correcto, creamos el "Payload" (los datos del token)
    return this.buildAuthResponse(user.id, user.email);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findPublicById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

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
}
