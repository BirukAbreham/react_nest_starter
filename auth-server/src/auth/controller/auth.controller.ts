import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
    async sign_in(@Body() loginDto: LoginDTO) {
        const user = await this.authService.validateUser(loginDto);

        if (!user) throw new UnauthorizedException();

        return await this.authService.signIn(user);
    }

    @Post('/sign_out')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async sign_out(@GetUser() user: any) {
        const logout = await this.authService.nullifyRefToken(user.id);

        return logout;
    }

    @Post('/refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt_refresh'))
    async refresh(
        @GetUser() user: any,
        @Headers('Authorization') authorization: string,
    ): Promise<TokenDTO> {
        const token = authorization.replace('Bearer', '').trim();

        return await this.authService.refreshToken(user.id, token);
    }

    @Get('/user/:userID')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    async get_user(@Param('userID') userID: number): Promise<User> {
        return await this.authService.getUser(userID);
    }
}
