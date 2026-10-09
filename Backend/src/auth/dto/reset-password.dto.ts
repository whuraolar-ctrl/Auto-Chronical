import {
    IsString,
    IsNotEmpty,
    MinLength,
    MaxLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}