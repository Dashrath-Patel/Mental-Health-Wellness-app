import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsEnum(['local', 'google', 'passkey'])
  @IsOptional()
  authMethod?: string;

  @IsString()
  @IsOptional()
  googleId?: string;
}
