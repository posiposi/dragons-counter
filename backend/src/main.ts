import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const httpsOptions = {};

  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseDir = isProduction ? join(__dirname, '..') : process.cwd();
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

  const app = await NestFactory.create(AppModule, { httpsOptions });

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const httpsPort = process.env.HTTPS_PORT ?? 3443;

  await app.listen(httpsPort, '0.0.0.0');
  console.log(
    `HTTPS Application is running on: https://localhost:${httpsPort}`,
  );
}
void bootstrap();
