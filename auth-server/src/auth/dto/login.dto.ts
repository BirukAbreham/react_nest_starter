import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
    @IsNotEmpty({ message: 'Username field cannot be empty' })
    username: string;

    @IsNotEmpty({ message: 'Password field cannot be empty' })
    password: string;
}
