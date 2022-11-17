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
import { Request, Response } from 'express';
import { GetUser } from '../decorator';
import { LoginDTO, SignupDTO, TokenDTO } from '../dto';
import { User } from '../repository';
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
        @Body() loginDto: LoginDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(loginDto);

        if (!user) throw new UnauthorizedException();

        const token: TokenDTO = await this.authService.signIn(user);

        const { secureCookie, date, path } =
            this.authService.authCookieOptions();

        res.cookie('auth-token', token.refresh_token, {
            path: path,
            expires: date,
            httpOnly: true,
            secure: secureCookie,
        });

        return { access_token: token.access_token };
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

        const { secureCookie, date, path } =
            this.authService.authCookieOptions();

        res.cookie('auth-token', token.refresh_token, {
            path: path,
            expires: date,
            httpOnly: true,
            secure: secureCookie,
        });

        return { access_token: token.access_token };
    }

    @Post('/sign_out')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async sign_out(
        @GetUser() user: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        const logout = await this.authService.nullifyRefToken(user.id);

        res.clearCookie("auth-token");

        return logout;
    }

    @Get('/user/:username')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async get_user(@Param('username') username: string): Promise<User> {
        const user = await this.authService.getUser(username);

        const { password, refresh_hash, ...theReset } = user;

        return <User>theReset;
    }
}
