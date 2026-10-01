import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('destifc_admin_auth');

    if (!authCookie || !authCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let parsed = null;
    try {
      parsed = JSON.parse(Buffer.from(authCookie.value, 'base64').toString('utf-8'));
    } catch (e) {
      if (authCookie.value.includes('destisquad_authenticated') || authCookie.value.includes('authenticated')) {
        parsed = { username: 'desti', role: 'superadmin', permissions: ['all'] };
      }
    }

    if (!parsed || !parsed.username) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Refresh user state from database
    const userRes = await query(
      'SELECT id, username, display_name, role, permissions FROM admin_users WHERE LOWER(username) = LOWER($1)',
      [parsed.username]
    );

    if (userRes.rows.length === 0) {
      // Fallback for legacy admin
      return NextResponse.json({
        authenticated: true,
        user: {
          username: parsed.username,
          display_name: parsed.username,
          role: parsed.role || 'superadmin',
          permissions: parsed.permissions || ['all']
        }
      });
    }

    const dbUser = userRes.rows[0];
    let permissions = [];
    try {
      permissions = typeof dbUser.permissions === 'string' ? JSON.parse(dbUser.permissions) : (dbUser.permissions || []);
    } catch (e) {
      permissions = ['all'];
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        display_name: dbUser.display_name || dbUser.username,
        role: dbUser.role || 'moderator',
        permissions: permissions
      }
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
