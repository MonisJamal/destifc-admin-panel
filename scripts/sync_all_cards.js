const { Pool } = require('pg');
const zlib = require('zlib');

const pool = new Pool({
  connectionString: 'postgresql://postgres.xreebpmibnbttuhevall:MonislovesBiryani37@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 10
});

function formatNation(n) {
  if (!n) return 'World';
  if (typeof n === 'string') return n;
  if (n.name) return n.name.replace(/^NationName_\d+$/, 'World');
  return 'World';
}

function formatClub(c) {
  if (!c) return 'FC Club';
  if (typeof c === 'string') return c;
  if (c.name) return c.name.replace(/^TeamName_\d+$/, 'FC Club');
  return 'FC Club';
}

async function searchRenderZ(queryPayload, retries = 3) {
  const rawBytes = Buffer.from(JSON.stringify(queryPayload));
  const compressed = zlib.deflateRawSync(rawBytes, { level: 9 });
  const encodedQ = compressed.toString('base64url');
  const url = `https://renderz.app/api/search/23?v=1&q=${encodedQ}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://renderz.app/players',
          'Accept': 'application/json'
        }
      });
      if (resp.ok) {
        const json = await resp.json();
        return json.players || [];
      }
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return [];
}

async function bulkUpsertCards(players) {
  if (!players || players.length === 0) return 0;

  const validRows = [];
  for (const p of players) {
    const assetId = p.assetId || p.id;
    if (!assetId) continue;

    const name = p.cardName || p.lastName || p.commonName || p.firstName || 'Player';
    const cardName = p.cardName || name;
    const rating = parseInt(p.rating || 100, 10);
    const position = p.position || 'ST';
    const source = p.source || 'STANDARD';
    const clubName = formatClub(p.club);
    const nationName = formatNation(p.nation);

    validRows.push({
      asset_id: assetId,
      player_name: name,
      card_name: cardName,
      rating,
      position,
      source,
      club_name: clubName,
      nation_name: nationName,
      player_data: JSON.stringify(p)
    });
  }

  if (validRows.length === 0) return 0;

  // Build parameterized bulk insert query
  const valuePlaceholders = [];
  const queryParams = [];

  validRows.forEach((row, i) => {
    const baseIdx = i * 9;
    valuePlaceholders.push(`($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7}, $${baseIdx + 8}, $${baseIdx + 9}::jsonb, NOW())`);
    queryParams.push(
      row.asset_id,
      row.player_name,
      row.card_name,
      row.rating,
      row.position,
      row.source,
      row.club_name,
      row.nation_name,
      row.player_data
    );
  });

  const sql = `
    INSERT INTO official_cards (asset_id, player_name, card_name, rating, position, source, club_name, nation_name, player_data, created_at)
    VALUES ${valuePlaceholders.join(',\n')}
    ON CONFLICT (asset_id) DO UPDATE SET
      player_name = EXCLUDED.player_name,
      card_name = EXCLUDED.card_name,
      rating = EXCLUDED.rating,
      position = EXCLUDED.position,
      source = EXCLUDED.source,
      club_name = EXCLUDED.club_name,
      nation_name = EXCLUDED.nation_name,
      player_data = EXCLUDED.player_data,
      created_at = NOW();
  `;

  await pool.query(sql, queryParams);
  return validRows.length;
}

async function scrapeRatingRange(minOvr, maxOvr) {
  let offset = 0;
  const pageSize = 100;
  let totalForRange = 0;

  console.log(`\n🔍 Scraping OVR Tier [${minOvr} - ${maxOvr}]...`);

  while (offset < 10000) {
    const queryPayload = {
      query: {
        bool: {
          must: [
            { range: { rating: { gte: minOvr, lte: maxOvr } } }
          ],
          should: [],
          must_not: []
        }
      },
      sort: [
        { rating: { order: 'desc' } },
        { assetId: { order: 'desc' } }
      ],
      _source: [],
      from: offset,
      size: pageSize
    };

    const players = await searchRenderZ(queryPayload);
    if (!players || players.length === 0) break;

    const inserted = await bulkUpsertCards(players);
    totalForRange += inserted;
    offset += pageSize;

    if (players.length < pageSize) break;
    // Small delay to be polite to upstream
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`✅ Completed OVR Tier [${minOvr} - ${maxOvr}]: Synced ${totalForRange} cards.`);
  return totalForRange;
}

async function main() {
  console.log('🚀 Starting Full RenderZ Global Sync into Supabase PostgreSQL...');
  const startTime = Date.now();

  // Define rating brackets to capture all cards without exceeding 10k offset limit
  const brackets = [
    [120, 125],
    [115, 119],
    [110, 114],
    [105, 109],
    [100, 104],
    [95, 99],
    [90, 94],
    [85, 89],
    [80, 84],
    [75, 79],
    [70, 74],
    [60, 69],
    [45, 59]
  ];

  let totalSynced = 0;
  for (const [min, max] of brackets) {
    try {
      const count = await scrapeRatingRange(min, max);
      totalSynced += count;
    } catch (err) {
      console.error(`❌ Error scraping [${min}-${max}]:`, err.message);
    }
  }

  const finalCountRes = await pool.query('SELECT COUNT(*) FROM official_cards;');
  const totalInDb = finalCountRes.rows[0].count;

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n🎉 FULL SYNC COMPLETE in ${durationSec}s!`);
  console.log(`📊 Total Cards in Supabase official_cards table: ${totalInDb}`);

  pool.end();
}

main();
