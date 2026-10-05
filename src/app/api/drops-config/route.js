import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'drops_config'");
    if (res.rows.length > 0) {
      let val = res.rows[0].value;
      if (typeof val === 'string') val = JSON.parse(val);
      return NextResponse.json({ success: true, data: val });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          enabled: true,
          channel_id: '',
          interval_mins: 60,
          vouchers_per_drop: 3,
          coins_per_drop: 5000000,
          max_claims: 3
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
      "INSERT INTO system_settings (key, value) VALUES ('drops_config', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [JSON.stringify(data)]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
