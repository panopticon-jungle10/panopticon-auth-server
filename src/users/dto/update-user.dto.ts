import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'New Display Name',
    description: '사용자 표시 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    example: 'https://...',
    description: '프로필 이미지 URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
