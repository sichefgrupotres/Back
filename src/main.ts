import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { loggerGlobal } from './middlawares/logger.middlaware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(loggerGlobal);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://si-chef.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Si_Chef')
    .setDescription('API para demo del Proyecto Si_Chef')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credentialsJson) {
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json');

    fs.writeFileSync(credentialsPath, credentialsJson);

    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
  }
}
bootstrap();
