import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import zlib from 'zlib';
import { formatNation, formatClub, formatProgram } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryStr = (searchParams.get('query') || searchParams.get('name') || '').trim();
    const minOvr = searchParams.get('minOvr') ? parseInt(searchParams.get('minOvr'), 10) : null;
    const maxOvr = searchParams.get('maxOvr') ? parseInt(searchParams.get('maxOvr'), 10) : null;
    const position = (searchParams.get('position') || '').trim().toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const size = Math.min(48, Math.max(6, parseInt(searchParams.get('size') || '24', 10)));
    const offset = (page - 1) * size;

    // 1. Primary Source: Query Supabase official_cards directly (100% reliable, zero Cloudflare block, <10ms)
    try {
      const sqlConditions = [];
      const sqlParams = [];

      if (queryStr) {
        sqlParams.push(`%${queryStr}%`);
        sqlConditions.push(`(player_name ILIKE $${sqlParams.length} OR card_name ILIKE $${sqlParams.length} OR source ILIKE $${sqlParams.length})`);
      }

      if (minOvr !== null) {
        sqlParams.push(minOvr);
        sqlConditions.push(`rating >= $${sqlParams.length}`);
      }

      if (maxOvr !== null) {
        sqlParams.push(maxOvr);
        sqlConditions.push(`rating <= $${sqlParams.length}`);
      }

      if (position && position !== 'ALL') {
        sqlParams.push(position);
        sqlConditions.push(`position = $${sqlParams.length}`);
      }

      const whereClause = sqlConditions.length > 0 ? `WHERE ${sqlConditions.join(' AND ')}` : '';
      
      sqlParams.push(size);
      const limitIdx = sqlParams.length;
      sqlParams.push(offset);
      const offsetIdx = sqlParams.length;

      const dbRes = await query(`
        SELECT asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data
        FROM official_cards
        ${whereClause}
        ORDER BY rating DESC, asset_id DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `, sqlParams);

      if (dbRes.rows && dbRes.rows.length > 0) {
        const cards = dbRes.rows.map(r => {
          let p = {};
          try {
            p = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : r.player_data;
          } catch (e) {}

          const name = r.card_name || r.player_name || p.cardName || 'Player';
          const playerImg = p.images?.playerCardImage || p.images?.playerImage || null;
          const bgImg = p.images?.playerCardBackground || null;

          return {
            id: r.asset_id,
            assetId: r.asset_id,
            name,
            cardName: name,
            player_name: name,
            lastName: p.lastName || name,
            rating: r.rating,
            ovr: r.rating,
            position: r.position,
            source: r.source || '',
            program: {
              name: formatProgram(r.source)
            },
            club: {
              name: r.club_name || formatClub(p.club)
            },
            nation: {
              name: r.nation_name || formatNation(p.nation)
            },
            images: {
              playerImage: playerImg,
              playerCardImage: playerImg,
              playerCardBackground: bgImg
            },
            stats: p.stats || null,
            skillMoves: p.skillMoves || null,
            weakFoot: p.weakFoot || null
          };
        });

        return NextResponse.json({
          success: true,
          cards,
          page,
          size,
          hasMore: cards.length === size,
          source: 'database'
        });
      }
    } catch (dbErr) {
      console.error('Supabase official_cards query error:', dbErr);
    }

    // 2. Fallback to live RenderZ search if DB query returned 0 rows
    const mustClauses = [];
    if (queryStr) {
      mustClauses.push({
        query_string: {
          fields: ["cardName", "commonName", "firstName", "lastName"],
          query: `*${queryStr}*`
        }
      });
    } else {
      mustClauses.push({ match_all: {} });
    }

    if (minOvr !== null || maxOvr !== null) {
      const range = {};
      if (minOvr !== null) range.gte = minOvr;
      if (maxOvr !== null) range.lte = maxOvr;
      mustClauses.push({ range: { rating: range } });
    }

    if (position && position !== 'ALL') {
      mustClauses.push({ match: { position } });
    }

    const queryPayload = {
      query: { bool: { must: mustClauses, should: [], must_not: [] } },
      sort: [{ rating: { order: "desc" } }, { assetId: { order: "desc" } }],
      _source: [],
      from: offset,
      size
    };

    const rawBytes = Buffer.from(JSON.stringify(queryPayload));
    const compressed = zlib.deflateRawSync(rawBytes, { level: 9 });
    const encodedQ = compressed.toString('base64url');
    const url = `https://renderz.app/api/search/23?v=1&q=${encodedQ}`;

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://renderz.app/players",
        "Accept": "application/json"
      }
    });

    if (!resp.ok) {
      return NextResponse.json({ success: true, cards: [], page, size, hasMore: false });
    }

    const data = await resp.json();
    const rawPlayers = data.players || [];

    const cards = rawPlayers.map(p => {
      const name = p.cardName || p.lastName || p.commonName || p.firstName || 'Player';
      const ovr = parseInt(p.rating || 100, 10);
      const pos = p.position || 'ST';
      const playerImg = p.images?.playerCardImage || p.images?.playerImage || null;
      const bgImg = p.images?.playerCardBackground || null;

      return {
        id: p.assetId || p.id || `rz_${p.assetId}`,
        assetId: p.assetId,
        name,
        cardName: name,
        player_name: name,
        lastName: p.lastName || name,
        rating: ovr,
        ovr,
        position: pos,
        source: p.source || '',
        program: {
          name: formatProgram(p.source)
        },
        club: {
          name: formatClub(p.club?.name || p.club)
        },
        nation: {
          name: formatNation(p.nation?.name || p.nation)
        },
        images: {
          playerImage: playerImg,
          playerCardImage: playerImg,
          playerCardBackground: bgImg
        },
        stats: p.stats || null,
        skillMoves: p.skillMoves || null,
        weakFoot: p.weakFoot || null
      };
    });

    return NextResponse.json({
      success: true,
      cards,
      page,
      size,
      hasMore: cards.length === size
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
