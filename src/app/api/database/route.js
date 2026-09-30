import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { formatNation, formatClub, formatProgram } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'users'; // 'users' | 'inventory' | 'market' | 'official'
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 25;
    const offset = (page - 1) * limit;

    let rows = [];
    let total = 0;

    if (tab === 'users') {
      let q = 'SELECT user_id, coins, vouchers, gems, fans, drafts_opened FROM users';
      let countQ = 'SELECT COUNT(*) FROM users';
      let params = [];

      if (search) {
        q += ' WHERE user_id::text LIKE $1';
        countQ += ' WHERE user_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY coins DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      rows = res.rows;
      total = parseInt(countRes.rows[0].count, 10);
    } else if (tab === 'inventory') {
      let q = 'SELECT id, user_id, player_name, ovr, locked, player_data FROM inventory';
      let countQ = 'SELECT COUNT(*) FROM inventory';
      let params = [];

      if (search) {
        q += ' WHERE player_name ILIKE $1 OR user_id::text LIKE $1';
        countQ += ' WHERE player_name ILIKE $1 OR user_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY ovr DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      
      rows = res.rows.map(r => {
        let p = {};
        try {
          p = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : (r.player_data || {});
        } catch (e) {}

        const clubName = formatClub(p.club?.name || p.club || '');
        const nationName = formatNation(p.nation?.name || p.nation || '');

        return {
          id: r.id,
          user_id: r.user_id,
          player_name: r.player_name,
          ovr: r.ovr,
          rating: r.ovr,
          locked: r.locked,
          position: p.position || 'ST',
          source: p.source || '',
          program: formatProgram(p.source || ''),
          image: p.images?.playerCardImage || p.images?.playerImage || p.imageUrl || null,
          bg_image: p.images?.playerCardBackground || null,
          flag_image: p.images?.flagImage || null,
          club_image: p.images?.clubImage || null,
          club_name: clubName,
          nation_name: nationName,
          stats: p.stats || null,
          player_data: p
        };
      });
      total = parseInt(countRes.rows[0].count, 10);
    } else if (tab === 'market') {
      let q = 'SELECT id, seller_id, player_name, ovr, price, listed_at, player_data FROM market';
      let countQ = 'SELECT COUNT(*) FROM market';
      let params = [];

      if (search) {
        q += ' WHERE player_name ILIKE $1 OR seller_id::text LIKE $1';
        countQ += ' WHERE player_name ILIKE $1 OR seller_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY listed_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      
      rows = res.rows.map(r => {
        let p = {};
        try {
          p = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : (r.player_data || {});
        } catch (e) {}

        const clubName = formatClub(p.club?.name || p.club || '');
        const nationName = formatNation(p.nation?.name || p.nation || '');

        return {
          id: r.id,
          seller_id: r.seller_id,
          player_name: r.player_name,
          ovr: r.ovr,
          rating: r.ovr,
          price: r.price,
          listed_at: r.listed_at,
          position: p.position || 'ST',
          source: p.source || '',
          program: formatProgram(p.source || ''),
          image: p.images?.playerCardImage || p.images?.playerImage || p.imageUrl || null,
          bg_image: p.images?.playerCardBackground || null,
          flag_image: p.images?.flagImage || null,
          club_image: p.images?.clubImage || null,
          club_name: clubName,
          nation_name: nationName,
          stats: p.stats || null,
          player_data: p
        };
      });
      total = parseInt(countRes.rows[0].count, 10);
    } else if (tab === 'official') {
      let q = 'SELECT asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data FROM official_cards';
      let countQ = 'SELECT COUNT(*) FROM official_cards';
      let params = [];

      if (search) {
        q += ' WHERE player_name ILIKE $1 OR card_name ILIKE $1 OR source ILIKE $1';
        countQ += ' WHERE player_name ILIKE $1 OR card_name ILIKE $1 OR source ILIKE $1';
        params.push(`%${search}%`);
      }

      q += ` ORDER BY rating DESC, asset_id DESC LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);

      rows = res.rows.map(r => {
        let p = {};
        try {
          p = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : (r.player_data || {});
        } catch (e) {}

        const clubName = r.club_name || formatClub(p.club?.name || p.club || '');
        const nationName = r.nation_name || formatNation(p.nation?.name || p.nation || '');

        return {
          asset_id: r.asset_id,
          player_name: r.card_name || r.player_name,
          rating: r.rating,
          ovr: r.rating,
          position: r.position,
          source: r.source,
          program: formatProgram(r.source),
          club_name: clubName,
          nation_name: nationName,
          image: p.images?.playerCardImage || p.images?.playerImage || null,
          bg_image: p.images?.playerCardBackground || null,
          flag_image: p.images?.flagImage || null,
          club_image: p.images?.clubImage || null,
          stats: p.stats || null,
          player_data: p
        };
      });
      total = parseInt(countRes.rows[0].count, 10);
    }

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
