import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
    ForbiddenException,
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO, SignupDTO, TokenDTO } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repository';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TokenFamily, User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async signup(signupDto: SignupDTO): Promise<any> {
        const user = {
            username: signupDto.username,
            email: signupDto.email,
            password: bcrypt.hashSync(signupDto.password, 10),
        };

        const newUser = await this.userRepo.create(user);

        return newUser;
    }

    async validateUser(credentials: LoginDTO): Promise<any> {
        const user = await this.userRepo.getUser(credentials.username);

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
            return user;
        }

        return null;
    }

    async signIn(user: User): Promise<TokenDTO> {
        const token: TokenDTO = await this.signToken(user);

        if (user.refreshHash) {
            let previousHash = <string>user.refreshHash;

            await this.userRepo.createUserTokenFamily({
                userId: user.id,
                tokenHash: previousHash,
            });
        }

        return token;
    }

    async refreshToken(userID: number, token: string): Promise<TokenDTO> {
        const user = await this.userRepo.getUser(userID);

        const isInvalidToken: boolean = await this.isInvalidatedToken(
            userID,
            token,
        );

        if (isInvalidToken) {
            if (user && user.refreshHash) {
                await this.userRepo.createUserTokenFamily({
                    userId: user.id,
                    tokenHash: user.refreshHash,
                });
            }

            await this.userRepo.updateRefreshToken(userID, null);

            throw new ForbiddenException({
                statusCode: HttpStatus.FORBIDDEN,
                message: 'Access denied',
            });
        }

        if (
            (user && !user.refreshHash) ||
            !user ||
            !bcrypt.compareSync(token, user.refreshHash)
        ) {
            throw new UnauthorizedException();
        }

        await this.userRepo.createUserTokenFamily({
            userId: user.id,
            tokenHash: user.refreshHash,
        });

        const newToken: TokenDTO = await this.signToken(user);

        return newToken;
    }

    async signOut(user: User) {
        const existingUser = await this.userRepo.getUser(user.id);

        if (!existingUser) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'User is not authorized',
            });
        }

        await this.userRepo.createUserTokenFamily({
            userId: existingUser.id,
            tokenHash: existingUser.refreshHash,
        });

        const updatedUser = await this.userRepo.updateRefreshToken(
            existingUser.id,
            null,
        );

        return updatedUser;
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

    private async signToken(user: User): Promise<TokenDTO> {
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

        return { accessToken, refreshToken };
    }

    private async isInvalidatedToken(
        userID: number,
        token: string,
        userTokenFamilies?: TokenFamily[],
    ): Promise<boolean> {
        let tokenFamilies;

        if (userTokenFamilies) {
            tokenFamilies = userTokenFamilies;
        } else {
            tokenFamilies = await this.userRepo.getAllUsedTokens(userID);
        }

        for (const usedToken of tokenFamilies) {
            let areTokensIdentical = bcrypt.compareSync(
                token,
                usedToken.tokenHash,
            );

            if (areTokensIdentical) {
                return true;
            }
        }

        return false;
    }
}
