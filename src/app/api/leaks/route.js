import { NextResponse } from 'next/server';
import zlib from 'zlib';
import { formatNation, formatClub, formatProgram } from '@/lib/maps';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all'; // 'all' | 'icons' | 'heroes' | 'live' | '120plus'
    const programQuery = searchParams.get('program') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const size = Math.min(48, Math.max(12, parseInt(searchParams.get('size') || '24', 10)));
    const offset = (page - 1) * size;

    // Build query to scrape newest & highest tier cards from RenderZ
    const mustClauses = [];
    
    if (category === 'icons') {
      mustClauses.push({
        bool: {
          should: [
            { wildcard: { source: '*ICON*' } },
            { match: { 'club.id': 114154 } }
          ]
        }
      });
    } else if (category === 'heroes') {
      mustClauses.push({
        bool: {
          should: [
            { wildcard: { source: '*HERO*' } },
            { match: { 'club.id': 115935 } }
          ]
        }
      });
    } else if (category === 'live') {
      mustClauses.push({
        bool: {
          must_not: [
            { wildcard: { source: '*ICON*' } },
            { wildcard: { source: '*HERO*' } }
          ]
        }
      });
    } else if (category === '120plus') {
      mustClauses.push({ range: { rating: { gte: 120 } } });
    }

    if (programQuery && programQuery !== 'ALL') {
      mustClauses.push({ wildcard: { source: `*${programQuery}*` } });
    }

    if (mustClauses.length === 0) {
      mustClauses.push({ match_all: {} });
    }

    const queryPayload = {
      query: { bool: { must: mustClauses, should: [], must_not: [] } },
      sort: [
        { rating: { order: 'desc' } },
        { assetId: { order: 'desc' } }
      ],
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://renderz.app/players',
        'Accept': 'application/json'
      }
    });

    let rawPlayers = [];
    if (resp.ok) {
      const data = await resp.json();
      rawPlayers = data.players || [];
    }

    // Check which cards are already launched in live official database
    let activeOfficialIds = new Set();
    try {
      const activeRes = await query('SELECT asset_id FROM official_cards LIMIT 5000');
      if (activeRes.rows) {
        activeOfficialIds = new Set(activeRes.rows.map(r => String(r.asset_id)));
      }
    } catch (e) {}

    const now = new Date();

    const leakedCards = rawPlayers.map(p => {
      const name = p.cardName || p.lastName || p.commonName || p.firstName || 'Player';
      const ovr = parseInt(p.rating || 100, 10);
      const pos = p.position || 'ST';
      const playerImg = p.images?.playerCardImage || p.images?.playerImage || null;
      const bgImg = p.images?.playerCardBackground || null;
      const flagImg = p.images?.flagImage || null;
      const clubImg = p.images?.clubImage || null;

      const revealDateStr = p.revealOn || p.added || null;
      let isUnreleased = false;
      let revealFormatted = 'Available Now';
      
      if (revealDateStr) {
        try {
          const revDate = new Date(revealDateStr);
          if (revDate > now) {
            isUnreleased = true;
            revealFormatted = `Unlocks on ${revDate.toLocaleDateString()} at ${revDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          } else {
            revealFormatted = `Released ${revDate.toLocaleDateString()}`;
          }
        } catch (e) {}
      }

      const assetIdStr = String(p.assetId || p.id || '');
      const isInDrafts = activeOfficialIds.has(assetIdStr) && !isUnreleased;

      return {
        id: p.assetId || p.id || `leak_${p.assetId}`,
        assetId: p.assetId,
        name,
        cardName: name,
        player_name: name,
        lastName: p.lastName || name,
        rating: ovr,
        ovr,
        position: pos,
        source: p.source || 'OFFICIAL_PROMO',
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
          playerCardBackground: bgImg,
          flagImage: flagImg,
          clubImage: clubImg
        },
        stats: p.stats || null,
        revealOn: p.revealOn || null,
        added: p.added || null,
        revealFormatted,
        isUnreleased,
        isInDrafts
      };
    });

    return NextResponse.json({
      success: true,
      cards: leakedCards,
      page,
      size,
      hasMore: leakedCards.length === size,
      scrapedAt: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
