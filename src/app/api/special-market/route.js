export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM special_market_config WHERE id = 1');
    if (res.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          is_active: false,
          opens_at: null,
          closes_at: null,
          title: '👑 OWNER VIP SPECIAL MARKET 👑',
          custom_rewards: [],
          channels: [],
          role_id: '',
          ping_type: 'none',
          duration_minutes: 60
        }
      });
    }

    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        ...row,
        custom_rewards: typeof row.custom_rewards === 'string' ? JSON.parse(row.custom_rewards) : (row.custom_rewards || []),
        channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : (row.channels || []),
        role_id: row.role_id || '',
        ping_type: row.ping_type || 'none',
        duration_minutes: parseInt(row.duration_minutes) || 60,
        title: row.title || '👑 OWNER VIP SPECIAL MARKET 👑'
      }
    });
  } catch (error) {
    console.error('Error fetching special market config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, is_active, title, custom_rewards, channels, role_id, ping_type, duration_minutes } = body;
    const durMins = Math.max(1, Math.min(1440, parseInt(duration_minutes) || 60));

    // Ensure table structure exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS special_market_config (
          id INT PRIMARY KEY DEFAULT 1,
          is_active BOOLEAN DEFAULT false,
          opens_at TIMESTAMPTZ,
          closes_at TIMESTAMPTZ,
          title TEXT DEFAULT '👑 OWNER VIP SPECIAL MARKET 👑',
          custom_rewards JSONB DEFAULT '[]'::jsonb,
          channels JSONB DEFAULT '[]'::jsonb,
          role_id TEXT DEFAULT '',
          ping_type TEXT DEFAULT 'none',
          duration_minutes INT DEFAULT 60,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await query(`ALTER TABLE special_market_config ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 60`);
    } catch (e) {}

    if (action === 'trigger_now') {
      const now = new Date();
      const close = new Date(now.getTime() + durMins * 60 * 1000);

      await query(`
        INSERT INTO special_market_config (id, is_active, opens_at, closes_at, title, custom_rewards, channels, role_id, ping_type, duration_minutes, updated_at)
        VALUES (1, true, $1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          is_active = true,
          opens_at = EXCLUDED.opens_at,
          closes_at = EXCLUDED.closes_at,
          title = EXCLUDED.title,
          custom_rewards = EXCLUDED.custom_rewards,
          channels = EXCLUDED.channels,
          role_id = EXCLUDED.role_id,
          ping_type = EXCLUDED.ping_type,
          duration_minutes = EXCLUDED.duration_minutes,
          updated_at = CURRENT_TIMESTAMP
      `, [
        now.toISOString(),
        close.toISOString(),
        title || '👑 OWNER VIP SPECIAL MARKET 👑',
        JSON.stringify(custom_rewards || []),
        JSON.stringify(channels || []),
        role_id || '',
        ping_type || 'none',
        durMins
      ]);

      // Schedule portal job so bot instantly announces in Discord
      try {
        await query(
          "INSERT INTO portal_jobs (job_type, payload, status) VALUES ('open_special_market', $1::jsonb, 'pending')",
          [JSON.stringify({ duration_minutes: durMins })]
        );
      } catch (e) {}

      return NextResponse.json({ success: true, message: `VIP Special Market successfully opened for ${durMins} minutes live in Discord!` });
    }

    if (action === 'close_now') {
      await query(`
        UPDATE special_market_config
        SET is_active = false, opens_at = NULL, closes_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `);
      return NextResponse.json({ success: true, message: 'VIP Special Market closed.' });
    }

    // Save custom rewards configuration
    await query(`
      INSERT INTO special_market_config (id, is_active, title, custom_rewards, channels, role_id, ping_type, duration_minutes, updated_at)
      VALUES (1, $1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        title = EXCLUDED.title,
        custom_rewards = EXCLUDED.custom_rewards,
        channels = EXCLUDED.channels,
        role_id = EXCLUDED.role_id,
        ping_type = EXCLUDED.ping_type,
        duration_minutes = EXCLUDED.duration_minutes,
        updated_at = CURRENT_TIMESTAMP
    `, [
      Boolean(is_active),
      title || '👑 OWNER VIP SPECIAL MARKET 👑',
      JSON.stringify(custom_rewards || []),
      JSON.stringify(channels || []),
      role_id || '',
      ping_type || 'none',
      durMins
    ]);

    return NextResponse.json({ success: true, message: 'VIP Special Market deals and rewards saved!' });
  } catch (error) {
    console.error('Error updating special market config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
