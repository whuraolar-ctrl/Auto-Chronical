import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
} from 'class-validator';

export class LoginDto {
    //Email, Phone number (with country code),or username can be used.
    @IsString()
    @IsNotEmpty()
    @MaxLength(254)
    identifier: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(72)
    password: string;
}