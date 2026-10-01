import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://neondb_owner:npg_EZ7gQ4pOFNYU@ep-dry-thunder-b1l2ju9a-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require";
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  const res = await p.query(text, params);
  return res;
}
