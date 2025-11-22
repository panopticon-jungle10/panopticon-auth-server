import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  displayName?: string;

  @ApiProperty()
  avatarUrl!: string;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty()
  role!: string;

  @ApiProperty({ required: false })
  provider?: string;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
