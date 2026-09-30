import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_LUCK = {
  draft_pool_a_rate: 2.5,
  draft_pool_b_rate: 30.0,
  draft_pool_c_rate: 67.5,
  walkout_122_share: 6.0,
  walkout_121_share: 35.0,
  walkout_120_share: 59.0,
  pity_pool_a_threshold: 70,
  pity_pool_b_interval: 10,
  global_luck_multiplier: 1.0,
  exchange_top_rate: 5.0,
  exchange_mid_rate: 35.0,
  exchange_base_rate: 60.0,
};

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'luck_settings'");
    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, settings: DEFAULT_LUCK });
    }
    const val = res.rows[0].value;
    const settings = typeof val === 'string' ? JSON.parse(val) : val;
    return NextResponse.json({
      success: true,
      settings: { ...DEFAULT_LUCK, ...settings }
    });
  } catch (error) {
    console.error('Error fetching luck settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const merged = { ...DEFAULT_LUCK, ...body };

    await query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('luck_settings', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(merged)]);

    return NextResponse.json({ success: true, message: 'Luck Settings and Drop Rates saved successfully!', settings: merged });
  } catch (error) {
    console.error('Error saving luck settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
