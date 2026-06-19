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

  // Self-healing: Ensure table exists immediately
  pool.query(`
    CREATE TABLE IF NOT EXISTS storage (
      key VARCHAR(255) PRIMARY KEY,
      data TEXT NOT NULL
    );
  `).then(() => {
    console.log("Postgres 'storage' table checked/created successfully.");
  }).catch((err) => {
    console.error("Failed to self-heal/create 'storage' table:", err.message);
  });

  db = drizzle(pool, { schema });
  return db;
};
