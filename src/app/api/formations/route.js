import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query('SELECT formation_name, positions_json, updated_at FROM formation_layouts ORDER BY formation_name ASC');
    const layouts = res.rows.map(r => ({
      name: r.formation_name,
      positions: typeof r.positions_json === 'string' ? JSON.parse(r.positions_json) : r.positions_json,
      updated_at: r.updated_at,
    }));
    return NextResponse.json({ success: true, layouts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { formationName, positions } = await request.json();
    if (!formationName || !positions) {
      return NextResponse.json({ success: false, error: 'formationName and positions are required' }, { status: 400 });
    }

    const posJson = typeof positions === 'string' ? positions : JSON.stringify(positions);

    await query(
      `INSERT INTO formation_layouts (formation_name, positions_json, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (formation_name) DO UPDATE SET positions_json = $2, updated_at = NOW()`,
      [formationName, posJson]
    );

    return NextResponse.json({ success: true, formationName });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
