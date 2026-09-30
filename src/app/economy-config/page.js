'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Coins, 
  Ticket, 
  Briefcase, 
  Calendar, 
  Percent, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

function formatShortPrice(val) {
  const num = Number(val) || 0;
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '').replace(/(\.[0-9])0$/, '$1') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export default function EconomyConfigAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State
  const [dailyCoinsMin, setDailyCoinsMin] = useState(5000000);
  const [dailyCoinsMax, setDailyCoinsMax] = useState(20000000);
  const [dailyVouchers, setDailyVouchers] = useState(2);
  const [dailyStreakMultiplier, setDailyStreakMultiplier] = useState(0.10);
  const [dailyWalkoutChance, setDailyWalkoutChance] = useState(0.15);

  const [workCoinsMin, setWorkCoinsMin] = useState(2000000);
  const [workCoinsMax, setWorkCoinsMax] = useState(10000000);
  const [workCooldownMins, setWorkCooldownMins] = useState(30);

  const [voucherCoinPrice, setVoucherCoinPrice] = useState(10000000);
  const [voucherDailyLimit, setVoucherDailyLimit] = useState(70);

  const [marketTaxPercent, setMarketTaxPercent] = useState(10.0);
  const [tradeTaxPercent, setTradeTaxPercent] = useState(5.0);
  const [maxMarketListings, setMaxMarketListings] = useState(10);

  const [starterCoins, setStarterCoins] = useState(50000000);
  const [starterVouchers, setStarterVouchers] = useState(10);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/economy-config');
      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        setDailyCoinsMin(c.daily_coins_min ?? 5000000);
        setDailyCoinsMax(c.daily_coins_max ?? 20000000);
        setDailyVouchers(c.daily_vouchers ?? 2);
        setDailyStreakMultiplier(c.daily_streak_multiplier ?? 0.10);
        setDailyWalkoutChance(c.daily_walkout_chance ?? 0.15);

        setWorkCoinsMin(c.work_coins_min ?? 2000000);
        setWorkCoinsMax(c.work_coins_max ?? 10000000);
        setWorkCooldownMins(c.work_cooldown_mins ?? 30);

        setVoucherCoinPrice(c.voucher_coin_price ?? 10000000);
        setVoucherDailyLimit(c.voucher_daily_limit ?? 70);

        setMarketTaxPercent(c.market_tax_percent ?? 10.0);
        setTradeTaxPercent(c.trade_tax_percent ?? 5.0);
        setMaxMarketListings(c.max_market_listings ?? 10);

        setStarterCoins(c.starter_coins ?? 50000000);
        setStarterVouchers(c.starter_vouchers ?? 10);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load economy configuration.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      daily_coins_min: parseInt(dailyCoinsMin, 10) || 5000000,
      daily_coins_max: parseInt(dailyCoinsMax, 10) || 20000000,
      daily_vouchers: parseInt(dailyVouchers, 10) || 2,
      daily_streak_multiplier: parseFloat(dailyStreakMultiplier) || 0.10,
      daily_walkout_chance: parseFloat(dailyWalkoutChance) || 0.15,
      work_coins_min: parseInt(workCoinsMin, 10) || 2000000,
      work_coins_max: parseInt(workCoinsMax, 10) || 10000000,
      work_cooldown_mins: parseInt(workCooldownMins, 10) || 30,
      voucher_coin_price: parseInt(voucherCoinPrice, 10) || 10000000,
      voucher_daily_limit: parseInt(voucherDailyLimit, 10) || 70,
      market_tax_percent: parseFloat(marketTaxPercent) || 10.0,
      trade_tax_percent: parseFloat(tradeTaxPercent) || 5.0,
      max_market_listings: parseInt(maxMarketListings, 10) || 10,
      starter_coins: parseInt(starterCoins, 10) || 50000000,
      starter_vouchers: parseInt(starterVouchers, 10) || 10
    };

    try {
      const res = await fetch('/api/economy-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Global Economy and Cooldowns saved. Live bot synchronized.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving economy settings.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0914] text-white flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading Economy Settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0914] text-neutral-100 flex selection:bg-fuchsia-500/30">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Economy and Rewards Manager
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Live Dynamic Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Economy, Cooldowns and Rewards
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Customize daily rewards, work payouts, voucher market costs, daily limits, transaction taxes, and starter clubs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchConfig}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-purple-900/40 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <LiquidButton
              onClick={handleSave}
              disabled={saving}
              className="!px-6 !py-2.5 !bg-gradient-to-r !from-pink-600 !via-fuchsia-600 !to-purple-600 hover:!from-pink-500 hover:!to-purple-500 !text-white !font-bold !rounded-xl !shadow-lg !shadow-fuchsia-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Economy'}
            </LiquidButton>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === 'success'
                ? 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-fuchsia-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Rewards Configuration */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">/daily Command Rewards</h2>
                <p className="text-xs text-neutral-400">Configure daily claims, streaks, and lucky drop odds</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Min Coins Reward</label>
                  <input
                    type="number"
                    value={dailyCoinsMin}
                    onChange={(e) => setDailyCoinsMin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] font-mono text-pink-400 mt-1 block">{formatShortPrice(dailyCoinsMin)} coins</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Max Coins Reward</label>
                  <input
                    type="number"
                    value={dailyCoinsMax}
                    onChange={(e) => setDailyCoinsMax(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] font-mono text-pink-400 mt-1 block">{formatShortPrice(dailyCoinsMax)} coins</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Daily Draft Vouchers</label>
                  <input
                    type="number"
                    value={dailyVouchers}
                    onChange={(e) => setDailyVouchers(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">{dailyVouchers} Vouchers</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Streak Multiplier (per Day)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dailyStreakMultiplier}
                    onChange={(e) => setDailyStreakMultiplier(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">+{(dailyStreakMultiplier * 100).toFixed(0)}% per day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Jackpot Walkout Drop Chance (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={dailyWalkoutChance}
                    onChange={(e) => setDailyWalkoutChance(e.target.value)}
                    className="flex-1 accent-fuchsia-400"
                  />
                  <span className="font-mono text-sm font-bold text-fuchsia-300 w-16 text-right">
                    {(dailyWalkoutChance * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Work Command Configuration */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">/work Command Payouts</h2>
                <p className="text-xs text-neutral-400">Configure work shifts, wages, and cooldown timers</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Min Work Wages</label>
                  <input
                    type="number"
                    value={workCoinsMin}
                    onChange={(e) => setWorkCoinsMin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                  <span className="text-[11px] font-mono text-fuchsia-300 mt-1 block">{formatShortPrice(workCoinsMin)} coins</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Max Work Wages</label>
                  <input
                    type="number"
                    value={workCoinsMax}
                    onChange={(e) => setWorkCoinsMax(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                  <span className="text-[11px] font-mono text-fuchsia-300 mt-1 block">{formatShortPrice(workCoinsMax)} coins</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Work Shift Cooldown (Minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={workCooldownMins}
                    onChange={(e) => setWorkCooldownMins(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                  <span className="text-xs font-bold text-neutral-400 shrink-0">Minutes</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Users can run `/work` once every {workCooldownMins} minutes.</p>
              </div>
            </div>
          </div>

          {/* Vouchers & Shop Economy */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Vouchers and Daily Limits</h2>
                <p className="text-xs text-neutral-400">Controls coin purchase price and per-user daily purchase caps</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Voucher Price (Coins per Voucher)</label>
                <input
                  type="number"
                  value={voucherCoinPrice}
                  onChange={(e) => setVoucherCoinPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] font-mono text-purple-300 mt-1 block">{formatShortPrice(voucherCoinPrice)} per 1 Voucher</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Daily Voucher Purchase Limit (Per User)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={voucherDailyLimit}
                    onChange={(e) => setVoucherDailyLimit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-xs font-bold text-neutral-400 shrink-0">Vouchers / Day</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Maximum vouchers a user can buy with coins in 24 hours (Current: {voucherDailyLimit} limit).</p>
              </div>
            </div>
          </div>

          {/* Market Taxes & Starter Club */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Taxes and Starter Clubs</h2>
                <p className="text-xs text-neutral-400">Transaction fees and new user registration bonuses</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Market Sales Tax (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={marketTaxPercent}
                    onChange={(e) => setMarketTaxPercent(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] text-pink-300 mt-1 block">{marketTaxPercent}% sales fee</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Trade Tax (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tradeTaxPercent}
                    onChange={(e) => setTradeTaxPercent(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] text-pink-300 mt-1 block">{tradeTaxPercent}% trade fee</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Starter Bonus Coins</label>
                  <input
                    type="number"
                    value={starterCoins}
                    onChange={(e) => setStarterCoins(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] font-mono text-pink-300 mt-1 block">{formatShortPrice(starterCoins)} coins</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Starter Vouchers</label>
                  <input
                    type="number"
                    value={starterVouchers}
                    onChange={(e) => setStarterVouchers(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">{starterVouchers} Vouchers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Footer */}
        <div className="mt-12 flex justify-end pb-12">
          <LiquidButton
            onClick={handleSave}
            disabled={saving}
            className="!px-8 !py-3.5 !bg-gradient-to-r !from-pink-600 !via-fuchsia-600 !to-purple-600 hover:!from-pink-500 hover:!to-purple-500 !text-white !font-bold !rounded-2xl !shadow-xl !shadow-fuchsia-600/30 flex items-center gap-3 text-base"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving System Rates...' : 'Save & Sync Economy Engine'}
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
