import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller';
import { UserRepository } from './repository';
import { AuthService } from './services';
import { JwtRefreshStrategy, JwtStrategy } from './strategy';

@Module({
    imports: [PassportModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [AuthService, UserRepository, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
