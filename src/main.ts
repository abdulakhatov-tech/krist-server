import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';

// Load environment variables
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Increase payload size limit
    app.use(express.json({ limit: '50mb' })); // Adjust as needed
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin:[
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://krist-shop-three.vercel.app',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
