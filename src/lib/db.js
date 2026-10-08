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
      max: 1, // Reduced to 1 to prevent Vercel from hogging Aiven's 20-connection limit
      idleTimeoutMillis: 1000, // Drop idle connections almost immediately
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  const res = await p.query(text, params);
  return res;
}
