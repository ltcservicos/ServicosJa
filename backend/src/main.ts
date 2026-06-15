import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Aumenta o limite do body para suportar imagens em base64
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS aberto para o frontend Vite (porta 5173)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // /api para a API; blog e arquivos de SEO ficam na raiz (server-rendered)
  app.setGlobalPrefix('api', {
    exclude: ['blog', 'blog/:slug', 'servico', 'servico/:slug', 'sitemap.xml', 'robots.txt'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 ServiçoJá API rodando em http://localhost:${port}/api`);
}
bootstrap();
