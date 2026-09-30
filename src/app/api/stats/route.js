import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const usersCount = await query('SELECT COUNT(*) FROM users');
    const inventoryCount = await query('SELECT COUNT(*) FROM inventory');
    const marketCount = await query('SELECT COUNT(*) FROM market');
    const customCount = await query('SELECT COUNT(*) FROM custom_draft_cards');

    return NextResponse.json({
      success: true,
      stats: {
        users: parseInt(usersCount.rows[0].count, 10),
        inventory: parseInt(inventoryCount.rows[0].count, 10),
        market: parseInt(marketCount.rows[0].count, 10),
        customCards: parseInt(customCount.rows[0].count, 10),
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
