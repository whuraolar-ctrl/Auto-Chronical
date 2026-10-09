import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class CompleteProfileDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;


    @IsString()
    @Matches(/^\+[1-9]\d{7-14}$/, {
        message: 'Phone number must be in international format, e.g.  +2348000000000',
    })
    phone: string;

    
    @IsString()
    @Matches(/^[a-zA-Z0-9_]{2,19}$/, {
        message: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.',
    })
    username: string;
}
