import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    this.logger.log('Connecting Prisma Client');
    try {
      await this.$connect();
      this.logger.log('Prisma Client connected');
    } catch (err) {
      this.logger.error('Prisma connect error', err as any);
      throw err;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting Prisma Client');
    try {
      await this.$disconnect();
    } catch (err) {
      // ignore
    }
  }
}
