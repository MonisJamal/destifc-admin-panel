import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM signature_box_config WHERE id = 1');
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No signature box found' });
    }
    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      box: {
        ...row,
        signature_card_data: typeof row.signature_card_data === 'string' ? JSON.parse(row.signature_card_data) : row.signature_card_data,
        rewards_json: typeof row.rewards_json === 'string' ? JSON.parse(row.rewards_json) : row.rewards_json,
        draw_costs_json: typeof row.draw_costs_json === 'string' ? JSON.parse(row.draw_costs_json) : row.draw_costs_json,
      }
    });
  } catch (error) {
    console.error('Error fetching signature box config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, is_active, banner_url, expires_at, signature_card_data, rewards_json, draw_costs_json } = body;

    let expDt = null;
    if (expires_at) {
      expDt = new Date(expires_at).toISOString();
    }

    await query(`
      INSERT INTO signature_box_config (id, title, subtitle, is_active, banner_url, expires_at, signature_card_data, rewards_json, draw_costs_json, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        is_active = EXCLUDED.is_active,
        banner_url = EXCLUDED.banner_url,
        expires_at = EXCLUDED.expires_at,
        signature_card_data = EXCLUDED.signature_card_data,
        rewards_json = EXCLUDED.rewards_json,
        draw_costs_json = EXCLUDED.draw_costs_json,
        updated_at = CURRENT_TIMESTAMP
    `, [
      title || 'FC SIGNATURE BOX',
      subtitle || '10 Exclusive Limited Time Rewards',
      is_active !== undefined ? is_active : true,
      banner_url || '',
      expDt,
      JSON.stringify(signature_card_data || {}),
      JSON.stringify(rewards_json || []),
      JSON.stringify(draw_costs_json || [])
    ]);

    return NextResponse.json({ success: true, message: 'Signature Box updated successfully!' });
  } catch (error) {
    console.error('Error updating signature box config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await query('UPDATE user_signature_box SET claimed_reward_ids = $1, draws_completed = 0', [JSON.stringify([])]);
    return NextResponse.json({ success: true, message: 'User Signature Box progress reset for all players!' });
  } catch (error) {
    console.error('Error resetting signature box progress:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
