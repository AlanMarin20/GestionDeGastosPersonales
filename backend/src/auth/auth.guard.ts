import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }
    try {
      // El JwtService ya conoce el secret porque lo configuramos en el AuthModule
      const payload = await this.jwtService.verifyAsync(token);
      // Asignamos el payload a la request para usarlo en nuestras rutas protegidas
      request['user'] = payload;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Detalle del error JWT:', errorMessage);
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
