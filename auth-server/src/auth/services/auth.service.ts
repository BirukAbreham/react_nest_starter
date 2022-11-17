import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO, SignupDTO, TokenDTO } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRepository } from '../repository';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async validateUser(loginDto: LoginDTO): Promise<any> {
        const user = await this.userRepo.getUser(loginDto.username);

        if (user && bcrypt.compareSync(loginDto.password, user.password)) {
            const { password, refresh_hash, ...result } = user;

            return result;
        }

        return null;
    }

    async signIn(user: any): Promise<TokenDTO> {
        const token: TokenDTO = await this.signToken(user);

        return token;
    }

    async signup(signupDto: SignupDTO): Promise<any> {
        const user = {
            username: signupDto.username,
            email: signupDto.email,
            password: bcrypt.hashSync(signupDto.password, 10),
        };

        const newUser = await this.userRepo.create(user);

        return newUser;
    }

    async nullifyRefToken(id: number): Promise<any> {
        const updatedUser = await this.userRepo.updateRefreshToken(id, null);

        return updatedUser;
    }

    async refreshToken(userID: number, token: string): Promise<TokenDTO> {
        const user = await this.userRepo.getUser(userID);

        if (!user || !bcrypt.compareSync(token, user.refresh_hash)) {
            throw new UnauthorizedException();
        }

        const newToken: TokenDTO = await this.signToken(user);

        return newToken;
    }

    async getUser(username: string): Promise<User> {
        const user = await this.userRepo.getUser(username);

        if (user === null) {
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `User by the username ${username} could not be found in the record`,
            });
        }

        return user;
    }

    authCookieOptions(): { date: Date; secureCookie: boolean; path: string } {
        let refreshExpire =
            this.configService.get<string>('REFRESH_KEY_EXPIRE');

        let milliSeconds = Number(
            refreshExpire.substring(0, refreshExpire.length - 2),
        );

        let date = new Date();

        date.setMilliseconds(date.getMilliseconds() + milliSeconds);

        const secureCookie = this.configService.get<string>('COOKIE_SECURE');

        const path = this.configService.get<string>('COOKIE_PATH');

        return {
            date,
            path,
            secureCookie: secureCookie === 'false' ? false : true,
        };
    }

    private async signToken(user: any): Promise<TokenDTO> {
        const payload = {
            sub: crypto.randomUUID().split('-').join('').substring(0, 10),
            id: user.id,
            email: user.email,
            username: user.username,
        };

        const refreshPayload = {
            sub: payload.sub,
            id: payload.id,
        };

        const ACCESS_PRIVATE_KEY = readFileSync(
            join(
                __dirname,
                this.configService.get<string>('ACCESS_PRIVATE_SECRET_KEY'),
            ),
        );

        const REFRESH_PRIVATE_KEY = readFileSync(
            join(
                __dirname,
                this.configService.get<string>('REFRESH_PRIVATE_SECRET_KEY'),
            ),
        );

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.sign(payload, {
                privateKey: ACCESS_PRIVATE_KEY,
                expiresIn: this.configService.get('ACCESS_KEY_EXPIRE'),
                algorithm: 'ES256',
            }),
            this.jwtService.sign(refreshPayload, {
                privateKey: REFRESH_PRIVATE_KEY,
                expiresIn: this.configService.get('REFRESH_KEY_EXPIRE'),
                algorithm: 'ES256',
            }),
        ]);

        await this.userRepo.updateRefreshToken(
            user.id,
            bcrypt.hashSync(refreshToken, 10),
        );

        return { access_token: accessToken, refresh_token: refreshToken };
    }
}
