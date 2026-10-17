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
      max: 3, // Allow up to 3 connections per serverless container for parallel queries
      idleTimeoutMillis: 10000, // Keep connection open for 10s for snappy sequential clicks
      connectionTimeoutMillis: 15000, // 15s to allow SSL handshake and cross-region latency
    });

    pool.on('error', (err) => {
      console.warn('[pg pool error]', err?.message || err);
      // Discard broken pool instance so subsequent requests establish fresh connections
      pool = null;
    });
  }
  return pool;
}

export async function query(text, params) {
  try {
    const p = getPool();
    const res = await p.query(text, params);
    return res;
  } catch (err) {
    const errMsg = err?.message || '';
    // Auto-retry once on transient connection timeout or reset
    if (
      errMsg.includes('timeout exceeded') ||
      errMsg.includes('ECONNRESET') ||
      errMsg.includes('Connection terminated') ||
      errMsg.includes('closed')
    ) {
      console.warn('[db query retry] Connection issue, resetting pool and retrying...', errMsg);
      if (pool) {
        try { await pool.end(); } catch (_) {}
        pool = null;
      }
      const freshPool = getPool();
      return await freshPool.query(text, params);
    }
    throw err;
  }
}
