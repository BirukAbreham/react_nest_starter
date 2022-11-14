import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { join } from 'path';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt_refresh',
) {
    constructor(private readonly configService: ConfigService) {
        const REFRESH_PUBLIC_KEY = readFileSync(
            join(
                __dirname,
                configService.get<string>('REFRESH_PUBLIC_SECRET_KEY'),
            ),
        );

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: REFRESH_PUBLIC_KEY,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: any) {
        const refreshToken = request
            .get('Authorization')
            .replace('Bearer', '')
            .trim();

        return { ...payload, refreshToken };
    }
}
