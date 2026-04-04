import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule, // Importamos el módulo de usuarios para usar su servicio
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'mi_clave_secreta_super_segura',
      signOptions: { expiresIn: '1d' }, // El token expirará en 1 día
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
