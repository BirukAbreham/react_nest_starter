import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global CORs configuration
    app.enableCors({
        origin: [
            'http://localhost:5173',
        ],
        credentials: true,
    });

    // Global Validation pipe configuration
    app.useGlobalPipes(new ValidationPipe());

    // Global cookie parser
    app.use(cookieParser());

    // Environment variable configuration
    const configService = app.get<ConfigService>(ConfigService);

    await app.listen(configService.get('APP_PORT') || 5050);
}
bootstrap();
