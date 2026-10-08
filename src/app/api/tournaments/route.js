import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const tournamentsRes = await query(`
      SELECT t.*, 
             (SELECT json_agg(tp.user_id) 
              FROM tournament_participants tp 
              WHERE tp.tournament_id = t.id) as participants
      FROM tournaments t
      ORDER BY t.created_at DESC
    `);
    
    return NextResponse.json({ tournaments: tournamentsRes.rows }, { status: 200 });
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, channel_id } = await req.json();
    
    if (!name || !channel_id) {
      return NextResponse.json({ error: 'Name and channel_id are required' }, { status: 400 });
    }

    // Create a new tournament
    const insertRes = await query(`
      INSERT INTO tournaments (name, type, channel_id, status, created_at)
      VALUES ($1, 'KNOCKOUT', $2, 'PENDING', NOW())
      RETURNING *
    `, [name, channel_id]);

    const newTournament = insertRes.rows[0];

    // Insert job to announce tournament
    const payload = JSON.stringify({ 
      tournament_id: newTournament.id, 
      name, 
      channel_id 
    });

    await query(`
      INSERT INTO portal_jobs (job_type, payload)
      VALUES ('ANNOUNCE_TOURNAMENT', $1)
    `, [payload]);

    return NextResponse.json({ tournament: newTournament }, { status: 201 });
  } catch (err) {
    console.error('Error creating tournament:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
