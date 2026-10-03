'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Server, 
  Power, 
  RotateCcw, 
  Play, 
  Square, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Activity, 
  Terminal, 
  HardDrive, 
  Radio, 
  Cpu, 
  Clock, 
  Layers, 
  Key,
  Settings,
  Sparkles
} from 'lucide-react';

export default function HostingControlPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  // Settings State
  const [showConfig, setShowConfig] = useState(false);
  const [panelUrl, setPanelUrl] = useState('');
  const [serverId, setServerId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHostingStatus();
    const interval = setInterval(() => fetchHostingStatus(false), 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchHostingStatus = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch('/api/hosting', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.hosting) {
          setPanelUrl(json.hosting.panel_url || '');
          setServerId(json.hosting.server_id || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch hosting status:', err);
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      const res = await fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        setTimeout(fetchHostingStatus, 1500);
      } else {
        setNotification({ type: 'error', message: json.error || 'Action failed.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
      setTimeout(() => setNotification(null), 7000);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          panel_url: panelUrl,
          server_id: serverId,
          api_key: apiKey
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        setShowConfig(false);
        setApiKey('');
        fetchHostingStatus();
      } else {
        setNotification({ type: 'error', message: json.error });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSavingConfig(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const isOnline = data?.bot?.is_online;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex selection:bg-purple-500/30 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-glass)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" /> Bot Process & Hosting Controller
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-[var(--border-glass)]">
                Pterodactyl & Signal Manager
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Hosting & Bot Process Control
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-70 mt-1">
              Live power controls to start, stop, restart, and hot-reload your Discord bot process with real-time heartbeat monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--card-bg)] border border-purple-900/40 text-xs font-semibold text-[var(--text-main)] opacity-90 flex items-center gap-2 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4 text-fuchsia-400" />
              <span>Hosting API Keys</span>
            </button>
            <LiquidButton onClick={() => fetchHostingStatus(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </LiquidButton>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <p className="text-xs sm:text-sm font-bold">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-[var(--text-main)] opacity-50 hover:text-[var(--text-main)] text-xs">✕</button>
          </div>
        )}

        {/* Pterodactyl Config Modal / Section */}
        {showConfig && (
          <div className="p-6 rounded-3xl bg-[var(--card-bg)]/80 border border-fuchsia-500/40 mb-8 backdrop-blur-xl shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-[var(--text-main)]">Pterodactyl Panel API Integration (Optional)</h3>
              </div>
              <button onClick={() => setShowConfig(false)} className="text-[var(--text-main)] opacity-70 hover:text-[var(--text-main)] text-xs">✕</button>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70">
              Connect your Pterodactyl hosting panel API key to trigger hardware-level server power actions (Start, Stop, Kill, Restart) directly from this dashboard.
            </p>

            <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[var(--text-main)] opacity-70">Panel URL</label>
                <input
                  type="url"
                  placeholder="https://panel.xsystemshosting.com"
                  value={panelUrl}
                  onChange={(e) => setPanelUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[var(--text-main)] opacity-70">Server Identifier ID</label>
                <input
                  type="text"
                  placeholder="e.g. c1cc223f"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[var(--text-main)] opacity-70">Client API Key (ptlc_...)</label>
                <input
                  type="password"
                  placeholder={data?.hosting?.api_key_set ? '••••••••••••••••' : 'Enter Pterodactyl API Key'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500 font-mono"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-[var(--text-main)] font-bold text-xs shadow-md"
                >
                  {savingConfig ? 'Saving...' : 'Save Hosting Configuration'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Live Status Hero Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border mb-8 backdrop-blur-xl relative overflow-hidden ${
          isOnline
            ? 'bg-gradient-to-br from-emerald-950/40 via-neutral-900/60 to-purple-950/30 border-emerald-500/40 shadow-2xl shadow-emerald-950/20'
            : 'bg-gradient-to-br from-red-950/40 via-neutral-900/60 to-neutral-950 border-red-500/40 shadow-2xl shadow-red-950/20'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isOnline 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {isOnline ? 'Bot Online & Gateway Active' : 'Bot Offline / Process Down'}
                </span>
                <span className="text-xs text-[var(--text-main)] opacity-70 font-mono">
                  {data?.bot?.bot_user || 'DestiFC'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
                {isOnline ? 'Process Healthy & Synchronized' : 'Process Disconnected from Gateway'}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-90 max-w-2xl leading-relaxed">
                {isOnline ? (
                  <>Heartbeat pulse received <span className="font-bold text-emerald-400">{data?.bot?.seconds_since_ping}s ago</span>. Real-time Discord WebSocket latency is <span className="font-mono text-fuchsia-300 font-bold">{data?.bot?.latency_ms}ms</span> across <span className="font-bold text-[var(--text-main)]">{data?.bot?.guilds_count} Discord servers</span>.</>
                ) : (
                  <>No heartbeat pulse detected in the last {data?.bot?.seconds_since_ping ? `${data?.bot?.seconds_since_ping} seconds` : 'few minutes'}. Use the power controls below to restart or launch the bot.</>
                )}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => handleAction('restart')}
                disabled={actionLoading !== null}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-[var(--text-main)] font-black text-xs shadow-lg shadow-pink-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${actionLoading === 'restart' ? 'animate-spin' : ''}`} />
                <span>{actionLoading === 'restart' ? 'Restarting Bot...' : 'Restart Bot'}</span>
              </button>

              <button
                onClick={() => handleAction('reload_cogs')}
                disabled={actionLoading !== null || !isOnline}
                className="px-4 py-3 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg)] border border-fuchsia-500/40 text-fuchsia-300 hover:text-[var(--text-main)] font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40"
                title="Hot-reloads commands without taking bot offline"
              >
                <Zap className={`w-4 h-4 text-pink-400 ${actionLoading === 'reload_cogs' ? 'animate-bounce' : ''}`} />
                <span>{actionLoading === 'reload_cogs' ? 'Reloading Cogs...' : 'Hot-Reload Cogs'}</span>
              </button>

              {isOnline ? (
                <button
                  onClick={() => handleAction('stop')}
                  disabled={actionLoading !== null}
                  className="px-4 py-3 rounded-2xl bg-[var(--input-bg)] hover:bg-red-950/60 border border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Square className="w-4 h-4 text-red-400" />
                  <span>{actionLoading === 'stop' ? 'Stopping...' : 'Stop Bot'}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleAction('start')}
                  disabled={actionLoading !== null}
                  className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
                >
                  <Play className="w-4 h-4" />
                  <span>{actionLoading === 'start' ? 'Starting...' : 'Start Bot'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl">
            <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Discord Gateway Ping</span>
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[var(--text-main)]">{isOnline ? `${data?.bot?.latency_ms}` : '--'}</span>
              <span className="text-xs text-fuchsia-300 font-mono font-semibold">ms</span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1">{isOnline ? 'Real WebSocket Roundtrip' : 'Bot process currently down'}</p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl">
            <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Guilds Connected</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-[var(--border-glass)]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[var(--text-main)]">{isOnline ? data?.bot?.guilds_count : 0}</span>
              <span className="text-xs text-purple-300 font-semibold">Servers</span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1">Live Discord servers serving</p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl">
            <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Server Node Host</span>
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-mono font-bold text-[var(--text-main)] truncate max-w-[170px]">
                {data?.hosting?.node || 'eu4-node'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1">SFTP Port: {data?.hosting?.port || 2025}</p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl">
            <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Process PID & State</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-black text-[var(--text-main)]">{isOnline ? `PID ${data?.bot?.pid || 'Active'}` : 'OFFLINE'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1">Python 3.11 Runtime</p>
          </div>
        </div>

        {/* Secondary Control Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="p-6 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-pink-400">
              <Terminal className="w-4 h-4" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">Emergency Force Kill & Lock Flush</h3>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">
              If the bot process gets stuck in an infinite loop, or database locks are blocking transactions, use this button to instantly force-clear all pending queues and reset runtime memory.
            </p>
            <button
              onClick={() => handleAction('force_kill')}
              disabled={actionLoading !== null}
              className="px-4 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-red-950 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-bold transition-all"
            >
              {actionLoading === 'force_kill' ? 'Flushing Locks...' : 'Force Kill & Wipe Stuck Locks'}
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-fuchsia-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">Zero-Downtime Cog Reloader</h3>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">
              Updated match mechanics, economy prices, or card drop luck in python code? Hot-reload immediately refreshes all 14 cogs without dropping Discord voice or active matches.
            </p>
            <button
              onClick={() => handleAction('reload_cogs')}
              disabled={actionLoading !== null || !isOnline}
              className="px-4 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--card-bg)] text-fuchsia-300 hover:text-fuchsia-200 border border-fuchsia-500/30 text-xs font-bold transition-all disabled:opacity-40"
            >
              {actionLoading === 'reload_cogs' ? 'Reloading...' : 'Dispatch Live Cog Hot-Reload'}
            </button>
          </div>
        </div>

        {/* Process Signals & Events Log */}
        <div className="rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] overflow-hidden backdrop-blur-xl mb-8">
          <div className="p-4 sm:p-5 border-b border-[var(--border-glass)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-90">Recent Hosting Signals & Power Events</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-main)] opacity-90">
              <thead className="bg-[var(--input-bg)]/80 border-b border-[var(--border-glass)] text-[10px] uppercase font-bold tracking-wider text-[var(--text-main)] opacity-70">
                <tr>
                  <th className="py-3 px-4">Event Signal</th>
                  <th className="py-3 px-4">Execution Status</th>
                  <th className="py-3 px-4">Result Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 font-mono text-[11px]">
                {data?.recent_events?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[var(--text-main)] opacity-50 font-sans">
                      No recent hosting events logged.
                    </td>
                  </tr>
                ) : (
                  data?.recent_events?.map((evt) => (
                    <tr key={evt.id} className="hover:bg-[var(--card-bg)]/[0.02]">
                      <td className="py-3 px-4 text-pink-300 font-bold">{evt.job_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          evt.status === 'completed' 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : evt.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-main)] opacity-70 max-w-xs truncate">{evt.result || 'Pending dispatcher execution'}</td>
                      <td className="py-3 px-4 text-right text-[var(--text-main)] opacity-50 font-sans text-xs">
                        {evt.created_at ? new Date(evt.created_at).toLocaleTimeString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Bot Console & Terminal Logs */}
        <div className="rounded-3xl bg-[var(--input-bg)] border border-purple-900/40 overflow-hidden shadow-2xl shadow-purple-950/40">
          <div className="p-4 bg-[var(--card-bg)]/90 border-b border-[var(--border-glass)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono font-bold text-[var(--text-main)] opacity-90 ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
                Live Bot Terminal & Execution Stream
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--input-bg)] text-[var(--text-main)] opacity-70 border border-[var(--border-glass)]">
                Auto-Streaming
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 font-mono text-xs text-[var(--text-main)] opacity-90 space-y-2 max-h-80 overflow-y-auto bg-black/60">
            {data?.console_logs?.length === 0 ? (
              <p className="text-[var(--text-main)] opacity-50">Waiting for live bot stream data...</p>
            ) : (
              data?.console_logs?.map((log, idx) => {
                const isErr = log.includes('ERROR') || log.includes('offline');
                const isOk = log.includes('GATEWAY') || log.includes('STATUS') || log.includes('healthy');
                return (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[var(--text-main)] opacity-70 select-none">{idx + 1}</span>
                    <span className={isErr ? 'text-red-400' : isOk ? 'text-emerald-400' : 'text-[var(--text-main)] opacity-90'}>
                      {log}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
