import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt_refresh',
) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('REFRESH_KEY_SECRET'),
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
