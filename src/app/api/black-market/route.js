export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM black_market_config WHERE id = 1');
    if (res.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          is_active: false,
          opens_at: null,
          closes_at: null,
          voucher_packages: [
            { id: "v1", title: "10x Draft Vouchers Pack", vouchers: 10, original_price: 200000000, discount_price: 100000000, discount_pct: 50 },
            { id: "v2", title: "25x Draft Vouchers Bundle", vouchers: 25, original_price: 500000000, discount_price: 250000000, discount_pct: 50 },
            { id: "v3", title: "50x Mega Voucher Hoard", vouchers: 50, original_price: 1000000000, discount_price: 500000000, discount_pct: 50 }
          ],
          player_deals: []
        }
      });
    }

    const row = res.rows[0];

    // Fetch random schedule from system_settings
    let schedule = null;
    try {
      const schedRes = await query("SELECT value FROM system_settings WHERE key = 'black_market_schedule'");
      if (schedRes.rows.length > 0 && schedRes.rows[0].value) {
        schedule = typeof schedRes.rows[0].value === 'string' ? JSON.parse(schedRes.rows[0].value) : schedRes.rows[0].value;
      }
    } catch (e) {
      console.error('Error fetching black market schedule:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...row,
        schedule,
        voucher_packages: typeof row.voucher_packages === 'string' ? JSON.parse(row.voucher_packages) : (row.voucher_packages || []),
        player_deals: typeof row.player_deals === 'string' ? JSON.parse(row.player_deals) : (row.player_deals || []),
        channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : (row.channels || []),
        role_id: row.role_id || '',
        ping_type: row.ping_type || 'none'
      }
    });
  } catch (error) {
    console.error('Error fetching black market config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, is_active, voucher_packages, player_deals, opens_at, closes_at, channels, role_id, ping_type } = body;

    // Ensure columns exist
    try {
      await query("ALTER TABLE black_market_config ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '[]'::jsonb");
      await query("ALTER TABLE black_market_config ADD COLUMN IF NOT EXISTS role_id TEXT DEFAULT ''");
      await query("ALTER TABLE black_market_config ADD COLUMN IF NOT EXISTS ping_type TEXT DEFAULT 'none'");
    } catch (e) {}

    if (action === 'reroll_schedule') {
      const now = new Date();
      const currentUtcHour = now.getUTCHours();
      let schedDateStr = now.toISOString().split('T')[0];
      let randHour;

      // If there are still hours left today before 22:00 UTC, pick a time later today (at least 1 hour from now)
      if (currentUtcHour < 21) {
        const minHour = Math.max(2, currentUtcHour + 1);
        randHour = Math.floor(Math.random() * (22 - minHour + 1)) + minHour;
      } else {
        // Otherwise schedule for tomorrow between 02:00 and 21:00 UTC
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        schedDateStr = tomorrow.toISOString().split('T')[0];
        randHour = Math.floor(Math.random() * 20) + 2;
      }

      const randMin = Math.floor(Math.random() * 60);

      const newSched = {
        date: schedDateStr,
        target_hour: randHour,
        target_min: randMin,
        executed: false
      };

      await query(
        "INSERT INTO system_settings (key, value) VALUES ('black_market_schedule', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [JSON.stringify(newSched)]
      );

      return NextResponse.json({
        success: true,
        message: `Rerolled spawn time to ${schedDateStr} at ${String(randHour).padStart(2, '0')}:${String(randMin).padStart(2, '0')} UTC!`,
        schedule: newSched
      });
    }

    if (action === 'trigger_now') {
      const now = new Date();
      const close = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

      await query(`
        INSERT INTO black_market_config (id, is_active, opens_at, closes_at, voucher_packages, player_deals, channels, role_id, ping_type, updated_at)
        VALUES (1, true, $1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          is_active = true,
          opens_at = EXCLUDED.opens_at,
          closes_at = EXCLUDED.closes_at,
          voucher_packages = EXCLUDED.voucher_packages,
          player_deals = EXCLUDED.player_deals,
          channels = EXCLUDED.channels,
          role_id = EXCLUDED.role_id,
          ping_type = EXCLUDED.ping_type,
          updated_at = CURRENT_TIMESTAMP
      `, [
        now.toISOString(),
        close.toISOString(),
        JSON.stringify(voucher_packages || []),
        JSON.stringify(player_deals || []),
        JSON.stringify(channels || []),
        role_id || '',
        ping_type || 'none'
      ]);

      // Schedule portal job so bot instantly announces in Discord
      try {
        await query("INSERT INTO portal_jobs (job_type, payload, status) VALUES ('open_black_market', '{}', 'pending')");
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Black Market successfully opened for 1 hour live in Discord!' });
    }

    if (action === 'close_now') {
      await query(`
        UPDATE black_market_config
        SET is_active = false, opens_at = NULL, closes_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `);
      return NextResponse.json({ success: true, message: 'Black Market closed.' });
    }

    // Standard settings update
    await query(`
      INSERT INTO black_market_config (id, is_active, opens_at, closes_at, voucher_packages, player_deals, channels, role_id, ping_type, updated_at)
      VALUES (1, $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        opens_at = EXCLUDED.opens_at,
        closes_at = EXCLUDED.closes_at,
        voucher_packages = EXCLUDED.voucher_packages,
        player_deals = EXCLUDED.player_deals,
        channels = EXCLUDED.channels,
        role_id = EXCLUDED.role_id,
        ping_type = EXCLUDED.ping_type,
        updated_at = CURRENT_TIMESTAMP
    `, [
      Boolean(is_active),
      opens_at ? new Date(opens_at).toISOString() : null,
      closes_at ? new Date(closes_at).toISOString() : null,
      JSON.stringify(voucher_packages || []),
      JSON.stringify(player_deals || []),
      JSON.stringify(channels || []),
      role_id || '',
      ping_type || 'none'
    ]);

    return NextResponse.json({ success: true, message: 'Black market configuration saved!' });
  } catch (error) {
    console.error('Error updating black market config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
