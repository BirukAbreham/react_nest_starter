import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { join } from 'path';

const cookieExtractor = (req: Request) => {
    let data = req?.cookies['auth-token'];

    if (!data) {
        return null;
    }

    return data;
};

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
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => cookieExtractor(req),
            ]),
            secretOrKey: REFRESH_PUBLIC_KEY,
            passReqToCallback: true,
            ignoreExpiration: false,
        });
    }

    async validate(req: Request, payload: any) {
        let data = req?.cookies["auth-token"];

        if (!data) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: "",
                error: "Unauthorized"
            });
        }

        return { ...payload, data };
    }
}
