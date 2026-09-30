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
    const fetchTimestamp = new Date().toISOString();

    let rawMinedPlayers = [];

    // 1. Scrape newly data-mined & upcoming files from RenderZ API sorted by newest added date
    try {
      const queryPayload = {
        query: {
          bool: {
            must: [{ match_all: {} }],
            should: [],
            must_not: []
          }
        },
        sort: [
          { added: { order: 'desc' } },
          { assetId: { order: 'desc' } }
        ],
        _source: [],
        from: 0,
        size: 80
      };

      const rawBytes = Buffer.from(JSON.stringify(queryPayload));
      const compressed = zlib.deflateRawSync(rawBytes, { level: 9 });
      const encodedQ = compressed.toString('base64url');
      const url = `https://renderz.app/api/search/23?v=1&q=${encodedQ}`;

      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://renderz.app/players',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.players)) {
          rawMinedPlayers = data.players;
        }
      }
    } catch (err) {
      console.error('RenderZ data-mining fetch error:', err);
    }

    // 2. Fetch existing official cards to distinguish newly mined leaks from standard cards visible in GUI
    let activeOfficialIds = new Set();
    try {
      const activeRes = await query('SELECT asset_id FROM official_cards LIMIT 10000');
      if (activeRes.rows) {
        activeOfficialIds = new Set(activeRes.rows.map(r => String(r.asset_id)));
      }
    } catch (e) {}

    const now = new Date();

    // 3. Map cards and identify newly mined / unreleased leaks
    const allLeaks = rawMinedPlayers.map(p => {
      const name = p.cardName || p.lastName || p.commonName || p.firstName || 'Player';
      const ovr = parseInt(p.rating || 100, 10);
      const pos = p.position || 'ST';
      const source = p.source || 'PROGRAM_LEAK';
      const clubId = p.club?.id || 0;
      const clubName = formatClub(p.club?.name || p.club);
      const nationName = formatNation(p.nation?.name || p.nation);

      const playerImg = p.images?.playerCardImage || p.images?.playerImage || null;
      const bgImg = p.images?.playerCardBackground || null;
      const flagImg = p.images?.flagImage || null;
      const clubImg = p.images?.clubImage || null;

      const isIcon = source.toUpperCase().includes('ICON') || clubId === 114154 || clubName.toLowerCase().includes('icon');
      const isHero = source.toUpperCase().includes('HERO') || clubId === 115935 || clubName.toLowerCase().includes('hero');
      const isLive = !isIcon && !isHero;

      const assetIdStr = String(p.assetId || p.id || '');
      const isInOfficialDb = activeOfficialIds.has(assetIdStr);

      let addedFormatted = 'Just Mined';
      if (p.added) {
        try {
          const addD = new Date(p.added);
          addedFormatted = addD.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {}
      }

      let revealFormatted = 'Upcoming Leak';
      if (p.revealOn) {
        try {
          const revD = new Date(p.revealOn);
          revealFormatted = `Unlocks ${revD.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${revD.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
        } catch (e) {}
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
        added: p.added || null,
        revealOn: p.revealOn || null,
        addedFormatted,
        revealFormatted,
        fetchedAt: fetchTimestamp,
        isUnreleased: true, // Leaked unreleased cards cannot be pulled in standard drafts until official launch
        isIcon,
        isHero,
        isLive,
        isInDrafts: false
      };
    });

    // 4. Filter by Category & Search
    let filtered = allLeaks;

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
      fetchedAt: fetchTimestamp
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
