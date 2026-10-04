import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'compensation_config'");
    if (res.rows.length > 0) {
      let val = res.rows[0].value;
      if (typeof val === 'string') val = JSON.parse(val);
      return NextResponse.json({ success: true, data: val });
    } else {
      return NextResponse.json({ success: true, data: { is_active: false, event_id: '', message: '', coins: 0, vouchers: 0, gems: 0, start_timestamp: 0, end_timestamp: 0 } });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await query(
      "INSERT INTO system_settings (key, value) VALUES ('compensation_config', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [JSON.stringify(data)]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
