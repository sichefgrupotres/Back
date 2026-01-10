import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

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

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
