import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_GAMEPLAY_CONFIG = {
  // Match Currency Rewards
  match_win_coins: 25000000,
  match_draw_coins: 10000000,
  match_loss_coins: 5000000,

  // Ranked Fans ELO
  match_win_fans: 25,
  match_draw_fans: 0,
  match_loss_fans: -15,

  // Season Progression & Match Timings
  match_win_xp: 75,
  match_challenge_timeout_secs: 60,
  match_cooldown_mins: 0,
  match_sim_step_delay_secs: 0,

  // 1v1 Draft Battle
  draft_battle_entry_fee: 0,
  draft_battle_winner_coins: 50000000,
  draft_battle_winner_vouchers: 5,
  penalty_shootout_enabled: true,

  // Custom & Signature Aura Boost
  custom_card_match_boost: 1.15,

  // Division Rivals & Ranked Tiers
  division_tiers: [
    { id: 1, name: 'Amateur III', min_fans: 0, badge: '🥉', win_reward_coins: 10000000, win_reward_vouchers: 1 },
    { id: 2, name: 'Amateur II', min_fans: 10000, badge: '🥉', win_reward_coins: 12000000, win_reward_vouchers: 1 },
    { id: 3, name: 'Amateur I', min_fans: 20000, badge: '🥉', win_reward_coins: 15000000, win_reward_vouchers: 1 },
    { id: 4, name: 'Pro III', min_fans: 30000, badge: '🥈', win_reward_coins: 18000000, win_reward_vouchers: 2 },
    { id: 5, name: 'Pro II', min_fans: 50000, badge: '🥈', win_reward_coins: 20000000, win_reward_vouchers: 2 },
    { id: 6, name: 'Pro I', min_fans: 70000, badge: '🥈', win_reward_coins: 25000000, win_reward_vouchers: 2 },
    { id: 7, name: 'World Class III', min_fans: 100000, badge: '🥇', win_reward_coins: 30000000, win_reward_vouchers: 3 },
    { id: 8, name: 'World Class II', min_fans: 200000, badge: '🥇', win_reward_coins: 35000000, win_reward_vouchers: 3 },
    { id: 9, name: 'World Class I', min_fans: 300000, badge: '🥇', win_reward_coins: 40000000, win_reward_vouchers: 3 },
    { id: 10, name: 'Legendary III', min_fans: 400000, badge: '💎', win_reward_coins: 50000000, win_reward_vouchers: 4 },
    { id: 11, name: 'Legendary II', min_fans: 600000, badge: '💎', win_reward_coins: 65000000, win_reward_vouchers: 4 },
    { id: 12, name: 'Legendary I', min_fans: 800000, badge: '💎', win_reward_coins: 80000000, win_reward_vouchers: 5 },
    { id: 13, name: 'FC Champion', min_fans: 1000000, badge: '🏆', win_reward_coins: 100000000, win_reward_vouchers: 6 }
  ]
};

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = 'gameplay_config'");
    if (res.rows.length === 0) {
      return NextResponse.json({ success: true, config: DEFAULT_GAMEPLAY_CONFIG });
    }
    const val = res.rows[0].value;
    const parsed = typeof val === 'string' ? JSON.parse(val) : (val || {});
    return NextResponse.json({
      success: true,
      config: { ...DEFAULT_GAMEPLAY_CONFIG, ...parsed }
    });
  } catch (error) {
    console.error('Error fetching gameplay config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const config = body.config || body;
    const merged = { ...DEFAULT_GAMEPLAY_CONFIG, ...config };

    await query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('gameplay_config', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(merged)]);

    return NextResponse.json({ success: true, message: 'Gameplay and match timing settings saved successfully!', config: merged });
  } catch (error) {
    console.error('Error saving gameplay config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
