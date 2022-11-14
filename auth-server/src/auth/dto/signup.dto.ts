import {
    IsEmail,
    IsNotEmpty,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Match } from '../decorator';

export class SignupDTO {
    @IsNotEmpty({ message: 'Username field cannot be empty' })
    @MinLength(4, {
        message: 'Username field length is below minimum length of four',
    })
    @MaxLength(40, {
        message: 'Username field exceeds maximum length of forty',
    })
    username: string;

    @IsEmail({ message: 'Email field is not in proper email format' })
    @IsNotEmpty({ message: 'Email field cannot be empty' })
    email: string;

    @IsNotEmpty({ message: 'Password field cannot be empty' })
    @MinLength(8, {
        message: 'Password field length is below minimum length of eight',
    })
    @MaxLength(40, {
        message: 'Password field exceeds maximum length of forty',
    })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            "Password field should be strong, don't use common passwords and use character combinations",
    })
    password: string;

    @Match('password', {
        message: 'Password confirmation is not the same as the password',
    })
    password_confirmed: string;
}
