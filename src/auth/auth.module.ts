import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtService } from '../jwt/jwt.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [JwtService],
})
export class AuthModule {}
