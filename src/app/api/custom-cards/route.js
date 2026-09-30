import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query('SELECT * FROM custom_draft_cards ORDER BY id DESC LIMIT 100');
    const cards = res.rows.map(r => {
      let data = {};
      try {
        data = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : r.player_data;
      } catch (e) {}
      return {
        id: r.id,
        ...data
      };
    });
    return NextResponse.json({ success: true, cards });
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
      inDrafts = true,
      nationName = 'World',
      clubName = 'Custom FC',
      programName = 'Custom Release',
      quantity = null,
      nationId = 1,
      clubId = 1
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
      position: position.toUpperCase(),
      images: {
        playerImage: imageUrl || 'https://renderz.app/placeholder.webp',
        playerCardImage: imageUrl || 'https://renderz.app/placeholder.webp',
      },
      nation: { id: nationId, name: nationName || 'World' },
      club: { id: clubId, name: clubName || 'Custom FC' },
      program: { name: programName || 'Admin Custom Release' },
      supply: quantity ? parseInt(quantity, 10) : null,
      created_at: new Date().toISOString(),
    };

    if (inDrafts) {
      await query(
        'INSERT INTO custom_draft_cards (player_data) VALUES ($1)',
        [JSON.stringify(playerData)]
      );
    }

    return NextResponse.json({ success: true, card: playerData });
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
    await query('DELETE FROM custom_draft_cards WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: `Custom card #${id} deleted.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
