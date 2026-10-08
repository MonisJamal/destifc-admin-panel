import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
        type: 'draft_custom'
      };
    });

    // 2. Fetch signature box card(s)
    const resSig = await query('SELECT id, title, signature_card_data, is_active FROM signature_box_config ORDER BY id ASC');
    const signatureCards = [];
    resSig.rows.forEach(r => {
      let card = {};
      try {
        card = typeof r.signature_card_data === 'string' ? JSON.parse(r.signature_card_data) : r.signature_card_data;
      } catch (e) {}
      if (card && (card.cardName || card.rating)) {
        signatureCards.push({
          ...card,
          box_id: r.id,
          box_title: r.title,
          is_active: r.is_active,
          card_name: card.cardName || card.player_name,
          ovr: card.rating,
          type: 'signature_box_custom'
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      cards: draftCards, // backwards compatibility
      draftCards,
      signatureCards 
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
      imageUrl,
      targetUserId = null,
      nationName = 'World',
      clubName = 'Custom FC',
      programName = 'Custom Master',
      quantity = null,
      nationId = 1,
      clubId = 1,
      matchBoost = 1.15,
      buffedOvr = null
    } = body;

    if (!name || !ovr || !position) {
      return NextResponse.json({ success: false, error: 'Name, OVR, and Position are required.' }, { status: 400 });
    }

    const playerData = {
      id: `custom_${Date.now()}`,
      cardName: name,
      player_name: name,
      lastName: name,
      rating: parseInt(ovr, 10),
      ovr: parseInt(ovr, 10),
      position: position.toUpperCase(),
      images: {
        playerImage: imageUrl || null,
        playerCardImage: imageUrl || null,
      },
      nation: { id: nationId, name: nationName || 'World' },
      club: { id: clubId, name: clubName || 'Custom FC' },
      program: { name: programName || 'Admin Custom Release' },
      supply: quantity ? parseInt(quantity, 10) : null,
      performance_boost: parseFloat(matchBoost) || 1.15,
      buffed_ovr: buffedOvr ? parseInt(buffedOvr, 10) : null,
      created_at: new Date().toISOString(),
      is_custom: true,
    };

    // Save to permanent Admin Custom Cards Catalog
    const insertRes = await query(
      'INSERT INTO custom_cards_catalog (card_name, ovr, player_data) VALUES ($1, $2, $3) RETURNING id',
      [name, parseInt(ovr, 10), JSON.stringify(playerData)]
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
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Card ID required' }, { status: 400 });
    }
    
    const trimmedId = id.trim();
    if (/^\d+$/.test(trimmedId)) {
      await query('DELETE FROM custom_cards_catalog WHERE id = $1', [parseInt(trimmedId, 10)]);
    } else {
      await query('DELETE FROM custom_cards_catalog WHERE player_data::text LIKE $1', [`%${trimmedId}%`]);
    }
    
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
      imageUrl,
      clubName,
      nationName,
      programName
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Card ID is required' }, { status: 400 });
    }

    // 1. Fetch existing card from catalog
    const existing = await query('SELECT id, card_name, ovr, player_data FROM custom_cards_catalog WHERE id = $1', [parseInt(id, 10)]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Custom card not found in catalog' }, { status: 404 });
    }

    let pData = {};
    try {
      pData = typeof existing.rows[0].player_data === 'string' ? JSON.parse(existing.rows[0].player_data) : (existing.rows[0].player_data || {});
    } catch (e) {}

    const newName = name ? name.trim() : existing.rows[0].card_name;
    const newOvr = ovr !== undefined && ovr !== '' ? parseInt(ovr, 10) : (existing.rows[0].ovr || pData.rating);
    const newPos = (position || pData.position || 'ST').toString().trim().toUpperCase();
    const newBuffedOvr = buffedOvr !== undefined && buffedOvr !== '' && buffedOvr !== null ? parseInt(buffedOvr, 10) : (pData.buffed_ovr || null);
    const newBoost = matchBoost !== undefined && matchBoost !== '' ? parseFloat(matchBoost) : (pData.performance_boost || 1.15);

    pData.cardName = newName;
    pData.player_name = newName;
    pData.lastName = newName;
    pData.rating = newOvr;
    pData.ovr = newOvr;
    pData.position = newPos;
    pData.buffed_ovr = newBuffedOvr;
    pData.performance_boost = newBoost;
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

    // 2. Update catalog row
    await query(
      'UPDATE custom_cards_catalog SET card_name = $1, ovr = $2, player_data = $3 WHERE id = $4',
      [newName, newOvr, JSON.stringify(pData), parseInt(id, 10)]
    );

    // 3. Update all existing user inventories holding this card
    const cardIdStr = pData.id || `custom_${id}`;
    await query(
      `UPDATE inventory 
       SET player_name = $1, ovr = $2, position = $3, 
           player_data = jsonb_set(
             jsonb_set(
               jsonb_set(COALESCE(player_data, '{}'::jsonb), '{buffed_ovr}', $4::jsonb),
               '{performance_boost}', $5::jsonb
             ),
             '{rating}', $6::jsonb
           )
       WHERE player_id = $7 OR player_name ILIKE $8`,
      [
        newName,
        newOvr,
        newPos,
        newBuffedOvr ? JSON.stringify(newBuffedOvr) : 'null',
        JSON.stringify(newBoost),
        JSON.stringify(newOvr),
        cardIdStr,
        `%${newName}%`
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${newName} (Base: ${newOvr} OVR, Buffed In-Match: ${newBuffedOvr ? `${newBuffedOvr} OVR` : `${newBoost}x`})`,
      card: { ...pData, id: parseInt(id, 10), card_name: newName, ovr: newOvr, buffed_ovr: newBuffedOvr, performance_boost: newBoost }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

