import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, amount, currencyType, playerData } = body;

    const uid = userId ? BigInt(userId) : null;

    if (action === 'give_currency') {
      if (!uid || !amount) {
        return NextResponse.json({ success: false, error: 'User ID and Amount required' }, { status: 400 });
      }

      const col = currencyType === 'vouchers' ? 'vouchers' : (currencyType === 'gems' ? 'gems' : 'coins');
      await query(`
        INSERT INTO users (user_id, ${col}) 
        VALUES ($1, $2) 
        ON CONFLICT (user_id) 
        DO UPDATE SET ${col} = COALESCE(users.${col}, 0) + $2
      `, [uid.toString(), amount]);

      return NextResponse.json({ success: true, message: `Successfully added ${amount.toLocaleString()} ${col} to user ${uid}` });
    }

    if (action === 'set_currency') {
      if (!uid) {
        return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
      }

      const col = currencyType === 'vouchers' ? 'vouchers' : (currencyType === 'gems' ? 'gems' : 'coins');
      await query(`
        INSERT INTO users (user_id, ${col}) 
        VALUES ($1, $2) 
        ON CONFLICT (user_id) 
        DO UPDATE SET ${col} = $2
      `, [uid.toString(), amount || 0]);

      return NextResponse.json({ success: true, message: `Set user ${uid} ${col} to ${amount.toLocaleString()}` });
    }

    if (action === 'give_card') {
      if (!uid || !playerData) {
        return NextResponse.json({ success: false, error: 'User ID and Player Data required' }, { status: 400 });
      }

      const pid = playerData.id || `admin_card_${Date.now()}`;
      const pname = playerData.name || playerData.cardName || playerData.player_name || 'Admin Card';
      const ovr = parseInt(playerData.ovr || playerData.rating || 120, 10);

      await query(`
        INSERT INTO inventory (user_id, player_id, player_name, ovr, player_data)
        VALUES ($1, $2, $3, $4, $5)
      `, [uid.toString(), pid.toString(), pname, ovr, JSON.stringify(playerData)]);

      return NextResponse.json({ success: true, message: `Successfully granted ${ovr} ${pname} to user ${uid}` });
    }

    if (action === 'wipe_user') {
      if (!uid) {
        return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
      }

      await query('DELETE FROM inventory WHERE user_id = $1', [uid.toString()]);
      await query('DELETE FROM squads WHERE user_id = $1', [uid.toString()]);
      await query('UPDATE users SET coins = 0, vouchers = 0, gems = 0, fans = 0, drafts_opened = 0 WHERE user_id = $1', [uid.toString()]);

      return NextResponse.json({ success: true, message: `Successfully wiped data for user ${uid}` });
    }

    if (action === 'refresh_store') {
      await query(`
        INSERT INTO portal_jobs (job_name, requested_at) 
        VALUES ('refresh_store', NOW()) 
        ON CONFLICT (job_name) 
        DO UPDATE SET requested_at = NOW()
      `);
      return NextResponse.json({ success: true, message: 'Queued Store & Draft Refresh command for Discord bot.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
