import { Controller, Post, Body, Headers, UnauthorizedException, Get, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '../jwt/jwt.service';
import { UpsertUserDto } from './dto/upsert-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  @Post()
  async upsertUser(@Body() body: UpsertUserDto, @Headers('authorization') auth?: string) {
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException('Missing Authorization');
    const token = auth.replace(/^Bearer /, '');
    const { valid } = await this.jwtService.verify(token);
    if (!valid) throw new UnauthorizedException('Invalid token');

    try {
      const user = await this.usersService.upsert(body);
      return { success: true, user };
    } catch (err: any) {
      // UsersService throws BadRequestException for client errors
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(err?.message || 'Failed to upsert user');
    }
  }
}

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'panopticon-auth-server' };
  }
}
