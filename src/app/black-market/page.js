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

  // Voucher packages (50% off)
  const [voucherPackages, setVoucherPackages] = useState([
    { id: "v1", title: "5x Draft Vouchers Pack", vouchers: 5, original_price: 50000000, discount_price: 25000000, discount_pct: 50 },
    { id: "v2", title: "15x Draft Vouchers Pack", vouchers: 15, original_price: 140000000, discount_price: 70000000, discount_pct: 50 },
    { id: "v3", title: "30x Mega Voucher Hoard", vouchers: 30, original_price: 270000000, discount_price: 135000000, discount_pct: 50 }
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
    if (!confirm('Open the Secret Black Market right now for 1 hour? A server-wide @everyone notification will be sent to all Discord members!')) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/black-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_now',
          voucher_packages: voucherPackages,
          player_deals: playerDeals
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setIsActive(true);
        setMessage({ type: 'success', text: '🔥 The Black Market is NOW LIVE for 1 hour in Discord and users have been notified!' });
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
          player_deals: playerDeals
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Black Market deals and packages saved!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
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
        <main className="flex-1 lg:ml-72 ml-0 p-8 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-glass)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-black flex items-center justify-center text-purple-300 shadow-lg shadow-purple-900/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-purple-300 flex items-center gap-2">
                Secret Black Market
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  1-HR FLASH EVENT
                </span>
              </h1>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70">
              The secret contraband bazaar that surfaces at 1 random time each day for 1 hour with half-priced vouchers and discounted 120+ superstars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isActive ? (
              <button
                type="button"
                onClick={handleCloseNow}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Close Market Now
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerNow}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white text-xs font-black shadow-lg shadow-purple-500/25 hover:opacity-90 flex items-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Trigger 1-Hr Opening Now
              </button>
            )}

            <LiquidButton onClick={handleSaveSettings} disabled={saving} loading={saving}>
              <Save className="w-4 h-4" />
              Save Deals
            </LiquidButton>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
            message.type === 'success' ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-purple-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />}
            {message.text}
          </div>
        )}

        {/* Status Card */}
        <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
              <h2 className="text-base font-bold text-[var(--text-main)]">
                Live Black Market Status: <span className={isActive ? 'text-emerald-400 font-black' : 'text-neutral-400 font-bold'}>{isActive ? 'OPEN RIGHT NOW IN DISCORD' : 'CLOSED (WAITING FOR DAILY RANDOM DROP)'}</span>
              </h2>
            </div>
            {closesAt && isActive && (
              <div className="text-xs text-purple-300 font-mono bg-purple-900/40 px-3 py-1.5 rounded-xl border border-purple-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Closes: {new Date(closesAt).toLocaleTimeString()}
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--text-main)] opacity-70">
            When triggered, the bot automatically sends an <code>@everyone</code> notification to the server, and the <code>/blackmarket</code> command unlocks with purchase dropdown menus.
          </p>
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

        {/* 2. 5 Random 120+ Player Deals (30%+ discount) */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ⭐ 5 Random 120+ Superstar Deals (30%+ Variable Discount)
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Auto-refreshed each 1-hr session</span>
          </div>

          <p className="text-xs text-[var(--text-main)] opacity-70">
            During each live session, the bot automatically selects 5 random 120+ icons and superstars and applies custom 30%–45% price discounts. You can also view or tweak them below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {playerDeals.length > 0 ? (
              playerDeals.map((pd, i) => (
                <div key={pd.id || i} className="p-4 rounded-2xl bg-[var(--input-bg)] border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">Slot #{i + 1} ({pd.ovr} OVR)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      -{pd.discount_pct}% OFF
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Player Name</label>
                    <input
                      type="text"
                      value={pd.name}
                      onChange={e => updatePlayerDeal(i, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Discount %</label>
                      <input
                        type="number"
                        min="20"
                        max="70"
                        value={pd.discount_pct}
                        onChange={e => updatePlayerDeal(i, 'discount_pct', parseInt(e.target.value) || 30)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Sale Price (Coins)</label>
                      <input
                        type="number"
                        step="50000000"
                        value={pd.discount_price}
                        onChange={e => updatePlayerDeal(i, 'discount_price', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-glass)] rounded-2xl">
                Player deals are dynamically generated each 1-hour session. Click "Trigger 1-Hr Opening Now" to generate active deals!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
