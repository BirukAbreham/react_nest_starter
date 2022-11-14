import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO, SignupDTO, TokenDTO } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRepository } from '../repository';

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

    async refreshToken(id: number, token: string): Promise<TokenDTO> {
        const user = await this.userRepo.getUser(id);

        if (!user || !bcrypt.compareSync(token, user.refresh_hash)) {
            throw new UnauthorizedException();
        }

        const newToken: TokenDTO = await this.signToken(user);

        return newToken;
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

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.sign(payload, {
                secret: this.configService.get('ACCESS_KEY_SECRET'),
                expiresIn: this.configService.get('ACCESS_KEY_EXPIRE'),
                algorithm: 'HS256',
            }),
            this.jwtService.sign(refreshPayload, {
                secret: this.configService.get('REFRESH_KEY_SECRET'),
                expiresIn: this.configService.get('REFRESH_KEY_EXPIRE'),
                algorithm: 'HS256',
            }),
        ]);

        await this.userRepo.updateRefreshToken(user.id, bcrypt.hashSync(refreshToken, 10));

        return { access_token: accessToken, refresh_token: refreshToken };
    }
}