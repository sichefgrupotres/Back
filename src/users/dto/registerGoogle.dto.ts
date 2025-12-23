import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterGoogleDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsString()
  googleId: string;
}
