import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  // Query,
  // Res,
  Request,
  UseGuards,
} from '@nestjs/common';
// import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(name, email, password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-registration-email')
  verifyRegistrationEmail(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyRegistrationEmail(email, code);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-registration-code')
  resendRegistrationCode(@Body('email') email: string) {
    return this.authService.resendRegistrationCode(email);
  }

  @HttpCode(HttpStatus.OK) // Devolvemos 200 OK en lugar del 201 Created (por defecto en los POST)
  @Post('login')
  login(@Body() signInDto: Record<string, string>) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  /*
  OAuth de terceros (Google/Apple) deshabilitado temporalmente.
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
  */

  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return { message: 'Si el correo está registrado, recibirás un código.' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-code')
  verifyResetCode(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyResetCode(email, code);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, code, newPassword);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.changePassword(
      req.user.sub,
      currentPassword,
      newPassword,
    );
  }

  // El @UseGuards activa nuestro "cadenero". Si no hay token válido, rechaza la petición.
  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('activate-advisor')
  async activateAdvisor(
    @Request() req,
    @Body('acceptedTerms') acceptedTerms: boolean,
  ) {
    if (!acceptedTerms) {
      throw new BadRequestException(
        'Debes aceptar los términos y condiciones para continuar',
      );
    }
    return this.authService.activateAdvisor(req.user.sub);
  }

  /*
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
  */
}
