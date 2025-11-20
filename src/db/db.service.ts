import { Injectable, OnModuleDestroy, OnModuleInit, InternalServerErrorException, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService implements OnModuleDestroy, OnModuleInit {
  private pool: Pool;
  private readonly logger = new Logger(DbService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new InternalServerErrorException('DATABASE_URL is not set');

    const pgSslEnv = (process.env.PG_SSL || 'true').toLowerCase();
    const useSsl = pgSslEnv !== 'false';

    const caEnv = process.env.PG_SSL_CA;
    let sslOption: any = false;
    if (useSsl) {
      if (caEnv) {
        let caPem: string;
        if (caEnv.trim().startsWith('-----BEGIN')) {
          caPem = caEnv;
        } else {
          try {
            caPem = Buffer.from(caEnv, 'base64').toString('utf-8');
          } catch (err) {
            this.logger.warn('Failed to decode PG_SSL_CA as base64; treating as raw PEM');
            caPem = caEnv;
          }
        }

        sslOption = { ca: caPem, rejectUnauthorized: true };
      } else {
        const rejEnv = (process.env.PG_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase();
        const rejectUnauthorized = !(rejEnv === '0' || rejEnv === 'false' || rejEnv === 'no');
        sslOption = { rejectUnauthorized };
      }
    }

    this.logger.log(`PG_SSL=${process.env.PG_SSL || 'undefined'} PG_SSL_REJECT_UNAUTHORIZED=${process.env.PG_SSL_REJECT_UNAUTHORIZED || 'undefined'} PG_SSL_CA=${caEnv ? 'present' : 'absent'} sslOption=${JSON.stringify({...(sslOption || {})})}`);

    this.pool = new Pool({ connectionString, ssl: sslOption });
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