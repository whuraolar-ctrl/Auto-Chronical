import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Matches(/^\+[1-9]\d{7-14}$/,{
        message: 'Phone number must be in international format, e.g.  +2348000000000',
    })
    phone: string;

    @IsString()
    @Matches(/^[a-zA-Z0-9_]{2,19}$/,{
        message: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.',
    })
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}