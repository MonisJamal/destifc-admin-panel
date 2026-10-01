import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query(`
      SELECT id, username, password, display_name, role, permissions, created_at, updated_at
      FROM admin_users
      ORDER BY id ASC
    `);

    const users = res.rows.map(u => {
      let perms = [];
      try {
        perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || []);
      } catch (e) {
        perms = ['all'];
      }
      return {
        id: u.id,
        username: u.username,
        display_name: u.display_name || u.username,
        role: u.role || 'moderator',
        permissions: perms,
        created_at: u.created_at,
        updated_at: u.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, username, password, display_name, role, permissions } = body;

    const cleanUsername = (username || '').trim().toLowerCase();
    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: 'Username is required.' }, { status: 400 });
    }

    const cleanRole = role || 'moderator';
    const cleanPerms = JSON.stringify(Array.isArray(permissions) ? permissions : ['dashboard']);

    if (id) {
      // Update existing user
      if (password && password.trim()) {
        await query(`
          UPDATE admin_users 
          SET username = $1, password = $2, display_name = $3, role = $4, permissions = $5::jsonb, updated_at = NOW()
          WHERE id = $6
        `, [cleanUsername, password.trim(), display_name || cleanUsername, cleanRole, cleanPerms, id]);
      } else {
        await query(`
          UPDATE admin_users 
          SET username = $1, display_name = $2, role = $3, permissions = $4::jsonb, updated_at = NOW()
          WHERE id = $5
        `, [cleanUsername, display_name || cleanUsername, cleanRole, cleanPerms, id]);
      }

      return NextResponse.json({
        success: true,
        message: `Admin user "${cleanUsername}" updated successfully.`
      });
    } else {
      // Create new user
      if (!password || !password.trim()) {
        return NextResponse.json({ success: false, error: 'Password is required for new users.' }, { status: 400 });
      }

      await query(`
        INSERT INTO admin_users (username, password, display_name, role, permissions)
        VALUES ($1, $2, $3, $4, $5::jsonb)
      `, [cleanUsername, password.trim(), display_name || cleanUsername, cleanRole, cleanPerms]);

      return NextResponse.json({
        success: true,
        message: `New admin user "${cleanUsername}" created with custom access permissions.`
      });
    }
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return NextResponse.json({ success: false, error: 'A user with this username already exists.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const userRes = await query('SELECT username FROM admin_users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const user = userRes.rows[0];
    if (user.username === 'desti' || user.username === 'admin') {
      return NextResponse.json({ success: false, error: 'Root superadmin accounts cannot be deleted.' }, { status: 400 });
    }

    await query('DELETE FROM admin_users WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: `User "${user.username}" deleted successfully.`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
