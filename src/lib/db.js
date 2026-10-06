import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
    
    // Clean sslmode=require from URL if present so pg SSL config handles it cleanly
    if (connectionString) {
      connectionString = connectionString.replace(/[\?&]sslmode=require/, '');
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 3,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  const res = await p.query(text, params);
  return res;
}
