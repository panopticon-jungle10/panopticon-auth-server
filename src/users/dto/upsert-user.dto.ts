import { IsOptional, IsString, IsIn, IsEmail } from 'class-validator';

export class UpsertUserDto {
  @IsString()
  @IsIn(['github', 'google', 'email'])
  provider!: string;

  @IsOptional()
  @IsString()
  github_id?: string;

  @IsOptional()
  @IsString()
  google_id?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
