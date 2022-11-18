import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        const ACCESS_PUBLIC_KEY = readFileSync(
            join(
                __dirname,
                configService.get<string>('ACCESS_PUBLIC_SECRET_KEY'),
            ),
        );

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: ACCESS_PUBLIC_KEY,
            ignoreExpiration: false,
        });
    }

    async validate(payload: any) {        
        return payload;
    }
}
