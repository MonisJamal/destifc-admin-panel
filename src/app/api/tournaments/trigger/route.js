import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { tournament_id, player_a_id, player_b_id, channel_id } = await req.json();

    if (!tournament_id || !player_a_id || !player_b_id || !channel_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const payload = JSON.stringify({ 
      tournament_id,
      player_a_id, 
      player_b_id, 
      channel_id 
    });

    await query(`
      INSERT INTO portal_jobs (job_type, payload)
      VALUES ('TRIGGER_TOURNAMENT_MATCH', $1)
    `, [payload]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Error triggering tournament match:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
