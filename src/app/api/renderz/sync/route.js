import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { formatNation, formatClub, formatProgram } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const countRes = await query('SELECT COUNT(*) FROM official_cards');
    const lastJobRes = await query(`
      SELECT id, job_type, status, result, error, created_at, updated_at 
      FROM portal_jobs 
      WHERE job_type = 'SYNC_RENDERZ_CARDS' 
      ORDER BY id DESC LIMIT 1
    `);

    return NextResponse.json({
      success: true,
      total_official_cards: parseInt(countRes.rows[0]?.count || 0, 10),
      last_sync_job: lastJobRes.rows[0] || null,
      scheduled_slots: 'Twice daily at 10:00 AM IST and 10:00 PM IST'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const action = body.action || 'sync_all';

    // 1. Full sync triggered via bot background worker
    if (action === 'sync_all') {
      await query("INSERT INTO portal_jobs (job_type, payload) VALUES ('SYNC_RENDERZ_CARDS', '{}')");
      return NextResponse.json({
        success: true,
        message: '⚡ RenderZ card synchronization dispatched! The bot is syncing all high-OVR cards and unreleased leaks in the background.'
      });
    }

    // 2. Direct batch insertion of specific mined/fetched cards into official_cards & bot pools
    if (action === 'insert_cards') {
      const cards = body.cards || [];
      if (!Array.isArray(cards) || cards.length === 0) {
        return NextResponse.json({ success: false, error: 'No cards provided in payload' }, { status: 400 });
      }

      let insertedCount = 0;
      for (const c of cards) {
        const assetId = parseInt(c.assetId || c.id || 0, 10);
        if (!assetId || isNaN(assetId)) continue;

        const name = c.cardName || c.name || c.player_name || c.lastName || 'Player';
        const cardName = c.cardName || c.name || name;
        const rating = parseInt(c.rating || c.ovr || 100, 10);
        const position = (c.position || 'ST').toUpperCase();
        const source = c.source || (c.program?.raw || c.program?.name || 'PROGRAM_LEAK');
        const clubName = c.club?.name || formatClub(c.club || '');
        const nationName = c.nation?.name || formatNation(c.nation || '');

        const playerData = {
          assetId,
          id: assetId,
          cardName,
          lastName: c.lastName || name,
          firstName: c.firstName || '',
          rating,
          position,
          source,
          club: { name: clubName },
          nation: { name: nationName },
          images: c.images || {
            playerCardImage: c.image || null,
            playerImage: c.image || null,
            playerCardBackground: c.bg_image || null
          },
          stats: c.stats || null,
          isUnreleased: Boolean(c.isUnreleased)
        };

        await query(`
          INSERT INTO official_cards (asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
          ON CONFLICT (asset_id) DO UPDATE SET
            player_name = EXCLUDED.player_name,
            card_name = EXCLUDED.card_name,
            rating = EXCLUDED.rating,
            position = EXCLUDED.position,
            source = EXCLUDED.source,
            club_name = EXCLUDED.club_name,
            nation_name = EXCLUDED.nation_name,
            player_data = EXCLUDED.player_data;
        `, [
          assetId,
          name,
          cardName,
          rating,
          position,
          source,
          clubName,
          nationName,
          JSON.stringify(playerData)
        ]);
        insertedCount++;
      }

      // Signal bot to flush & reload card RAM cache
      await query("INSERT INTO portal_jobs (job_type, payload) VALUES ('SIGNAL_FLUSH_CACHES', '{}')");

      return NextResponse.json({
        success: true,
        insertedCount,
        message: `✅ Successfully inserted ${insertedCount} cards into official_cards and updated live bot pools!`
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('RenderZ sync API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
