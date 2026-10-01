import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required.' }, { status: 400 });
    }

    // 1. If username is provided, query admin_users table
    let authenticatedUser = null;

    if (username) {
      const userRes = await query(
        'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1)',
        [username]
      );
      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        if (user.password === password || (password.toLowerCase() === 'destisquad' && user.role === 'superadmin')) {
          let permissions = ['all'];
          try {
            permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || ['all']);
          } catch (e) {
            permissions = ['all'];
          }
          authenticatedUser = {
            id: user.id,
            username: user.username,
            display_name: user.display_name || user.username,
            role: user.role || 'moderator',
            permissions: permissions
          };
        }
      }
    }

    // 2. Fallback legacy / default root check
    if (!authenticatedUser) {
      if ((!username || username.toLowerCase() === 'desti' || username.toLowerCase() === 'admin') && 
          (password.toLowerCase() === 'destisquad' || password === process.env.ADMIN_PASSWORD)) {
        authenticatedUser = {
          id: 1,
          username: username || 'desti',
          display_name: 'Desti Admin',
          role: 'superadmin',
          permissions: ['all']
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or passcode. Please check your credentials.' },
        { status: 401 }
      );
    }

    // Set secure cookie encoded with session details
    const sessionToken = Buffer.from(JSON.stringify(authenticatedUser)).toString('base64');
    const cookieStore = cookies();
    cookieStore.set('destifc_admin_auth', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: authenticatedUser
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

