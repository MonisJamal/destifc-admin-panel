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
            { id: "v1", title: "5x Draft Vouchers Pack", vouchers: 5, original_price: 50000000, discount_price: 25000000, discount_pct: 50 },
            { id: "v2", title: "15x Draft Vouchers Pack", vouchers: 15, original_price: 140000000, discount_price: 70000000, discount_pct: 50 },
            { id: "v3", title: "30x Mega Voucher Hoard", vouchers: 30, original_price: 270000000, discount_price: 135000000, discount_pct: 50 }
          ],
          player_deals: []
        }
      });
    }

    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        ...row,
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
