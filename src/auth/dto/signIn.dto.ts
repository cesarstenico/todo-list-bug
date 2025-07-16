import { IsEmail, IsString, MinLength } from 'class-validator';

export class signInDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    pass: string;
}
