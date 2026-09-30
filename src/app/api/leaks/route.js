import { NextResponse } from 'next/server';
import zlib from 'zlib';
import { formatNation, formatClub, formatProgram } from '@/lib/maps';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'all').toLowerCase(); // 'all' | 'icons' | 'heroes' | 'live' | '120plus'
    const search = (searchParams.get('search') || searchParams.get('query') || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const size = Math.min(48, Math.max(12, parseInt(searchParams.get('size') || '24', 10)));
    const offset = (page - 1) * size;

    let candidateCards = [];

    // 1. Fetch live unreleased & top cards from RenderZ API
    try {
      const queryPayload = {
        query: {
          bool: {
            must: [{ range: { rating: { gte: 100 } } }],
            should: [],
            must_not: []
          }
        },
        sort: [
          { rating: { order: 'desc' } },
          { assetId: { order: 'desc' } }
        ],
        _source: [],
        from: 0,
        size: 100
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
        },
        next: { revalidate: 300 }
      });

      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.players)) {
          candidateCards = data.players;
        }
      }
    } catch (err) {
      console.error('RenderZ search fetch error:', err);
    }

    // 2. Also fetch top & recent cards from Supabase official_cards to merge & ensure 100% availability
    try {
      const dbRes = await query(`
        SELECT asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data
        FROM official_cards
        ORDER BY rating DESC, asset_id DESC
        LIMIT 150
      `);

      if (dbRes.rows && dbRes.rows.length > 0) {
        const existingAssetIds = new Set(candidateCards.map(c => String(c.assetId || c.id)));
        for (const row of dbRes.rows) {
          if (!existingAssetIds.has(String(row.asset_id))) {
            let p = {};
            try {
              p = typeof row.player_data === 'string' ? JSON.parse(row.player_data) : (row.player_data || {});
            } catch (e) {}
            candidateCards.push({
              assetId: row.asset_id,
              id: row.asset_id,
              cardName: row.card_name || row.player_name,
              lastName: p.lastName || row.player_name,
              firstName: p.firstName || '',
              rating: row.rating,
              position: row.position,
              source: row.source,
              club: p.club || { name: row.club_name },
              nation: p.nation || { name: row.nation_name },
              images: p.images || {},
              stats: p.stats || null,
              revealOn: p.revealOn || null,
              added: p.added || null,
              skillMoves: p.skillMoves || null,
              weakFoot: p.weakFoot || null
            });
          }
        }
      }
    } catch (dbErr) {
      console.error('Supabase query error for leaks:', dbErr);
    }

    const now = new Date();

    // 3. Map & Normalize Cards
    const allMapped = candidateCards.map(p => {
      const name = p.cardName || p.lastName || p.commonName || p.firstName || 'Player';
      const ovr = parseInt(p.rating || 100, 10);
      const pos = p.position || 'ST';
      const source = p.source || 'OFFICIAL_PROMO';
      const clubId = p.club?.id || 0;
      const clubName = formatClub(p.club?.name || p.club);
      const nationName = formatNation(p.nation?.name || p.nation);

      const playerImg = p.images?.playerCardImage || p.images?.playerImage || null;
      const bgImg = p.images?.playerCardBackground || null;
      const flagImg = p.images?.flagImage || null;
      const clubImg = p.images?.clubImage || null;

      // Determine category
      const isIcon = source.toUpperCase().includes('ICON') || clubId === 114154 || clubName.toLowerCase().includes('icon');
      const isHero = source.toUpperCase().includes('HERO') || clubId === 115935 || clubName.toLowerCase().includes('hero');
      const isLive = !isIcon && !isHero;

      // Release dates & Leaks schedule
      let revealDateStr = p.revealOn || p.added || null;
      let isUnreleased = false;
      let revealFormatted = 'Official Release';

      if (revealDateStr) {
        try {
          const revDate = new Date(revealDateStr);
          if (revDate > now) {
            isUnreleased = true;
            revealFormatted = `Unlocks on ${revDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${revDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
          } else {
            revealFormatted = `Active in Game (${revDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
          }
        } catch (e) {}
      } else {
        // Upcoming leak estimate
        revealFormatted = 'Upcoming Leaked Promo';
        isUnreleased = true;
      }

      return {
        id: p.assetId || p.id || `leak_${p.assetId}`,
        assetId: p.assetId || p.id,
        name,
        cardName: name,
        player_name: name,
        lastName: p.lastName || name,
        firstName: p.firstName || '',
        rating: ovr,
        ovr,
        position: pos,
        source,
        program: {
          name: formatProgram(source),
          raw: source
        },
        club: {
          name: clubName
        },
        nation: {
          name: nationName
        },
        images: {
          playerImage: playerImg,
          playerCardImage: playerImg,
          playerCardBackground: bgImg,
          flagImage: flagImg,
          clubImage: clubImg
        },
        stats: p.stats || null,
        revealOn: revealDateStr,
        revealFormatted,
        isUnreleased,
        isIcon,
        isHero,
        isLive,
        isInDrafts: false // Leaks remain preview only until officially unlocked
      };
    });

    // 4. Filter by Category & Search
    let filtered = allMapped;

    if (category === 'icons') {
      filtered = filtered.filter(c => c.isIcon);
    } else if (category === 'heroes') {
      filtered = filtered.filter(c => c.isHero);
    } else if (category === 'live') {
      filtered = filtered.filter(c => c.isLive);
    } else if (category === '120plus') {
      filtered = filtered.filter(c => c.rating >= 120);
    }

    if (search) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.position.toLowerCase().includes(search) ||
        c.program.name.toLowerCase().includes(search) ||
        c.club.name.toLowerCase().includes(search) ||
        c.nation.name.toLowerCase().includes(search)
      );
    }

    const paginated = filtered.slice(offset, offset + size);

    return NextResponse.json({
      success: true,
      cards: paginated,
      total: filtered.length,
      page,
      size,
      hasMore: offset + size < filtered.length,
      scrapedAt: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
