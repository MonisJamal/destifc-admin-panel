'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Gamepad2, Save, CheckCircle, AlertCircle, RefreshCw, Swords, Target, Sparkles, Trophy } from 'lucide-react';

export default function ArcadeConfigPage() {
  const [config, setConfig] = useState({
    pack_battle_max_vouchers: 50,
    shootout_enabled: true,
    shootout_solo_reward_coins: 5000000,
    shootout_solo_reward_vouchers: 2,
    spin_cooldown_hours: 4,
    spin_jackpot_vouchers: 10,
    draft_battle_win_elo: 25,
    draft_battle_loss_elo: 15
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetch('/api/arcade-config')
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
      const res = await fetch('/api/arcade-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: '✅ Arcade & Minigames settings saved successfully!' });
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
      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-glass)]">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
          <Gamepad2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Arcade & Minigames Suite</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">Configure Pack Battles, Penalty Shootouts, Lucky Wheel & Draft Battles</p>
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
        {/* Pack Battles */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Swords className="w-4 h-4 text-pink-400" />
            Pack Battles (/pack_battle)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Max Voucher Wager Limit
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={config.pack_battle_max_vouchers || 50}
                onChange={e => setConfig({ ...config, pack_battle_max_vouchers: parseInt(e.target.value) || 50 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Highest amount of vouchers players can wager per battle (default: 50).</p>
            </div>
          </div>
        </div>

        {/* Penalty Shootout */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Penalty Shootout (/shootout)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Solo Win Reward (Coins)
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={config.shootout_solo_reward_coins || 5000000}
                onChange={e => setConfig({ ...config, shootout_solo_reward_coins: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Solo Win Reward (Vouchers)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.shootout_solo_reward_vouchers || 2}
                onChange={e => setConfig({ ...config, shootout_solo_reward_vouchers: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Lucky Wheel */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Lucky Wheel (/spin)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Cooldown (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={config.spin_cooldown_hours || 4}
                onChange={e => setConfig({ ...config, spin_cooldown_hours: parseInt(e.target.value) || 4 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Jackpot Vouchers Slice
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={config.spin_jackpot_vouchers || 10}
                onChange={e => setConfig({ ...config, spin_jackpot_vouchers: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Draft Battle ELO */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            Draft Battle Rankings (/draftbattle)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Win ELO Gain
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={config.draft_battle_win_elo || 25}
                onChange={e => setConfig({ ...config, draft_battle_win_elo: parseInt(e.target.value) || 25 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Loss ELO Deduction
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.draft_battle_loss_elo || 15}
                onChange={e => setConfig({ ...config, draft_battle_loss_elo: parseInt(e.target.value) || 15 })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Arcade Configuration
          </button>
        </div>
      </form>
        </div>
      </main>
    </div>
  );
}
