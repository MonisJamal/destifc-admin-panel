import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'arcade_config'");
    if (res.rows.length > 0) {
      let val = res.rows[0].value;
      if (typeof val === 'string') val = JSON.parse(val);
      return NextResponse.json({ success: true, data: val });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          pack_battle_max_vouchers: 50,
          shootout_enabled: true,
          shootout_solo_reward_coins: 5000000,
          shootout_solo_reward_vouchers: 2,
          spin_cooldown_hours: 4,
          spin_jackpot_vouchers: 10,
          draft_battle_win_elo: 25,
          draft_battle_loss_elo: 15
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await query(
      "INSERT INTO system_settings (key, value) VALUES ('arcade_config', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [JSON.stringify(data)]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
