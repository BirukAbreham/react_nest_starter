import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global CORs configuration
    app.enableCors({ origin: "*" });

    // Global Validation pipe configuration
    app.useGlobalPipes(new ValidationPipe());

    // Environment variable configuration
    const configService = app.get<ConfigService>(ConfigService);

    await app.listen(configService.get("APP_PORT") || 5050);
}
bootstrap();
