import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UpsertResponseDto {
  @ApiProperty({ description: 'Indicates operation success' })
  success!: boolean;

  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;

  @ApiPropertyOptional({ description: 'JWT token for OAuth authentication' })
  token?: string;
}
