import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message required' }, { status: 400 });
    }

    // Queue it via portal_jobs
    const payload = JSON.stringify({ title, message });
    await query(`
      INSERT INTO portal_jobs (job_name, job_type, status, payload, requested_at) 
      VALUES ($1, 'mass_dm', 'pending', $2, NOW())
    `, [`mass_dm_${Date.now()}`, payload]);

    return NextResponse.json({ success: true, message: 'Announcement queued for delivery.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
