import { Injectable, OnModuleDestroy, InternalServerErrorException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new InternalServerErrorException('DATABASE_URL is not set');
    this.pool = new Pool({ connectionString });
  }

  async query(text: string, params?: any[]) {
    try {
      return await this.pool.query(text, params);
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message || 'Database query failed');
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
    } catch (err) {
      // ignore
    }
  }
}