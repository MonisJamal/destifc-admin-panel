import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { action, tournament_id, matches_json } = await req.json();

    if (action === 'toggle_registration') {
      const res = await query('UPDATE tournaments SET registration_open = NOT registration_open WHERE id = $1 RETURNING registration_open', [tournament_id]);
      return NextResponse.json({ success: true, registration_open: res.rows[0].registration_open });
    }

    if (action === 'save_brackets') {
      await query('UPDATE tournaments SET matches_json = $1::jsonb WHERE id = $2', [JSON.stringify(matches_json), tournament_id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error managing tournament:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
