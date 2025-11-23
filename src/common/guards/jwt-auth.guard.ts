import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try to get token from Authorization header first
    let token = null;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace(/^Bearer /, '');
    }

    // If not in header, try to get from cookies
    if (!token && request.cookies) {
      token = request.cookies['auth-token'];
    }

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const { valid, payload } = await this.jwtService.verify(token);

    if (!valid || !payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = payload;
    return true;
  }
}
