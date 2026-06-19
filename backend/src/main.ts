import { setDefaultResultOrder } from 'node:dns';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { express } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  // Servir frontend compilado como archivos estáticos
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.useStaticAssets(frontendPath, {
    prefix: '/',
    index: false,
  });

  // SPA fallback: redirigir rutas desconocidas a index.html para el frontend
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('*', (req, res) => {
    const filePath = path.join(frontendPath, req.path);
    // Si no es una ruta de API y no es un archivo, servir index.html
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
