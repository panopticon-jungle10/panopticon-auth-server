import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upsert user based on oauth provider data or email.
   * payload: { provider, providerAccountId, login, email, avatar_url, profile }
   */
  async upsert(payload: any) {
    const { provider, providerAccountId, github_id, google_id, login, email, avatar_url, profile } = payload;

    // Normalize providerAccountId for backward compatibility
    const accountId = providerAccountId || github_id || google_id;

    try {
      if (provider && accountId) {
        // Try to find existing OAuthAccount
        const existing = await this.prisma.oAuthAccount.findUnique({
          where: { provider_providerAccountId: { provider, providerAccountId: accountId } },
          include: { user: true },
        });

        if (existing) {
          // update user info
          const updated = await this.prisma.user.update({
            where: { id: existing.userId },
            data: {
              email: email || existing.user.email,
              displayName: login || existing.user.displayName,
              avatarUrl: avatar_url || existing.user.avatarUrl,
              lastLoginAt: new Date(),
            },
          });

          // update oauth account profile if provided
          await this.prisma.oAuthAccount.update({
            where: { id: existing.id },
            data: { profileJson: profile || existing.profileJson, updatedAt: new Date() },
          });

          return updated;
        }

        // No OAuthAccount found: try to find user by email
        let user = null;
        if (email) {
          user = await this.prisma.user.findUnique({ where: { email } });
        }

        if (!user) {
          // create user and oauth account
          const created = await this.prisma.user.create({
            data: {
              email: email || null,
              emailVerified: !!payload.email_verified,
              displayName: login || null,
              avatarUrl: avatar_url || null,
              lastLoginAt: new Date(),
              oauthAccounts: {
                create: {
                  provider,
                  providerAccountId: accountId,
                  providerType: 'oauth',
                  profileJson: profile || null,
                },
              },
            },
            include: { oauthAccounts: true },
          });
          return created;
        }

        // User exists by email -> attach oauth account
        const attached = await this.prisma.oAuthAccount.create({
          data: {
            provider,
            providerAccountId: accountId,
            providerType: 'oauth',
            profileJson: profile || null,
            user: { connect: { id: user.id } },
          },
        });

        // update user's last login and profile fields
        const updatedUser = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            displayName: login || user.displayName,
            avatarUrl: avatar_url || user.avatarUrl,
            lastLoginAt: new Date(),
          },
        });

        return updatedUser;
      }

      // Fallback: upsert by email only
      if (email) {
        const upserted = await this.prisma.user.upsert({
          where: { email },
          update: { displayName: login || undefined, avatarUrl: avatar_url || undefined, lastLoginAt: new Date() },
          create: { email, displayName: login || null, avatarUrl: avatar_url || null, lastLoginAt: new Date() },
        });
        return upserted;
      }
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message || 'Database error while upserting user');
    }

    throw new BadRequestException('insufficient identifiers');
  }
}

