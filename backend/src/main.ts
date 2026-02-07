import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DomainExceptionFilter } from './application/filters/domain-exception.filter';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  let app: INestApplication;

  if (isProduction) {
    // 本番環境: HTTP (ALBがHTTPSターミネーションを行う)
    app = await NestFactory.create(AppModule);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];

    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.setGlobalPrefix('api', {
      exclude: ['health'],
    });

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new DomainExceptionFilter());

    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
  } else {
    // 開発環境: HTTPS (自己署名証明書)
    const httpsOptions = {};

    try {
      const baseDir = process.cwd();
      const keyPath = join(baseDir, 'certs', 'localhost-key.pem');
      const certPath = join(baseDir, 'certs', 'localhost.pem');

      console.log(
        `Attempting to load certificates from: ${keyPath}, ${certPath}`,
      );
      httpsOptions['key'] = readFileSync(keyPath);
      httpsOptions['cert'] = readFileSync(certPath);
      console.log('HTTPS certificates loaded successfully');
    } catch (error) {
      throw new Error(
        `HTTPS certificates not found: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    app = await NestFactory.create(AppModule, { httpsOptions });

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [];

    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.setGlobalPrefix('api', {
      exclude: ['health'],
    });

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new DomainExceptionFilter());

    const httpsPort = process.env.HTTPS_PORT ?? 3443;
    await app.listen(httpsPort, '0.0.0.0');
    console.log(
      `HTTPS Application is running on: https://localhost:${httpsPort}`,
    );
  }
}
void bootstrap();
