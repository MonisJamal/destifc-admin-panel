'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { ShoppingBag, Zap, Clock, Coins, Tag, Save, AlertCircle, CheckCircle2, Shield, Radio, Sparkles, RefreshCw, Eye } from 'lucide-react';

export default function BlackMarketAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isActive, setIsActive] = useState(false);
  const [opensAt, setOpensAt] = useState(null);
  const [closesAt, setClosesAt] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [pingType, setPingType] = useState('none');
  const [schedule, setSchedule] = useState(null);

  // Voucher packages (50% off)
  const [voucherPackages, setVoucherPackages] = useState([
    { id: "v1", title: "10x Draft Vouchers Pack", vouchers: 10, original_price: 200000000, discount_price: 100000000, discount_pct: 50 },
    { id: "v2", title: "25x Draft Vouchers Bundle", vouchers: 25, original_price: 500000000, discount_price: 250000000, discount_pct: 50 },
    { id: "v3", title: "50x Mega Voucher Hoard", vouchers: 50, original_price: 1000000000, discount_price: 500000000, discount_pct: 50 }
  ]);

  // 5 Player Deals (30%+ discounts)
  const [playerDeals, setPlayerDeals] = useState([]);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/black-market');
      const data = await res.json();
      if (data.success && data.data) {
        setIsActive(Boolean(data.data.is_active));
        setOpensAt(data.data.opens_at);
        setClosesAt(data.data.closes_at);
        setChannels(data.data.channels || []);
        setRoleId(data.data.role_id || '');
        setPingType(data.data.ping_type || 'none');
        setSchedule(data.data.schedule || null);
        if (data.data.voucher_packages && data.data.voucher_packages.length > 0) {
          setVoucherPackages(data.data.voucher_packages);
        }
        if (data.data.player_deals) {
          setPlayerDeals(data.data.player_deals);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNow = async () => {
    if (!confirm('Open the Secret Black Market right now for 1 hour? The announcement and deal controls will be broadcasted to your configured channels!')) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/black-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_now',
          voucher_packages: voucherPackages,
          player_deals: playerDeals,
          channels,
          role_id: roleId,
          ping_type: pingType
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setIsActive(true);
        setMessage({ type: 'success', text: '🔥 The Black Market is NOW LIVE for 1 hour in Discord across all target channels!' });
        fetchMarketData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to open Black Market' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNow = async () => {
    if (!confirm('Close the Black Market immediately?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/black-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close_now' })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setIsActive(false);
        setMessage({ type: 'success', text: 'Black Market has been closed.' });
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
      const res = await fetch('/api/black-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          voucher_packages: voucherPackages,
          player_deals: playerDeals,
          channels,
          role_id: roleId,
          ping_type: pingType
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Black Market deals, target channels, and role ping settings saved!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRerollSchedule = async () => {
    if (!confirm("Reroll today's random spawn time now? The bot will pick a new random time.")) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/black-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reroll_schedule' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSchedule(data.schedule);
        setMessage({ type: 'success', text: `🎲 ${data.message}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reroll schedule' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const updateVoucherDeal = (idx, field, val) => {
    const list = [...voucherPackages];
    list[idx] = { ...list[idx], [field]: val };
    setVoucherPackages(list);
  };

  const updatePlayerDeal = (idx, field, val) => {
    const list = [...playerDeals];
    list[idx] = { ...list[idx], [field]: val };
    setPlayerDeals(list);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-8 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-black flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/30 flex-shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-purple-300 flex flex-wrap items-center gap-2">
                Secret Black Market
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  1-HR FLASH EVENT
                </span>
              </h1>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70">
              The secret contraband bazaar that surfaces at 1 random time each day for 1 hour with half-priced vouchers and discounted 120+ superstars.
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
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white text-xs font-black shadow-lg shadow-purple-500/25 hover:opacity-90 flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Trigger 1-Hr Opening
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
            message.type === 'success' ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-purple-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />}
            <span className="break-words">{message.text}</span>
          </div>
        )}

        {/* Status Card */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                Live Status: <span className={isActive ? 'text-emerald-400 font-black' : 'text-neutral-400 font-bold'}>{isActive ? 'OPEN RIGHT NOW IN DISCORD' : 'CLOSED (WAITING FOR DAILY RANDOM DROP)'}</span>
              </h2>
            </div>
            {closesAt && isActive && (
              <div className="text-xs text-purple-300 font-mono bg-purple-900/40 px-3 py-1.5 rounded-xl border border-purple-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                Closes: {new Date(closesAt).toLocaleTimeString()}
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--text-main)] opacity-70">
            When triggered, the bot automatically broadcasts the contraband menu and unlocks the <code>/blackmarket</code> interactive command.
          </p>
        </div>

        {/* 🕵️ Confidential Daily Spawn Radar (Admin/Owner Only) */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-black to-purple-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                Confidential Smuggler Schedule Radar (Owner-Only)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRerollSchedule}
                disabled={saving}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                Reroll Today's Drop Time
              </button>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                TOP SECRET
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Scheduled Date (UTC)</span>
              <p className="text-sm font-mono font-bold text-white">
                {schedule?.date || 'Today'}
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-1">
              <span className="text-[11px] text-amber-400/80 font-medium">Random Drop Time</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-base sm:text-lg font-mono font-black text-amber-300">
                  {schedule?.target_hour !== undefined
                    ? `${String(schedule.target_hour).padStart(2, '0')}:${String(schedule.target_min || 0).padStart(2, '0')} UTC`
                    : 'Selecting random time...'}
                </p>
                {schedule?.target_hour !== undefined && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ({new Date(Date.UTC(
                      new Date().getUTCFullYear(),
                      new Date().getUTCMonth(),
                      new Date().getUTCDate(),
                      schedule.target_hour,
                      schedule.target_min || 0
                    )).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} local)
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Execution Status</span>
              <p className="text-sm font-semibold flex items-center gap-2">
                {schedule?.executed ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Market Concluded Today
                  </span>
                ) : (
                  <span className="text-yellow-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin flex-shrink-0" /> Pending Auto-Drop
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            🔒 <strong>Automatic Cycle:</strong> When a 1-hour session closes, the bot automatically schedules the NEXT drop time. Use "Reroll Today's Drop Time" above if you want to manually regenerate a new upcoming time.
          </p>
        </div>

        {/* Multi-Channel & Role Ping Settings */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <h2 className="text-base font-bold text-purple-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              Multi-Server Channels & Role Notification Ping
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Independent from Drops config</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Broadcast Discord Channel IDs (Comma or Space Separated)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 112233445566778899, 998877665544332211"
                value={Array.isArray(channels) ? channels.join(', ') : (channels || '')}
                onChange={e => {
                  const arr = e.target.value.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
                  setChannels(arr);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-purple-400 font-mono"
              />
              <p className="text-[10px] text-[var(--text-muted)]">
                Add multiple channel IDs across multiple servers so the Black Market broadcasts to all of them at once!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Ping Target Type
              </label>
              <select
                value={pingType}
                onChange={e => setPingType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-purple-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-purple-400 font-semibold"
              >
                <option value="none">🔕 No Ping (Clean Embed Only)</option>
                <option value="everyone">🔔 Ping @everyone</option>
                <option value="here">📍 Ping @here (Online Members)</option>
                <option value="role">👥 Ping Specific Role</option>
              </select>
              <p className="text-[10px] text-[var(--text-muted)]">Choose how users are alerted when the Black Market opens.</p>
            </div>

            {pingType === 'role' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Discord Role ID to Ping
                </label>
                <input
                  type="text"
                  placeholder="e.g. 987654321098765432"
                  value={roleId}
                  onChange={e => setRoleId(e.target.value.trim())}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-purple-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-purple-400 font-mono"
                />
                <p className="text-[10px] text-[var(--text-muted)]">Right-click the role in Server Settings -&gt; Roles and copy ID.</p>
              </div>
            )}
          </div>
        </div>

        {/* 1. Voucher Deals (50% Half Price) */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <h2 className="text-base font-bold text-fuchsia-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-fuchsia-400" />
              🎟️ 50% Half-Price Voucher Packages
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Fixed 50% discount</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {voucherPackages.map((vp, i) => (
              <div key={vp.id} className="p-4 rounded-2xl bg-[var(--input-bg)] border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-fuchsia-300">Package #{i + 1}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    50% OFF
                  </span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Title</label>
                  <input
                    type="text"
                    value={vp.title}
                    onChange={e => updateVoucherDeal(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-fuchsia-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Vouchers</label>
                    <input
                      type="number"
                      value={vp.vouchers}
                      onChange={e => updateVoucherDeal(i, 'vouchers', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Half Price (Coins)</label>
                    <input
                      type="number"
                      step="5000000"
                      value={vp.discount_price}
                      onChange={e => updateVoucherDeal(i, 'discount_price', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-emerald-300 font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Automated 120+ Superstar Deals Banner */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ⭐ 5 Automated Superstar Deals (Guaranteed ≥3 Rating 122+)
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">100% Automated by Bot</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--text-main)] space-y-2">
            <p className="font-semibold text-amber-300">
              ⚡ Player deals in the Black Market are now fully automated and do not require manual input.
            </p>
            <p className="opacity-80">
              Whenever the Black Market triggers (either automatically or manually via the button above), the bot pulls 5 random high-tier cards directly from the database with 30%–45% discounts. <strong>At least 3 of the 5 cards are guaranteed to be 122+ OVR superstars.</strong>
            </p>
            <p className="text-[11px] opacity-60">
              (To configure custom players or manual rewards for your exclusive market, use the <strong>VIP Special Market</strong> tab in the sidebar).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
