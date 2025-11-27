import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pipe global para validar DTOs automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no definidos en DTO
      forbidNonWhitelisted: false, // evita error si llega algo extra
      transform: true, // convierte strings a tipos esperados
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular dev server
      'http://localhost:8080', // HTTP-server (PWA)
      /https:\/\/.*\.vercel\.app$/, // Cualquier dominio de Vercel
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Puerto desde .env
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
