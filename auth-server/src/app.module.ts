import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DBModule } from './db/db.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.development'],
            isGlobal: true,
            cache: true,
        }),
        DBModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
