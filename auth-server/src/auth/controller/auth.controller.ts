import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { GetUser } from '../decorator';
import { LoginDTO, SignupDTO, TokenDTO } from '../dto';
import { AuthService } from '../services';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/sign_up')
    @HttpCode(HttpStatus.CREATED)
    async sign_up(@Body() signupDto: SignupDTO): Promise<TokenDTO> {
        const newUser = await this.authService.signup(signupDto);

        const { password, refresh_hash, ...theRest } = newUser;

        return theRest;
    }

    @Post('/sign_in')
    @HttpCode(HttpStatus.OK)
    async sign_in(
        @Body() credentials: LoginDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(credentials);

        if (!user) throw new UnauthorizedException();

        const token: TokenDTO = await this.authService.signIn(user);

        const { secureCookie, date } =
            this.authService.authCookieOptions();

        res.cookie('auth-token', token.refreshToken, {
            expires: date,
            httpOnly: true,
            secure: secureCookie,
        });

        return { accessToken: token.accessToken };
    }

    @Post('/refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt_refresh'))
    async refresh(
        @GetUser() user: any,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const requestToken = req?.cookies['auth-token'];

        const token: TokenDTO = await this.authService.refreshToken(
            user.id,
            requestToken,
        );

        const { secureCookie, date } =
            this.authService.authCookieOptions();

        res.cookie('auth-token', token.refreshToken, {
            expires: date,
            httpOnly: true,
            secure: secureCookie,
        });

        return { accessToken: token.accessToken };
    }

    @Post('/sign_out')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async sign_out(
        @GetUser() user: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.nullifyRefToken(user.id);

        res.clearCookie('auth-token');

        return { message: `user signed out` };
    }

    @Get('/dummy_json')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async get_dummy_json() {
        return {
            userId: 1,
            id: 1,
            title: 'delectus aut autem',
            completed: false,
        };
    }

    @Get('/user/:username')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async get_user(@Param('username') username: string): Promise<User> {
        const user = await this.authService.getUser(username);

        const { password, refreshHash, ...theReset } = user;

        return <User>theReset;
    }
}
