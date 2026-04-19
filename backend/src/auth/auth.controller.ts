import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // Devolvemos 200 OK en lugar del 201 Created (por defecto en los POST)
  @Post('login')
  login(@Body() signInDto: Record<string, string>) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Get('google')
  googleLogin(@Res() res: Response) {
    return res.redirect(this.authService.getGoogleAuthorizationUrl());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.redirect(
        this.authService.buildOAuthErrorRedirect(
          'Google no devolvió un código de autenticación',
        ),
      );
    }

    try {
      const result = await this.authService.loginWithGoogleCode(code);
      return res.redirect(
        this.authService.buildOAuthSuccessRedirect(result.access_token),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión con Google';

      return res.redirect(this.authService.buildOAuthErrorRedirect(errorMessage));
    }
  }

  @Get('apple')
  appleLogin(@Res() res: Response) {
    return res.redirect(this.authService.getAppleAuthorizationUrl());
  }

  @Get('apple/callback')
  async appleCallbackGet(@Query('code') code: string, @Res() res: Response) {
    return this.handleAppleCallback(code, res);
  }

  @Post('apple/callback')
  async appleCallbackPost(
    @Body('code') code: string,
    @Res() res: Response,
  ) {
    return this.handleAppleCallback(code, res);
  }

  // El @UseGuards activa nuestro "cadenero". Si no hay token válido, rechaza la petición.
  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  private async handleAppleCallback(code: string, res: Response) {
    if (!code) {
      return res.redirect(
        this.authService.buildOAuthErrorRedirect(
          'Apple no devolvió un código de autenticación',
        ),
      );
    }

    try {
      const result = await this.authService.loginWithAppleCode(code);
      return res.redirect(
        this.authService.buildOAuthSuccessRedirect(result.access_token),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión con Apple';

      return res.redirect(this.authService.buildOAuthErrorRedirect(errorMessage));
    }
  }
}
