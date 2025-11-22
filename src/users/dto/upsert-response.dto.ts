import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UpsertResponseDto {
  @ApiProperty({ description: 'Indicates operation success' })
  success!: boolean;

  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;
}
