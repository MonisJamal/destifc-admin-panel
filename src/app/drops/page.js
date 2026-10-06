'use client';
import { useState, useEffect } from 'react';
import { Gift, Save, CheckCircle, AlertCircle, RefreshCw, Send, Radio } from 'lucide-react';

export default function DropsConfigPage() {
  const [config, setConfig] = useState({
    enabled: true,
    channel_id: '',
    interval_mins: 60,
    vouchers_per_drop: 3,
    coins_per_drop: 5000000,
    max_claims: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetch('/api/drops-config')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setConfig(prev => ({ ...prev, ...d.data }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/drops-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: '✅ Loot Drops configuration saved and synced with bot!' });
      } else {
        setStatusMsg({ type: 'error', text: `❌ Error: ${data.error}` });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: `❌ Failed to save: ${err.message}` });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Loot Drops & Voucher Rains</h1>
              <p className="text-xs text-[var(--text-muted)] font-medium">Automatic periodic supply crates & voucher rains in your Discord channels</p>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-semibold">{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Status Toggle */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)]">Active Loot Drops Status</h2>
              <p className="text-xs text-[var(--text-muted)]">Toggle automatic periodic supply crate drops in Discord</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>

        {/* Drop Settings */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-6">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Radio className="w-4 h-4 text-pink-400" />
            Target Channels & Frequency (Multi-Server Support)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Discord Channel IDs (Comma or Space Separated)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 123456789012345678, 987654321098765432"
                value={Array.isArray(config.channels) ? config.channels.join(', ') : (config.channels || config.channel_id || '')}
                onChange={e => {
                  const val = e.target.value;
                  const arr = val.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
                  setConfig({ ...config, channels: arr, channel_id: arr[0] || '' });
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Add multiple channel IDs to broadcast loot drops simultaneously across multiple Discord servers!</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Drop Interval (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={config.interval_mins || 60}
                onChange={e => setConfig({ ...config, interval_mins: parseInt(e.target.value) || 60 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
              <p className="text-[10px] text-[var(--text-muted)]">How often the bot drops a standard supply crate (e.g. 30 or 60 mins).</p>
            </div>
          </div>
        </div>

        {/* Reward Settings */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-6">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            Crate Rewards & Claimers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Draft Vouchers per Claim
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.vouchers_per_drop ?? 3}
                onChange={e => setConfig({ ...config, vouchers_per_drop: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Bonus Coins per Claim
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={config.coins_per_drop ?? 5000000}
                onChange={e => setConfig({ ...config, coins_per_drop: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Max Fast Claimers
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.max_claims ?? 3}
                onChange={e => setConfig({ ...config, max_claims: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
              <p className="text-[10px] text-[var(--text-muted)]">First X players to click button get the loot.</p>
            </div>
          </div>
        </div>

        {/* Rare Gift Drops (2x Daily at Random Times) */}
        <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <div>
              <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <span>🌟</span>
                Daily Rare Gift Drops (2 Random Times Daily)
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                A massive jackpot gift crate dropped at 2 completely random times per day. Notifies @everyone.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, ping_everyone: !config.ping_everyone })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  config.ping_everyone
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/10'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
                title="Toggle @everyone notification ping when rare drop lands"
              >
                {config.ping_everyone ? '🔔 PING @everyone ON' : '🔕 PING @everyone OFF'}
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, rare_drop_enabled: !config.rare_drop_enabled })}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  config.rare_drop_enabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {config.rare_drop_enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-[var(--border-glass)]">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Ping Target Type
              </label>
              <select
                value={config.rare_drop_ping_type || (config.ping_everyone ? 'everyone' : 'none')}
                onChange={e => {
                  const val = e.target.value;
                  setConfig({ ...config, rare_drop_ping_type: val, ping_everyone: val === 'everyone' });
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="none">🔕 No Ping (Clean Embed Only)</option>
                <option value="everyone">🔔 Ping @everyone</option>
                <option value="here">📍 Ping @here (Online Members)</option>
                <option value="role">👥 Ping Specific Role</option>
              </select>
              <p className="text-[10px] text-[var(--text-muted)]">Select who gets pinged when the 2x daily rare gift drops.</p>
            </div>

            {config.rare_drop_ping_type === 'role' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Discord Role ID to Ping
                </label>
                <input
                  type="text"
                  placeholder="e.g. 112233445566778899"
                  value={config.rare_drop_role_id || ''}
                  onChange={e => setConfig({ ...config, rare_drop_role_id: e.target.value.trim() })}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[10px] text-[var(--text-muted)]">Right-click the role in Server Settings -&gt; Roles and copy ID.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Rare Gift Vouchers
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={config.rare_drop_vouchers ?? 25}
                onChange={e => setConfig({ ...config, rare_drop_vouchers: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Draft vouchers inside each Rare Gift crate.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Rare Gift Coins
              </label>
              <input
                type="number"
                min="0"
                step="5000000"
                value={config.rare_drop_coins ?? 150000000}
                onChange={e => setConfig({ ...config, rare_drop_coins: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Bonus coins inside each Rare Gift crate.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Rare Gift Claimers
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.rare_drop_max_claims ?? 5}
                onChange={e => setConfig({ ...config, rare_drop_max_claims: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Number of players who can grab the rare loot.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Drops Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
