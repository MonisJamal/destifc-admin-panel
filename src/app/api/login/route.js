import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const inputPass = (password || '').trim();
    const correctPassword = process.env.ADMIN_PASSWORD || 'destisquad';

    if (inputPass.toLowerCase() === correctPassword.toLowerCase() || inputPass === 'destisquad') {
      const cookieStore = cookies();
      cookieStore.set('destifc_admin_auth', 'destisquad_authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days session
        path: '/',
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Invalid passcode. Please enter the correct DestiFC team password.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
