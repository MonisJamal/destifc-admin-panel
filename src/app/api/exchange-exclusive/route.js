import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  target_ovr: 122,
  enabled: true
};

export async function GET() {
  try {
    // 1. Fetch exchange exclusive settings
    const settingsRes = await query("SELECT value FROM system_settings WHERE key = 'exchange_exclusive_settings'");
    let settings = DEFAULT_SETTINGS;
    if (settingsRes.rows.length > 0) {
      const val = settingsRes.rows[0].value;
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      settings = { ...DEFAULT_SETTINGS, ...parsed };
    }

    const targetOvr = parseInt(settings.target_ovr || 122, 10);

    // 2. Fetch all cards currently flagged as exchange exclusive
    const exclusiveRes = await query(`
      SELECT asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data, exchange_exclusive
      FROM official_cards
      WHERE exchange_exclusive = 1
      ORDER BY rating DESC, card_name ASC
    `);

    const exclusiveCards = exclusiveRes.rows.map(r => {
      let p = {};
      try {
        p = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : r.player_data;
      } catch (e) {}
      return {
        id: r.asset_id,
        assetId: r.asset_id,
        name: r.card_name || r.player_name || p.cardName || 'Player',
        cardName: r.card_name || r.player_name || p.cardName || 'Player',
        rating: r.rating,
        ovr: r.rating,
        position: r.position,
        source: r.source || '',
        club: r.club_name,
        nation: r.nation_name,
        images: p.images || {}
      };
    });

    // 3. Fetch all official cards of the target_ovr so admins can toggle exclusivity with 1 click
    const poolRes = await query(`
      SELECT asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data, exchange_exclusive
      FROM official_cards
      WHERE rating = $1
      ORDER BY exchange_exclusive DESC, card_name ASC
    `, [targetOvr]);

    const targetOvrCards = poolRes.rows.map(r => {
      let p = {};
      try {
        p = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : r.player_data;
      } catch (e) {}
      return {
        id: r.asset_id,
        assetId: r.asset_id,
        name: r.card_name || r.player_name || p.cardName || 'Player',
        cardName: r.card_name || r.player_name || p.cardName || 'Player',
        rating: r.rating,
        ovr: r.rating,
        position: r.position,
        source: r.source || '',
        club: r.club_name,
        nation: r.nation_name,
        exchange_exclusive: r.exchange_exclusive || 0,
        isExchangeExclusive: r.exchange_exclusive === 1,
        images: p.images || {}
      };
    });

    return NextResponse.json({
      success: true,
      settings,
      exclusiveCards,
      targetOvrCards,
      counts: {
        totalExclusive: exclusiveCards.length,
        targetExclusive: exclusiveCards.filter(c => c.rating === targetOvr).length,
        targetTotal: targetOvrCards.length
      }
    });
  } catch (error) {
    console.error('Error fetching exchange exclusive data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Save target OVR or general configuration
    if (action === 'save_settings') {
      const { target_ovr, enabled } = body;
      const targetOvrInt = parseInt(target_ovr || 122, 10);
      const payload = {
        target_ovr: targetOvrInt,
        enabled: enabled !== undefined ? Boolean(enabled) : true
      };

      await query(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ('exchange_exclusive_settings', $1, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
      `, [JSON.stringify(payload)]);

      return NextResponse.json({
        success: true,
        message: `Exchange Exclusive settings saved! Target Rating set to ${targetOvrInt} OVR.`,
        settings: payload
      });
    }

    // Toggle specific card exclusivity
    if (action === 'toggle_card') {
      const { assetId, exclusive } = body;
      if (!assetId) {
        return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
      }

      const val = exclusive ? 1 : 0;
      await query(
        'UPDATE official_cards SET exchange_exclusive = $1 WHERE asset_id = $2',
        [val, parseInt(assetId, 10)]
      );

      // Force instant refresh of active exchange pool if needed
      return NextResponse.json({
        success: true,
        message: `Card #${assetId} updated to ${exclusive ? 'Exchange Exclusive ONLY (Removed from drafts)' : 'Normal (Available in drafts)'}!`
      });
    }

    // Force refresh the exchange pool on demand
    if (action === 'refresh_pool') {
      await query('DELETE FROM global_exchange_pool WHERE id = 1');
      return NextResponse.json({
        success: true,
        message: 'Active Exchange Pool wiped. Discord bot will regenerate next loop!'
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error saving exchange exclusive:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
