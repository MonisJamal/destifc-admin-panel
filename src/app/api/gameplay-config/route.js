import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_GAMEPLAY_CONFIG = {
  match_win_coins: 25000000,
  match_draw_coins: 10000000,
  match_loss_coins: 5000000,
  match_win_fans: 25,
  match_draw_fans: 0,
  match_loss_fans: -15,
  draft_battle_entry_fee: 0,
  draft_battle_winner_coins: 50000000,
  draft_battle_winner_vouchers: 5,
  custom_card_match_boost: 1.15,
  penalty_shootout_enabled: true
};

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'gameplay_config'");
    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, config: DEFAULT_GAMEPLAY_CONFIG });
    }
    const val = res.rows[0].value;
    const parsed = typeof val === 'string' ? JSON.parse(val) : (val || {});
    return NextResponse.json({
      success: true,
      config: { ...DEFAULT_GAMEPLAY_CONFIG, ...parsed }
    });
  } catch (error) {
    console.error('Error fetching gameplay config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const config = body.config || body;
    const merged = { ...DEFAULT_GAMEPLAY_CONFIG, ...config };

    await query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('gameplay_config', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(merged)]);

    return NextResponse.json({ success: true, message: 'Gameplay & Match Settings saved successfully!', config: merged });
  } catch (error) {
    console.error('Error saving gameplay config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
