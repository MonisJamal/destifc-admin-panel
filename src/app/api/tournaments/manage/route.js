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

    if (action === 'announce') {
      const tRes = await query('SELECT * FROM tournaments WHERE id = $1', [tournament_id]);
      if (!tRes.rows[0]) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      const t = tRes.rows[0];
      const payload = JSON.stringify({
        tournament_id: t.id,
        name: t.name,
        channel_id: t.channel_id,
        type: t.type,
        max_participants: t.max_participants,
        announcement_msg: t.announcement_msg || '🏆 The tournament is officially open! Click Participate below to register your squad!'
      });
      await query("INSERT INTO portal_jobs (job_type, payload) VALUES ('ANNOUNCE_TOURNAMENT', $1)", [payload]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error managing tournament:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
