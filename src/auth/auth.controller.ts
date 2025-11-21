import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import axios from 'axios';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiQuery({ name: 'code', required: true })
  @ApiResponse({ status: 200, description: 'Returns JWT and user' })
  @Get('github/callback')
  async githubCallback(@Query('code') code: string) {
    if (!code) throw new BadRequestException('Missing code');

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;
    if (!clientId || !clientSecret) throw new BadRequestException('GitHub OAuth not configured');

    // Exchange code for access token
    const tokenResp = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri },
      { headers: { Accept: 'application/json' } },
    );
    const accessToken = tokenResp.data?.access_token;
    if (!accessToken) throw new BadRequestException('Failed to obtain access token from GitHub');

    // Fetch profile
    const profileResp = await axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } });
    const profile = profileResp.data;

    // Try to get primary email if not present
    let email: string | undefined = profile.email;
    let emailVerified = false;
    if (!email) {
      try {
        const emails = await axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } });
        const primary = emails.data.find((e: any) => e.primary) || emails.data[0];
        if (primary) {
          email = primary.email;
          emailVerified = primary.verified || false;
        }
      } catch (e) {
        // ignore
      }
    } else {
      emailVerified = true;
    }

    const user = await this.usersService.upsert({
      provider: 'github',
      providerAccountId: String(profile.id),
      login: profile.login,
      email,
      avatar_url: profile.avatar_url,
      profile,
      email_verified: emailVerified,
    });

    const token = await this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user };
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiQuery({ name: 'code', required: true })
  @Get('google/callback')
  async googleCallback(@Query('code') code: string) {
    if (!code) throw new BadRequestException('Missing code');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !clientSecret) throw new BadRequestException('Google OAuth not configured');

    // Exchange code for tokens
    const tokenResp = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const accessToken = tokenResp.data?.access_token;
    if (!accessToken) throw new BadRequestException('Failed to obtain access token from Google');

    const profileResp = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
    const profile = profileResp.data;

    const user = await this.usersService.upsert({
      provider: 'google',
      providerAccountId: String(profile.id),
      login: profile.name || profile.email,
      email: profile.email,
      avatar_url: profile.picture,
      profile,
      email_verified: profile.verified_email || true,
    });

    const token = await this.jwtService.sign({ sub: user.id, email: user.email });
    return { token, user };
  }
}
