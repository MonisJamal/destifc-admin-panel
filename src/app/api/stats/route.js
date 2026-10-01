import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const usersCount = await query('SELECT COUNT(*) FROM users');
    const inventoryCount = await query('SELECT COUNT(*) FROM inventory');
    const marketCount = await query('SELECT COUNT(*) FROM market');
    const customCount = await query('SELECT COUNT(*) FROM custom_draft_cards');

    // Fetch real bot heartbeat
    const hbRes = await query("SELECT value FROM system_settings WHERE key = 'bot_heartbeat'");
    let heartbeat = null;
    try {
      heartbeat = hbRes.rows[0]?.value ? JSON.parse(hbRes.rows[0].value) : null;
    } catch (e) {
      heartbeat = null;
    }

    let isOnline = false;
    let secondsSincePing = null;
    if (heartbeat && heartbeat.last_ping) {
      const diff = Math.round((Date.now() - new Date(heartbeat.last_ping).getTime()) / 1000);
      secondsSincePing = diff;
      if (diff <= 35 && diff >= 0) {
        isOnline = true;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        users: parseInt(usersCount.rows[0]?.count || 0, 10),
        inventory: parseInt(inventoryCount.rows[0]?.count || 0, 10),
        market: parseInt(marketCount.rows[0]?.count || 0, 10),
        customCards: parseInt(customCount.rows[0]?.count || 0, 10),
        bot_online: isOnline,
        bot_latency: isOnline ? (heartbeat?.latency_ms || 0) : null,
        seconds_since_ping: secondsSincePing,
        bot_user: heartbeat?.bot_user || 'DestiFC'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

