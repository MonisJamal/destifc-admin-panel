import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { buildFullStats, calculateDefaultStats } from '@/lib/statGenerator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all regular custom cards
    const resDraft = await query('SELECT id, card_name, ovr, player_data, created_at FROM custom_cards_catalog ORDER BY id DESC LIMIT 100');
    const draftCards = resDraft.rows.map(r => {
      let data = {};
      try {
        data = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : r.player_data;
      } catch (e) {}
      return {
        ...data,
        id: r.id,
        db_id: r.id,
        custom_id: data.id || `custom_${r.id}`,
        card_name: r.card_name || data.cardName,
        ovr: r.ovr || data.rating,
        buffed_ovr: data.buffed_ovr || null,
        perks: data.perks || { enabled: false },
        type: 'draft_custom'
      };
    });

    // 2. Fetch signature box card(s) from active box and saved presets
    const signatureCards = [];
    const seenCardNames = new Set();

    const resSig = await query('SELECT id, title, signature_card_data, is_active FROM signature_box_config ORDER BY id ASC');
    resSig.rows.forEach(r => {
      let card = {};
      try {
        card = typeof r.signature_card_data === 'string' ? JSON.parse(r.signature_card_data) : r.signature_card_data;
      } catch (e) {}
      if (card && (card.cardName || card.rating)) {
        const cName = (card.cardName || card.player_name || '').toLowerCase();
        seenCardNames.add(cName);
        signatureCards.push({
          ...card,
          id: card.id || `sig_box_${r.id}`,
          box_id: r.id,
          box_title: r.title,
          is_active: r.is_active,
          card_name: card.cardName || card.player_name,
          ovr: card.rating,
          buffed_ovr: card.buffed_ovr || null,
          perks: card.perks || { enabled: false },
          type: 'signature_box_custom'
        });
      }
    });

    try {
      const resPresets = await query('SELECT id, preset_name, title, signature_card_data FROM signature_box_presets ORDER BY id DESC');
      resPresets.rows.forEach(r => {
        let card = {};
        try {
          card = typeof r.signature_card_data === 'string' ? JSON.parse(r.signature_card_data) : r.signature_card_data;
        } catch (e) {}
        if (card && (card.cardName || card.rating)) {
          const cName = (card.cardName || card.player_name || '').toLowerCase();
          if (!seenCardNames.has(cName)) {
            seenCardNames.add(cName);
            signatureCards.push({
              ...card,
              id: card.id || `sig_preset_${r.id}`,
              preset_id: r.id,
              box_title: r.title,
              is_active: false,
              card_name: card.cardName || card.player_name,
              ovr: card.rating,
              buffed_ovr: card.buffed_ovr || null,
              perks: card.perks || { enabled: false },
              type: 'signature_box_custom'
            });
          }
        }
      });
    } catch (pe) {}

    let orderRequests = [];
    try {
      const resReq = await query('SELECT id, user_id, guild_id, player_name, rating, position, club, nation, image_url, notes, status, created_at FROM custom_card_requests ORDER BY id DESC LIMIT 50');
      orderRequests = resReq.rows || [];
    } catch (reqErr) {}

    return NextResponse.json({ 
      success: true, 
      cards: draftCards, // backwards compatibility
      draftCards,
      signatureCards,
      orderRequests
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      ovr,
      position,
      potentialPositions = [],
      imageUrl,
      targetUserId = null,
      nationName = 'World',
      clubName = 'Custom FC',
      programName = 'Custom Master',
      quantity = null,
      nationId = 1,
      clubId = 1,
      matchBoost = 1.15,
      buffedOvr = null,
      perks = null,
      stats = null,
      avgStats = null
    } = body;

    if (!name || !ovr || !position) {
      return NextResponse.json({ success: false, error: 'Name, OVR, and Position are required.' }, { status: 400 });
    }

    const defaultPerks = {
      enabled: false,
      clinical_finisher: false,
      speed_demon: false,
      playmaker: false,
      iron_fortress: false,
      the_wall: false,
      clutch_performer: false,
      sector_surge: 3,
      aura_dominance: false
    };

    const finalPerks = perks && typeof perks === 'object' ? { ...defaultPerks, ...perks } : defaultPerks;
    const cleanOvr = parseInt(ovr, 10);
    const cleanBuffedOvr = buffedOvr ? parseInt(buffedOvr, 10) : null;
    const cleanPos = position.toUpperCase();

    // Build or generate full RenderZ avgStats and stats
    const { avgStats: finalAvg, stats: finalStats } = buildFullStats(
      stats || avgStats || calculateDefaultStats(cleanOvr, cleanBuffedOvr, cleanPos),
      cleanPos
    );

    const playerData = {
      id: `custom_${Date.now()}`,
      cardName: name,
      player_name: name,
      lastName: name,
      rating: cleanOvr,
      ovr: cleanOvr,
      position: cleanPos,
      potentialPositions: potentialPositions,
      avgStats: finalAvg,
      stats: finalStats,
      images: {
        playerImage: imageUrl || null,
        playerCardImage: imageUrl || null,
      },
      nation: { id: nationId, name: nationName || 'World' },
      club: { id: clubId, name: clubName || 'Custom FC' },
      program: { name: programName || 'Admin Custom Release' },
      supply: quantity ? parseInt(quantity, 10) : null,
      performance_boost: parseFloat(matchBoost) || 1.15,
      buffed_ovr: cleanBuffedOvr,
      perks: finalPerks,
      created_at: new Date().toISOString(),
      is_custom: true,
    };

    // Save to permanent Admin Custom Cards Catalog
    const insertRes = await query(
      'INSERT INTO custom_cards_catalog (card_name, ovr, player_data) VALUES ($1, $2, $3) RETURNING id',
      [name, cleanOvr, JSON.stringify(playerData)]
    );

    // If target Discord User ID provided, grant immediately to inventory
    if (targetUserId && targetUserId.toString().trim()) {
      const cleanUid = targetUserId.toString().trim();
      const posClean = (position || 'ST').toString().trim().toUpperCase();
      await query(
        'INSERT INTO inventory (user_id, player_id, player_name, ovr, position, player_data) VALUES ($1, $2, $3, $4, $5, $6)',
        [cleanUid, playerData.id, name, parseInt(ovr, 10), posClean, JSON.stringify(playerData)]
      );
    }

    // Flush cache signal to bot
    try {
      await query("INSERT INTO portal_jobs (job_type, payload, status) VALUES ('SIGNAL_FLUSH_CACHES', '{}', 'pending')");
    } catch (e) {}

    return NextResponse.json({ 
      success: true, 
      card: { ...playerData, id: insertRes.rows[0]?.id } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reqId = searchParams.get('request_id');
    if (reqId) {
      await query('DELETE FROM custom_card_requests WHERE id = $1', [parseInt(reqId, 10)]);
      return NextResponse.json({ success: true, message: 'Custom card request deleted.' });
    }
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Card ID or request_id required' }, { status: 400 });
    }
    
    const trimmedId = id.trim();
    if (/^\d+$/.test(trimmedId)) {
      await query('DELETE FROM custom_cards_catalog WHERE id = $1', [parseInt(trimmedId, 10)]);
    } else {
      await query('DELETE FROM custom_cards_catalog WHERE player_data::text LIKE $1', [`%${trimmedId}%`]);
    }
    
    try {
      await query("INSERT INTO portal_jobs (job_type, payload, status) VALUES ('SIGNAL_FLUSH_CACHES', '{}', 'pending')");
    } catch (e) {}

    return NextResponse.json({ success: true, message: `Custom card deleted from catalog.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      ovr,
      buffedOvr,
      matchBoost,
      position,
      potentialPositions = [],
      imageUrl,
      clubName,
      nationName,
      programName,
      perks,
      stats,
      avgStats
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Card ID is required' }, { status: 400 });
    }

    const isNumericId = /^\d+$/.test(id.toString().trim());
    let existingCatalogRow = null;

    if (isNumericId) {
      const existing = await query('SELECT id, card_name, ovr, player_data FROM custom_cards_catalog WHERE id = $1', [parseInt(id, 10)]);
      if (existing.rows.length > 0) {
        existingCatalogRow = existing.rows[0];
      }
    }

    const newName = name ? name.trim() : 'Custom Player';
    const newOvr = ovr !== undefined && ovr !== '' ? parseInt(ovr, 10) : 120;
    const newPos = (position || 'ST').toString().trim().toUpperCase();
    const newBuffedOvr = buffedOvr !== undefined && buffedOvr !== '' && buffedOvr !== null ? parseInt(buffedOvr, 10) : null;
    const newBoost = matchBoost !== undefined && matchBoost !== '' ? parseFloat(matchBoost) : 1.15;
    const potPositions = Array.isArray(potentialPositions) ? potentialPositions.map(p => p.toString().trim().toUpperCase()).filter(Boolean) : [];

    if (existingCatalogRow) {
      // 1. Update Custom Cards Catalog
      let pData = {};
      try {
        pData = typeof existingCatalogRow.player_data === 'string' ? JSON.parse(existingCatalogRow.player_data) : (existingCatalogRow.player_data || {});
      } catch (e) {}

      pData.cardName = newName;
      pData.player_name = newName;
      pData.lastName = newName;
      pData.rating = newOvr;
      pData.ovr = newOvr;
      pData.position = newPos;
      pData.potentialPositions = potPositions;
      pData.buffed_ovr = newBuffedOvr;
      pData.performance_boost = newBoost;
      if (perks !== undefined) {
        pData.perks = perks;
      }
      if (stats || avgStats) {
        const { avgStats: updatedAvg, stats: updatedStats } = buildFullStats(stats || avgStats, newPos);
        pData.avgStats = updatedAvg;
        pData.stats = updatedStats;
      }
      if (clubName) pData.club = { ...(pData.club || {}), name: clubName.trim() };
      if (nationName) pData.nation = { ...(pData.nation || {}), name: nationName.trim() };
      if (programName) pData.program = { ...(pData.program || {}), name: programName.trim() };
      if (imageUrl) {
        pData.images = {
          ...(pData.images || {}),
          playerImage: imageUrl.trim(),
          playerCardImage: imageUrl.trim()
        };
      }

      await query(
        'UPDATE custom_cards_catalog SET card_name = $1, ovr = $2, player_data = $3 WHERE id = $4',
        [newName, newOvr, JSON.stringify(pData), parseInt(id, 10)]
      );

      const cardIdStr = pData.id || `custom_${id}`;
      // Update inventory holding this catalog custom card atomically using jsonb merge
      await query(
        `UPDATE inventory 
         SET player_name = $1, ovr = $2, position = $3, 
             player_data = COALESCE(player_data, '{}'::jsonb) || $4::jsonb
         WHERE player_id = $5 OR player_name ILIKE $6 OR player_data->>'cardName' ILIKE $6`,
        [
          newName,
          newOvr,
          newPos,
          JSON.stringify(pData),
          cardIdStr,
          `%${newName}%`
        ]
      );
    } else {
      // 2. Handle Signature Card Edit
      const { avgStats: sigAvg, stats: sigStats } = buildFullStats(
        stats || avgStats || calculateDefaultStats(newOvr, newBuffedOvr, newPos),
        newPos
      );

      const sigData = {
        id: id.toString(),
        cardName: newName,
        player_name: newName,
        lastName: newName,
        rating: newOvr,
        ovr: newOvr,
        position: newPos,
        potentialPositions: potPositions,
        avgStats: sigAvg,
        stats: sigStats,
        buffed_ovr: newBuffedOvr || Math.round(newOvr * newBoost),
        performance_boost: newBoost,
        perks: perks || { enabled: false },
        club: { name: clubName || 'Icons' },
        nation: { name: nationName || 'World' },
        source: 'SIGNATURE_BOX',
        is_signature_box: true,
        is_custom: true,
        custom_background_url: imageUrl || '',
        images: {
          playerImage: imageUrl || '',
          playerCardImage: imageUrl || ''
        }
      };

      // Update active signature_box_config if card matches
      try {
        await query(`
          UPDATE signature_box_config
          SET signature_card_data = $1::jsonb, updated_at = CURRENT_TIMESTAMP
          WHERE id = 1 AND (signature_card_data->>'cardName' ILIKE $2 OR signature_card_data->>'id' = $3)
        `, [JSON.stringify(sigData), newName, id.toString()]);
      } catch (e) {}

      // Update signature_box_presets if exists
      try {
        await query(`
          UPDATE signature_box_presets
          SET signature_card_data = $1::jsonb, updated_at = CURRENT_TIMESTAMP
          WHERE signature_card_data->>'cardName' ILIKE $2 OR signature_card_data->>'id' = $3 OR preset_name ILIKE $4
        `, [JSON.stringify(sigData), newName, id.toString(), `%${newName}%`]);
      } catch (e) {}

      // Update all inventories holding this signature card
      await query(
        `UPDATE inventory 
         SET player_name = $1, ovr = $2, position = $3, 
             player_data = player_data || $4::jsonb
         WHERE player_data->>'is_signature_box' = 'true' 
           AND (player_data->>'cardName' ILIKE $5 OR player_name ILIKE $5 OR player_id = $6)`,
        [
          newName,
          newOvr,
          newPos,
          JSON.stringify(sigData),
          newName,
          id.toString()
        ]
      );
    }

    // Flush cache signal to Discord bot
    try {
      await query("INSERT INTO portal_jobs (job_type, payload, status) VALUES ('SIGNAL_FLUSH_CACHES', '{}', 'pending')");
    } catch (e) {}

    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${newName} (Base: ${newOvr} OVR, Alt Positions: ${potPositions.join(', ') || 'None'})!`
    });
  } catch (error) {
    console.error('Error updating custom card:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

