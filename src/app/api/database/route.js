import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { formatNation, formatClub, formatProgram } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'official'; // 'official' | 'inventory' | 'market' | 'users'
    const search = (searchParams.get('search') || '').trim();
    const minOvr = searchParams.get('minOvr') ? parseInt(searchParams.get('minOvr'), 10) : null;
    const maxOvr = searchParams.get('maxOvr') ? parseInt(searchParams.get('maxOvr'), 10) : null;
    const position = (searchParams.get('position') || '').trim().toUpperCase();
    const program = (searchParams.get('program') || '').trim();
    const sort = searchParams.get('sort') || 'ovr_desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = 25;
    const offset = (page - 1) * limit;

    let rows = [];
    let total = 0;
    let maxDbOvr = 122;

    // Fetch dynamic max OVR
    try {
      const maxOvrRes = await query('SELECT MAX(rating) as max_r FROM official_cards');
      if (maxOvrRes.rows[0]?.max_r) {
        maxDbOvr = parseInt(maxOvrRes.rows[0].max_r, 10);
      }
    } catch (e) {}

    if (tab === 'users') {
      let q = 'SELECT user_id, coins, vouchers, gems, fans, drafts_opened FROM users';
      let countQ = 'SELECT COUNT(*) FROM users';
      let params = [];

      if (search) {
        q += ' WHERE user_id::text LIKE $1';
        countQ += ' WHERE user_id::text LIKE $1';
        params.push(`%${search}%`);
      }

      let orderClause = 'ORDER BY coins DESC';
      if (sort === 'fans') orderClause = 'ORDER BY fans DESC';
      else if (sort === 'drafts') orderClause = 'ORDER BY drafts_opened DESC';

      q += ` ${orderClause} LIMIT ${limit} OFFSET ${offset}`;
      const res = await query(q, params);
      const countRes = await query(countQ, params);
      rows = res.rows;
      total = parseInt(countRes.rows[0].count, 10);
    } else if (tab === 'inventory') {
      let conditions = [];
      let params = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(player_name ILIKE $${params.length} OR user_id::text LIKE $${params.length})`);
      }
      if (minOvr !== null) {
        params.push(minOvr);
        conditions.push(`ovr >= $${params.length}`);
      }
      if (maxOvr !== null) {
        params.push(maxOvr);
        conditions.push(`ovr <= $${params.length}`);
      }
      if (position && position !== 'ALL') {
        params.push(`%"position":"${position}"%`);
        conditions.push(`player_data::text LIKE $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      let orderClause = 'ORDER BY ovr DESC, id DESC';
      if (sort === 'ovr_asc') orderClause = 'ORDER BY ovr ASC, id ASC';
      else if (sort === 'name_asc') orderClause = 'ORDER BY player_name ASC';

      const q = `SELECT id, user_id, player_name, ovr, locked, player_data FROM inventory ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset}`;
      const countQ = `SELECT COUNT(*) FROM inventory ${whereClause}`;

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
      let conditions = [];
      let params = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(player_name ILIKE $${params.length} OR seller_id::text LIKE $${params.length})`);
      }
      if (minOvr !== null) {
        params.push(minOvr);
        conditions.push(`ovr >= $${params.length}`);
      }
      if (maxOvr !== null) {
        params.push(maxOvr);
        conditions.push(`ovr <= $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      let orderClause = 'ORDER BY listed_at DESC';
      if (sort === 'price_desc') orderClause = 'ORDER BY price DESC';
      else if (sort === 'price_asc') orderClause = 'ORDER BY price ASC';
      else if (sort === 'ovr_desc') orderClause = 'ORDER BY ovr DESC';

      const q = `SELECT id, seller_id, player_name, ovr, price, listed_at, player_data FROM market ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset}`;
      const countQ = `SELECT COUNT(*) FROM market ${whereClause}`;

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
      let conditions = [];
      let params = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(player_name ILIKE $${params.length} OR card_name ILIKE $${params.length} OR source ILIKE $${params.length})`);
      }
      if (minOvr !== null) {
        params.push(minOvr);
        conditions.push(`rating >= $${params.length}`);
      }
      if (maxOvr !== null) {
        params.push(maxOvr);
        conditions.push(`rating <= $${params.length}`);
      }
      if (position && position !== 'ALL') {
        params.push(position);
        conditions.push(`position = $${params.length}`);
      }
      if (program && program !== 'ALL') {
        params.push(`%${program}%`);
        conditions.push(`source ILIKE $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      let orderClause = 'ORDER BY rating DESC, asset_id DESC';
      if (sort === 'ovr_asc') orderClause = 'ORDER BY rating ASC, asset_id ASC';
      else if (sort === 'name_asc') orderClause = 'ORDER BY card_name ASC, player_name ASC';

      const q = `SELECT asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data FROM official_cards ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset}`;
      const countQ = `SELECT COUNT(*) FROM official_cards ${whereClause}`;

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
      maxOvr: maxDbOvr
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
