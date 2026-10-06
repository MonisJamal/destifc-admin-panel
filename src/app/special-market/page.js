'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { Crown, Zap, Clock, Coins, Plus, Trash2, Save, AlertCircle, CheckCircle2, Shield, Radio, Sparkles, RefreshCw, Gift } from 'lucide-react';

export default function SpecialMarketAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isActive, setIsActive] = useState(false);
  const [closesAt, setClosesAt] = useState(null);
  const [title, setTitle] = useState('👑 OWNER VIP SPECIAL MARKET 👑');
  const [channels, setChannels] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [pingType, setPingType] = useState('none');

  // Custom deals list
  const [rewards, setRewards] = useState([
    {
      id: "vip_1",
      title: "100x Mega Voucher Treasury",
      description: "100 Draft Vouchers + VIP Pass",
      cost_coins: 1000000000,
      vouchers: 100,
      player_data: null
    },
    {
      id: "vip_2",
      title: "250x Imperial Voucher Hoard",
      description: "250 Draft Vouchers",
      cost_coins: 2500000000,
      vouchers: 250,
      player_data: null
    }
  ]);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/special-market');
      const data = await res.json();
      if (data.success && data.data) {
        setIsActive(Boolean(data.data.is_active));
        setClosesAt(data.data.closes_at);
        setTitle(data.data.title || '👑 OWNER VIP SPECIAL MARKET 👑');
        setChannels(data.data.channels || []);
        setRoleId(data.data.role_id || '');
        setPingType(data.data.ping_type || 'none');
        if (data.data.custom_rewards && data.data.custom_rewards.length > 0) {
          setRewards(data.data.custom_rewards);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNow = async () => {
    if (!confirm('Open the VIP Special Market right now for 1 hour? The announcement and deal controls will be broadcasted to your target channels in Discord!')) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/special-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_now',
          title,
          custom_rewards: rewards,
          channels,
          role_id: roleId,
          ping_type: pingType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsActive(true);
        setMessage({ type: 'success', text: '👑 The VIP Special Market is NOW LIVE for 1 hour in Discord!' });
        fetchMarketData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to open Special Market' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNow = async () => {
    if (!confirm('Close the VIP Special Market immediately?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/special-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close_now' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsActive(false);
        setMessage({ type: 'success', text: 'VIP Special Market has been closed manually.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to close' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/special-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          title,
          custom_rewards: rewards,
          channels,
          role_id: roleId,
          ping_type: pingType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'VIP Special Market configuration saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addReward = () => {
    const newId = `vip_${Date.now()}`;
    setRewards([
      ...rewards,
      {
        id: newId,
        title: "Exclusive Mystery Reward",
        description: "50 Vouchers or Special Perk",
        cost_coins: 500000000,
        vouchers: 50,
        player_data: null
      }
    ]);
  };

  const removeReward = (idx) => {
    const updated = [...rewards];
    updated.splice(idx, 1);
    setRewards(updated);
  };

  const updateReward = (idx, field, val) => {
    const updated = [...rewards];
    updated[idx] = { ...updated[idx], [field]: val };
    setRewards(updated);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-8 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-72 ml-0 p-3 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl w-full space-y-6 sm:space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-black flex items-center justify-center text-amber-300 shadow-lg shadow-amber-900/30 flex-shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-300 flex flex-wrap items-center gap-2">
                VIP Special Market
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OWNER-ONLY • MANUAL
                </span>
              </h1>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70">
              Exclusive high-roller bazaar that <strong>never opens randomly</strong>. Only you can summon this market and define custom prices & rewards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {isActive ? (
              <button
                type="button"
                onClick={handleCloseNow}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Close Market Now
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerNow}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-black text-xs font-black shadow-lg shadow-amber-500/25 hover:opacity-90 flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Summon VIP Market (1 Hr)
              </button>
            )}

            <LiquidButton onClick={handleSaveSettings} disabled={saving} loading={saving} className="flex-1 sm:flex-initial justify-center">
              <Save className="w-4 h-4" />
              Save Deals
            </LiquidButton>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border ${
            message.type === 'success' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />}
            <span className="break-words">{message.text}</span>
          </div>
        )}

        {/* Status Card */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-black to-yellow-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                Live Status: <span className={isActive ? 'text-emerald-400 font-black' : 'text-neutral-400 font-bold'}>{isActive ? 'LIVE IN DISCORD (/specialmarket UNLOCKED)' : 'CLOSED (AWAITING YOUR MANUAL SUMMON)'}</span>
              </h2>
            </div>
            {closesAt && isActive && (
              <div className="text-xs text-amber-300 font-mono bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                Closes: {new Date(closesAt).toLocaleTimeString()}
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--text-main)] opacity-70">
            🔒 <strong>Strict Protection:</strong> This market has <strong>NO automated daily random scheduler</strong>. It will strictly open only when you trigger it here or run <code>/admin_special_market_open</code>.
          </p>
        </div>

        {/* Custom Title & Target Channels */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              Event Announcement & Target Channels
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Same channels & ping support</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Market Event Banner Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Broadcast Discord Channel IDs (Comma or Space Separated)
              </label>
              <textarea
                rows={2}
                placeholder="Leave blank to use standard Black Market channels, or specify custom IDs"
                value={Array.isArray(channels) ? channels.join(', ') : (channels || '')}
                onChange={e => {
                  const arr = e.target.value.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
                  setChannels(arr);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Ping Target Type
              </label>
              <select
                value={pingType}
                onChange={e => setPingType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="none">🔕 No Ping (Clean Embed Only)</option>
                <option value="everyone">🔔 Ping @everyone</option>
                <option value="here">📍 Ping @here (Online Members)</option>
                <option value="role">👥 Ping Specific Role</option>
              </select>
            </div>

            {pingType === 'role' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Discord Role ID to Ping
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1557010712013045860"
                  value={roleId}
                  onChange={e => setRoleId(e.target.value.trim())}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Custom Deals & Prices Config */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-glass)] gap-3">
            <div>
              <h2 className="text-base font-bold text-yellow-300 flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                Custom Rewards & Price Setter
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Configure exact coin prices and voucher quantities for each special deal</p>
            </div>
            <button
              type="button"
              onClick={addReward}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add VIP Deal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewards.map((r, i) => (
              <div key={r.id || i} className="p-4 rounded-2xl bg-[var(--input-bg)] border border-amber-500/20 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">VIP Slot #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeReward(i)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Title</label>
                  <input
                    type="text"
                    value={r.title}
                    onChange={e => updateReward(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Subtitle / Description</label>
                  <input
                    type="text"
                    value={r.description || ''}
                    onChange={e => updateReward(i, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Draft Vouchers</label>
                    <input
                      type="number"
                      value={r.vouchers || 0}
                      onChange={e => updateReward(i, 'vouchers', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Price (Coins)</label>
                    <input
                      type="number"
                      step="10000000"
                      value={r.cost_coins || 0}
                      onChange={e => updateReward(i, 'cost_coins', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
