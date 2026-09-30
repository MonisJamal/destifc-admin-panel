import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_SEASON_CONFIG = {
  season_number: 1,
  season_title: 'Inaugural Champions Pass',
  xp_per_tier: 200,
  tiers_count: 10,
  tiers: [
    { tier: 1, xp_needed: 200, reward_type: 'coins', reward_value: 50000000, reward_name: '50,000,000 Coins' },
    { tier: 2, xp_needed: 400, reward_type: 'vouchers', reward_value: 5, reward_name: '5x Draft Vouchers' },
    { tier: 3, xp_needed: 600, reward_type: 'coins', reward_value: 100000000, reward_name: '100,000,000 Coins' },
    { tier: 4, xp_needed: 800, reward_type: 'vouchers', reward_value: 10, reward_name: '10x Draft Vouchers' },
    { tier: 5, xp_needed: 1000, reward_type: 'coins', reward_value: 250000000, reward_name: '250,000,000 Coins' },
    { tier: 6, xp_needed: 1200, reward_type: 'vouchers', reward_value: 15, reward_name: '15x Draft Vouchers' },
    { tier: 7, xp_needed: 1400, reward_type: 'coins', reward_value: 500000000, reward_name: '500,000,000 Coins' },
    { tier: 8, xp_needed: 1600, reward_type: 'vouchers', reward_value: 25, reward_name: '25x Draft Vouchers' },
    { tier: 9, xp_needed: 1800, reward_type: 'coins', reward_value: 1000000000, reward_name: '1,000,000,000 Coins' },
    { tier: 10, xp_needed: 2000, reward_type: 'card', reward_value: 124, reward_name: '124 OVR Master Icon Pick' }
  ]
};

export async function GET() {
  try {
    const seasonRes = await query("SELECT value FROM system_settings WHERE key = 'season_config'");
    const sbcsRes = await query("SELECT * FROM active_sbcs ORDER BY id ASC");

    let seasonConfig = DEFAULT_SEASON_CONFIG;
    if (seasonRes.rows.length > 0) {
      const val = seasonRes.rows[0].value;
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      seasonConfig = { ...DEFAULT_SEASON_CONFIG, ...parsed };
    }

    const sbcs = sbcsRes.rows.map((row) => {
      let data = {};
      if (typeof row.sbc_json === 'string') {
        try { data = JSON.parse(row.sbc_json); } catch (e) {}
      } else if (row.sbc_json) {
        data = row.sbc_json;
      }
      return {
        id: row.id,
        expires_at: row.expires_at,
        ...data
      };
    });

    return NextResponse.json({
      success: true,
      season: seasonConfig,
      sbcs
    });
  } catch (error) {
    console.error('Error fetching season & SBC settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { season } = body;

    if (season) {
      await query(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ('season_config', $1, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(season)]);
    }

    return NextResponse.json({ success: true, message: 'Season Pass configuration saved successfully!' });
  } catch (error) {
    console.error('Error saving season config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
