import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_BOT_CONFIG = {
  presence_activity_type: 'Playing',
  presence_status_text: 'FC Mobile 27',
  presence_status_state: 'online',
  draft_rotation_hours: 2,
  store_rotation_hours: 3,
  exchange_rotation_hours: 2,
  maintenance_mode: false,
  maintenance_message: "🛠️ DestiFC is currently undergoing scheduled maintenance. Commands are temporarily paused!",
  commands_enabled: {
    draft: true,
    market: true,
    draft_battle: true,
    exchange: true,
    trade: true,
    squad: true,
    sbc: true,
    signature_box: true,
    daily: true,
    work: true,
    match: true
  }
};

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'bot_config'");
    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, config: DEFAULT_BOT_CONFIG });
    }
    const val = res.rows[0].value;
    const parsed = typeof val === 'string' ? JSON.parse(val) : (val || {});
    return NextResponse.json({
      success: true,
      config: { ...DEFAULT_BOT_CONFIG, ...parsed }
    });
  } catch (error) {
    console.error('Error fetching bot config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const config = body.config || body;
    const merged = { ...DEFAULT_BOT_CONFIG, ...config };

    await query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('bot_config', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(merged)]);

    return NextResponse.json({ success: true, message: 'Bot System & Presence Configuration saved successfully!', config: merged });
  } catch (error) {
    console.error('Error saving bot config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
