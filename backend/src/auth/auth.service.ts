import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
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
    const payload = { sub: user.id, email: user.email };

    // 4. Devolvemos el Token y los datos públicos del usuario
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
