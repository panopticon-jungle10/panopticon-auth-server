import { IsOptional, IsString, IsIn, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertUserDto {
  @ApiProperty({ description: 'OAuth provider', enum: ['github', 'google', 'email'] })
  @IsString()
  @IsIn(['github', 'google', 'email'])
  provider!: string;

  @ApiPropertyOptional({ description: 'GitHub id (when provider is github)' })
  @IsOptional()
  @IsString()
  github_id?: string;

  @ApiPropertyOptional({ description: 'Google id (when provider is google)' })
  @IsOptional()
  @IsString()
  google_id?: string;

  @ApiPropertyOptional({ description: 'Display/login name' })
  @IsOptional()
  @IsString()
  login?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL' })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
