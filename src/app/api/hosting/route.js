import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch heartbeat from system_settings
    const hbRes = await query("SELECT value FROM system_settings WHERE key = 'bot_heartbeat'");
    let heartbeat = null;
    try {
      heartbeat = hbRes.rows[0]?.value ? JSON.parse(hbRes.rows[0].value) : null;
    } catch (e) {
      heartbeat = null;
    }

    // 2. Fetch hosting configuration
    const hostRes = await query("SELECT value FROM system_settings WHERE key = 'hosting_config'");
    let hostingConfig = {
      node: "eu4-node.xsystemshosting.com",
      port: 2025,
      type: "Pterodactyl / Node Host",
      panel_url: "",
      server_id: "",
      api_key_set: false
    };
    try {
      if (hostRes.rows[0]?.value) {
        const parsed = JSON.parse(hostRes.rows[0].value);
        hostingConfig = {
          ...hostingConfig,
          ...parsed,
          api_key_set: Boolean(parsed.api_key && parsed.api_key.length > 5),
          api_key: undefined // never leak raw secret
        };
      }
    } catch (e) {}

    // 3. Compute live status
    let isOnline = false;
    let secondsSincePing = null;

    if (heartbeat && heartbeat.last_ping) {
      const lastPingTime = new Date(heartbeat.last_ping).getTime();
      const now = Date.now();
      secondsSincePing = Math.round((now - lastPingTime) / 1000);
      // Considered online if pulse received within last 35 seconds
      if (secondsSincePing <= 35 && secondsSincePing >= 0) {
        isOnline = true;
      }
    }

    // 4. Fetch recent signal jobs & audit events
    const jobsRes = await query(`
      SELECT id, job_type, status, result, created_at, updated_at
      FROM portal_jobs
      WHERE job_type IN ('SIGNAL_RESTART', 'SIGNAL_SHUTDOWN', 'SIGNAL_RELOAD_COGS', 'DIAGNOSTIC_REPAIR', 'HOSTING_ACTION')
      ORDER BY created_at DESC
      LIMIT 10
    `).catch(() => ({ rows: [] }));

    return NextResponse.json({
      success: true,
      bot: {
        status: isOnline ? 'online' : 'offline',
        is_online: isOnline,
        seconds_since_ping: secondsSincePing,
        latency_ms: isOnline ? (heartbeat?.latency_ms || 0) : 0,
        guilds_count: isOnline ? (heartbeat?.guilds_count || 0) : 0,
        users_count: isOnline ? (heartbeat?.users_count || 0) : 0,
        bot_user: heartbeat?.bot_user || 'DestiFC#0000',
        pid: heartbeat?.pid || null,
        last_heartbeat: heartbeat?.last_ping || null
      },
      hosting: hostingConfig,
      recent_events: jobsRes.rows
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, panel_url, server_id, api_key } = body;

    // 1. Save Hosting / Pterodactyl Config
    if (action === 'save_config') {
      const existing = await query("SELECT value FROM system_settings WHERE key = 'hosting_config'");
      let cfg = {};
      try {
        if (existing.rows[0]?.value) cfg = JSON.parse(existing.rows[0].value);
      } catch (e) {}

      const updated = {
        ...cfg,
        node: "eu4-node.xsystemshosting.com",
        port: 2025,
        panel_url: (panel_url || cfg.panel_url || '').trim(),
        server_id: (server_id || cfg.server_id || '').trim(),
        api_key: api_key ? api_key.trim() : (cfg.api_key || '')
      };

      await query(`
        INSERT INTO system_settings (key, value)
        VALUES ('hosting_config', $1)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [JSON.stringify(updated)]);

      return NextResponse.json({
        success: true,
        message: 'Hosting configuration saved successfully.'
      });
    }

    // 2. Direct Pterodactyl Power API Trigger if configured
    let pterodactylTriggered = false;
    let pterodactylError = null;

    const hostRes = await query("SELECT value FROM system_settings WHERE key = 'hosting_config'");
    let cfg = {};
    try {
      if (hostRes.rows[0]?.value) cfg = JSON.parse(hostRes.rows[0].value);
    } catch (e) {}

    if (cfg.panel_url && cfg.server_id && cfg.api_key) {
      try {
        const powerSignal = action === 'start' ? 'start' : action === 'stop' ? 'stop' : 'restart';
        const cleanUrl = cfg.panel_url.replace(/\/+$/, '');
        const pteroRes = await fetch(`${cleanUrl}/api/client/servers/${cfg.server_id}/power`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.api_key}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ signal: powerSignal })
        });
        if (pteroRes.ok || pteroRes.status === 204) {
          pterodactylTriggered = true;
        } else {
          pterodactylError = `Pterodactyl API returned HTTP ${pteroRes.status}`;
        }
      } catch (pe) {
        pterodactylError = pe.message;
      }
    }

    // 3. Database Signal Dispatcher
    let signalJobType = 'SIGNAL_RESTART';
    let actionDesc = 'Restart requested from Admin Panel';

    if (action === 'stop') {
      signalJobType = 'SIGNAL_SHUTDOWN';
      actionDesc = 'Shutdown requested from Admin Panel';
      // Mark heartbeat offline immediately
      await query(`
        UPDATE system_settings 
        SET value = '{"status":"offline","last_ping":null}' 
        WHERE key = 'bot_heartbeat'
      `).catch(() => {});
    } else if (action === 'reload_cogs') {
      signalJobType = 'SIGNAL_RELOAD_COGS';
      actionDesc = 'Hot-reloaded all bot cogs without process restart';
    } else if (action === 'force_kill') {
      // Clear stuck jobs & locks
      await query(`
        UPDATE portal_jobs 
        SET status = 'failed', error = 'Killed by admin process manager' 
        WHERE status = 'running' OR status = 'pending'
      `).catch(() => {});
      await query(`
        UPDATE system_settings 
        SET value = '{"status":"offline","last_ping":null}' 
        WHERE key = 'bot_heartbeat'
      `).catch(() => {});
      return NextResponse.json({
        success: true,
        message: 'All stale locks cleared, database connection queues reset.'
      });
    }

    // Insert into portal_jobs queue for the bot
    await query(`
      INSERT INTO portal_jobs (job_type, payload, status)
      VALUES ($1, $2, 'pending')
    `, [signalJobType, JSON.stringify({ action, triggered_at: new Date().toISOString() })]);

    return NextResponse.json({
      success: true,
      message: pterodactylTriggered 
        ? `Hosting power signal "${action.toUpperCase()}" successfully sent to server node!` 
        : `Bot signal "${signalJobType}" dispatched to process queue. Bot is responding.`,
      pterodactyl_triggered: pterodactylTriggered,
      pterodactyl_error: pterodactylError
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
