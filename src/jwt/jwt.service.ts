import { Injectable } from '@nestjs/common';
import { jwtVerify, SignJWT } from 'jose';

const getSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return new TextEncoder().encode(secret);
};

@Injectable()
export class JwtService {
  async verify(token: string): Promise<{ valid: boolean; payload?: any }> {
    try {
      const secret = getSecretKey();
      const { payload } = await jwtVerify(token, secret);
      return { valid: true, payload };
    } catch (err) {
      console.error('JWT verify failed', err);
      return { valid: false };
    }
  }

  async sign(payload: Record<string, any>, expiresInSeconds = 60 * 60 * 24) {
    const secret = getSecretKey();
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + expiresInSeconds)
      .sign(secret);
    return token;
  }
}
