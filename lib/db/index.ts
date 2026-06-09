import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

export const initDb = () => {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not set. Database connection will not be established.");
    return null;
  }

  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 15000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle SQL pool client:', err);
  });

  db = drizzle(pool, { schema });
  return db;
};

// Auto-initialize when possible
initDb();
