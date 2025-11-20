import { Injectable, OnModuleDestroy, OnModuleInit, InternalServerErrorException, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService implements OnModuleDestroy, OnModuleInit {
  private pool: Pool;
  private readonly logger = new Logger(DbService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new InternalServerErrorException('DATABASE_URL is not set');
    this.pool = new Pool({ connectionString });
  }

  // Ensure required tables exist when module initializes
  async onModuleInit() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        github_id TEXT UNIQUE,
        google_id TEXT UNIQUE,
        email TEXT UNIQUE,
        login TEXT,
        avatar_url TEXT,
        provider TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    try {
      this.logger.log('Ensuring users table exists');
      await this.pool.query(createUsersTable);
      this.logger.log('Users table is ensured');
    } catch (err: any) {
      this.logger.error('Failed to ensure users table', err?.stack || err?.message || err);
      throw new InternalServerErrorException('Failed to initialize database schema');
    }
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