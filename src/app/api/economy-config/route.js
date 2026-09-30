import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_ECONOMY_CONFIG = {
  daily_coins_min: 5000000,
  daily_coins_max: 20000000,
  daily_vouchers: 2,
  daily_streak_multiplier: 0.10,
  daily_walkout_chance: 0.15,
  work_coins_min: 2000000,
  work_coins_max: 10000000,
  work_cooldown_mins: 30,
  voucher_coin_price: 10000000,
  voucher_daily_limit: 70,
  market_tax_percent: 10.0,
  trade_tax_percent: 5.0,
  max_market_listings: 10,
  starter_coins: 50000000,
  starter_vouchers: 10
};

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'economy_config'");
    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, config: DEFAULT_ECONOMY_CONFIG });
    }
    const val = res.rows[0].value;
    const parsed = typeof val === 'string' ? JSON.parse(val) : (val || {});
    return NextResponse.json({
      success: true,
      config: { ...DEFAULT_ECONOMY_CONFIG, ...parsed }
    });
  } catch (error) {
    console.error('Error fetching economy config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const config = body.config || body;
    const merged = { ...DEFAULT_ECONOMY_CONFIG, ...config };

    await query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('economy_config', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(merged)]);

    return NextResponse.json({ success: true, message: 'Economy Settings saved successfully!', config: merged });
  } catch (error) {
    console.error('Error saving economy config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
