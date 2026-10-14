import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, tournament_id, matches_json, user_id } = body;

    if (action === 'toggle_registration') {
      const res = await query('UPDATE tournaments SET registration_open = NOT registration_open WHERE id = $1 RETURNING registration_open', [tournament_id]);
      return NextResponse.json({ success: true, registration_open: res.rows[0].registration_open });
    }

    if (action === 'save_brackets') {
      await query('UPDATE tournaments SET matches_json = $1::jsonb WHERE id = $2', [JSON.stringify(matches_json), tournament_id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'remove_participant') {
      if (!user_id) return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      await query('DELETE FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2', [tournament_id, user_id]);
      // Re-open registration if slots opened
      await query('UPDATE tournaments SET registration_open = TRUE WHERE id = $1', [tournament_id]);
      return NextResponse.json({ success: true, message: 'Participant removed successfully.' });
    }

    if (action === 'remove_incomplete_squads') {
      const delRes = await query(`
        DELETE FROM tournament_participants tp
        WHERE tp.tournament_id = $1
          AND COALESCE((
            SELECT count(*) 
            FROM squads s, jsonb_each(COALESCE(s.active_squad->'players', '{}'::jsonb)) 
            WHERE s.user_id = tp.user_id 
              AND value IS NOT NULL 
              AND value != 'null'::jsonb 
              AND value != '{}'::jsonb
          ), 0) < 11
        RETURNING tp.user_id;
      `, [tournament_id]);

      if (delRes.rowCount > 0) {
        await query('UPDATE tournaments SET registration_open = TRUE WHERE id = $1', [tournament_id]);
      }
      return NextResponse.json({ 
        success: true, 
        removedCount: delRes.rowCount, 
        removedUserIds: delRes.rows.map(r => r.user_id) 
      });
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
