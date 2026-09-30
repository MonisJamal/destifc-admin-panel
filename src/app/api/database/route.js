import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'users'; // 'users' | 'inventory' | 'market'
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 25;
    const offset = (page - 1) * limit;

    let rows = [];
    let total = 0;

    if (tab === 'users') {
      let q = 'SELECT user_id, coins, vouchers, gems, fans, drafts_opened FROM users';
      let countQ = 'SELECT COUNT(*) FROM users';
      let params = [];

      if (search) {
        q += ' WHERE user_id::text LIKE $1';
        countQ += ' WHERE user_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY coins DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      rows = res.rows;
      total = parseInt(countRes.rows[0].count, 10);
    } else if (tab === 'inventory') {
      let q = 'SELECT id, user_id, player_name, ovr, locked FROM inventory';
      let countQ = 'SELECT COUNT(*) FROM inventory';
      let params = [];

      if (search) {
        q += ' WHERE player_name ILIKE $1 OR user_id::text LIKE $1';
        countQ += ' WHERE player_name ILIKE $1 OR user_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY ovr DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      rows = res.rows;
      total = parseInt(countRes.rows[0].count, 10);
    } else if (tab === 'market') {
      let q = 'SELECT id, seller_id, player_name, ovr, price, listed_at FROM market';
      let countQ = 'SELECT COUNT(*) FROM market';
      let params = [];

      if (search) {
        q += ' WHERE player_name ILIKE $1 OR seller_id::text LIKE $1';
        countQ += ' WHERE player_name ILIKE $1 OR seller_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY listed_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      rows = res.rows;
      total = parseInt(countRes.rows[0].count, 10);
    }

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
