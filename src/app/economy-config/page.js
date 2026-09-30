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
  PackageCheck,
  Gamepad2,
  Clock,
  Target,
  HelpCircle,
  Swords,
  Timer
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

  // Daily Rewards & Timing
  const [dailyCoinsMin, setDailyCoinsMin] = useState(5000000);
  const [dailyCoinsMax, setDailyCoinsMax] = useState(20000000);
  const [dailyVouchers, setDailyVouchers] = useState(2);
  const [dailyCooldownHours, setDailyCooldownHours] = useState(24);
  const [dailyStreakMultiplier, setDailyStreakMultiplier] = useState(0.10);
  const [dailyWalkoutChance, setDailyWalkoutChance] = useState(0.15);

  // Work Shifts
  const [workCoinsMin, setWorkCoinsMin] = useState(2000000);
  const [workCoinsMax, setWorkCoinsMax] = useState(10000000);
  const [workCooldownMins, setWorkCooldownMins] = useState(30);

  // Vouchers & Market
  const [voucherCoinPrice, setVoucherCoinPrice] = useState(10000000);
  const [voucherDailyLimit, setVoucherDailyLimit] = useState(70);
  const [marketTaxPercent, setMarketTaxPercent] = useState(10.0);
  const [tradeTaxPercent, setTradeTaxPercent] = useState(5.0);
  const [maxMarketListings, setMaxMarketListings] = useState(10);
  const [starterCoins, setStarterCoins] = useState(50000000);
  const [starterVouchers, setStarterVouchers] = useState(10);

  // Skill Games & Interactive Quests
  const [dribbleVouchers, setDribbleVouchers] = useState(2);
  const [dribbleCoins, setDribbleCoins] = useState(5000000);
  const [dribbleCooldownMins, setDribbleCooldownMins] = useState(120);

  const [triviaVouchers, setTriviaVouchers] = useState(1);
  const [triviaCoins, setTriviaCoins] = useState(5000000);
  const [triviaCooldownMins, setTriviaCooldownMins] = useState(60);

  const [freekickVouchers, setFreekickVouchers] = useState(1);
  const [freekickCoins, setFreekickCoins] = useState(4000000);
  const [freekickCooldownMins, setFreekickCooldownMins] = useState(90);

  const [gkVouchers, setGkVouchers] = useState(1);
  const [gkCoins, setGkCoins] = useState(4000000);
  const [gkCooldownMins, setGkCooldownMins] = useState(90);

  const [volleyVouchers, setVolleyVouchers] = useState(1);
  const [volleyCoins, setVolleyCoins] = useState(4000000);
  const [volleyCooldownMins, setVolleyCooldownMins] = useState(90);

  const [h2hAiVouchers, setH2hAiVouchers] = useState(2);
  const [h2hAiCoins, setH2hAiCoins] = useState(10000000);
  const [h2hAiCooldownMins, setH2hAiCooldownMins] = useState(120);

  const [penaltyVouchers, setPenaltyVouchers] = useState(1);
  const [penaltyCoins, setPenaltyCoins] = useState(3000000);
  const [penaltyCooldownMins, setPenaltyCooldownMins] = useState(60);

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
        setDailyCooldownHours(c.daily_cooldown_hours ?? 24);
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

        // Skill Games
        setDribbleVouchers(c.dribble_reward_vouchers ?? 2);
        setDribbleCoins(c.dribble_reward_coins ?? 5000000);
        setDribbleCooldownMins(c.dribble_cooldown_mins ?? 120);

        setTriviaVouchers(c.trivia_reward_vouchers ?? 1);
        setTriviaCoins(c.trivia_reward_coins ?? 5000000);
        setTriviaCooldownMins(c.trivia_cooldown_mins ?? 60);

        setFreekickVouchers(c.freekick_reward_vouchers ?? 1);
        setFreekickCoins(c.freekick_reward_coins ?? 4000000);
        setFreekickCooldownMins(c.freekick_cooldown_mins ?? 90);

        setGkVouchers(c.gk_reward_vouchers ?? 1);
        setGkCoins(c.gk_reward_coins ?? 4000000);
        setGkCooldownMins(c.gk_cooldown_mins ?? 90);

        setVolleyVouchers(c.volley_reward_vouchers ?? 1);
        setVolleyCoins(c.volley_reward_coins ?? 4000000);
        setVolleyCooldownMins(c.volley_cooldown_mins ?? 90);

        setH2hAiVouchers(c.h2h_ai_reward_vouchers ?? 2);
        setH2hAiCoins(c.h2h_ai_reward_coins ?? 10000000);
        setH2hAiCooldownMins(c.h2h_ai_cooldown_mins ?? 120);

        setPenaltyVouchers(c.penalty_reward_vouchers ?? 1);
        setPenaltyCoins(c.penalty_reward_coins ?? 3000000);
        setPenaltyCooldownMins(c.penalty_cooldown_mins ?? 60);
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
      daily_cooldown_hours: parseInt(dailyCooldownHours, 10) || 24,
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
      starter_vouchers: parseInt(starterVouchers, 10) || 10,

      dribble_reward_vouchers: parseInt(dribbleVouchers, 10) || 2,
      dribble_reward_coins: parseInt(dribbleCoins, 10) || 5000000,
      dribble_cooldown_mins: parseInt(dribbleCooldownMins, 10) || 120,

      trivia_reward_vouchers: parseInt(triviaVouchers, 10) || 1,
      trivia_reward_coins: parseInt(triviaCoins, 10) || 5000000,
      trivia_cooldown_mins: parseInt(triviaCooldownMins, 10) || 60,

      freekick_reward_vouchers: parseInt(freekickVouchers, 10) || 1,
      freekick_reward_coins: parseInt(freekickCoins, 10) || 4000000,
      freekick_cooldown_mins: parseInt(freekickCooldownMins, 10) || 90,

      gk_reward_vouchers: parseInt(gkVouchers, 10) || 1,
      gk_reward_coins: parseInt(gkCoins, 10) || 4000000,
      gk_cooldown_mins: parseInt(gkCooldownMins, 10) || 90,

      volley_reward_vouchers: parseInt(volleyVouchers, 10) || 1,
      volley_reward_coins: parseInt(volleyCoins, 10) || 4000000,
      volley_cooldown_mins: parseInt(volleyCooldownMins, 10) || 90,

      h2h_ai_reward_vouchers: parseInt(h2hAiVouchers, 10) || 2,
      h2h_ai_reward_coins: parseInt(h2hAiCoins, 10) || 10000000,
      h2h_ai_cooldown_mins: parseInt(h2hAiCooldownMins, 10) || 120,

      penalty_reward_vouchers: parseInt(penaltyVouchers, 10) || 1,
      penalty_reward_coins: parseInt(penaltyCoins, 10) || 3000000,
      penalty_cooldown_mins: parseInt(penaltyCooldownMins, 10) || 60,
    };

    try {
      const res = await fetch('/api/economy-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Global Economy and Skill Games settings saved. Live bot synchronized.' });
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
            <p className="text-sm font-medium">Loading Economy and Skill Games Settings...</p>
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
                <Coins className="w-3.5 h-3.5" /> Economy and Quests Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Live Dynamic Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Economy, Skill Games and Refresh Timings
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Customize daily rewards, cooldown timers, voucher market prices, and individual skill game payouts.
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
              loading={saving}
            >
              <Save className="w-4 h-4" />
              Save Economy and Quests
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

        {/* Top Grid: Daily Claims & Work */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Rewards Configuration */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">/daily and /quest_daily Login Rewards</h2>
                <p className="text-xs text-neutral-400">Configure daily claims, streaks, cooldown refresh, and jackpot odds</p>
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
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Refresh Cooldown (Hours)</label>
                  <input
                    type="number"
                    value={dailyCooldownHours}
                    onChange={(e) => setDailyCooldownHours(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">Every {dailyCooldownHours} hours</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Walkout Drop Chance (%)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={dailyWalkoutChance}
                      onChange={(e) => setDailyWalkoutChance(e.target.value)}
                      className="flex-1 accent-fuchsia-400"
                    />
                    <span className="font-mono text-xs font-bold text-fuchsia-300 w-12 text-right">
                      {(dailyWalkoutChance * 100).toFixed(0)}%
                    </span>
                  </div>
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

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Voucher Price (Coins)</label>
                  <input
                    type="number"
                    value={voucherCoinPrice}
                    onChange={(e) => setVoucherCoinPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[11px] font-mono text-purple-300 mt-1 block">{formatShortPrice(voucherCoinPrice)} per 1 Voucher</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Voucher Daily Limit</label>
                  <input
                    type="number"
                    value={voucherDailyLimit}
                    onChange={(e) => setVoucherDailyLimit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">{voucherDailyLimit} per day</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Games & Interactive Quests Matrix */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-6 mb-8">
          <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Skill Games and Quests Configuration</h2>
              <p className="text-xs text-neutral-400">Configure vouchers, bonus coins, and refresh cooldown timings for all mini-games</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Dribble Gauntlet */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-fuchsia-400" /> Dribble Gauntlet
                </span>
                <span className="text-[10px] font-mono text-fuchsia-300 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20">/quest_dribble</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Vouchers</label>
                  <input
                    type="number"
                    value={dribbleVouchers}
                    onChange={(e) => setDribbleVouchers(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={dribbleCoins}
                    onChange={(e) => setDribbleCoins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Cooldown (m)</label>
                  <input
                    type="number"
                    value={dribbleCooldownMins}
                    onChange={(e) => setDribbleCooldownMins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Football Trivia */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-pink-400" /> Football Trivia
                </span>
                <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">/quest_trivia</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Vouchers</label>
                  <input
                    type="number"
                    value={triviaVouchers}
                    onChange={(e) => setTriviaVouchers(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={triviaCoins}
                    onChange={(e) => setTriviaCoins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Cooldown (m)</label>
                  <input
                    type="number"
                    value={triviaCooldownMins}
                    onChange={(e) => setTriviaCooldownMins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Free Kick Master */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" /> Free Kick Master
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">/quest_freekick</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Vouchers</label>
                  <input
                    type="number"
                    value={freekickVouchers}
                    onChange={(e) => setFreekickVouchers(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={freekickCoins}
                    onChange={(e) => setFreekickCoins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Cooldown (m)</label>
                  <input
                    type="number"
                    value={freekickCooldownMins}
                    onChange={(e) => setFreekickCooldownMins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Goalkeeper Hero */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Goalkeeper Hero
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">/quest_gk</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Vouchers</label>
                  <input
                    type="number"
                    value={gkVouchers}
                    onChange={(e) => setGkVouchers(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={gkCoins}
                    onChange={(e) => setGkCoins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Cooldown (m)</label>
                  <input
                    type="number"
                    value={gkCooldownMins}
                    onChange={(e) => setGkCooldownMins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Cross & Volley */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Cross & Volley
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">/quest_volley</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Vouchers</label>
                  <input
                    type="number"
                    value={volleyVouchers}
                    onChange={(e) => setVolleyVouchers(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={volleyCoins}
                    onChange={(e) => setVolleyCoins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Cooldown (m)</label>
                  <input
                    type="number"
                    value={volleyCooldownMins}
                    onChange={(e) => setVolleyCooldownMins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* AI Head to Head */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-blue-400" /> AI Head to Head
                </span>
                <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">/quest_h2h</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Vouchers</label>
                  <input
                    type="number"
                    value={h2hAiVouchers}
                    onChange={(e) => setH2hAiVouchers(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={h2hAiCoins}
                    onChange={(e) => setH2hAiCoins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Cooldown (m)</label>
                  <input
                    type="number"
                    value={h2hAiCooldownMins}
                    onChange={(e) => setH2hAiCooldownMins(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-center"
                  />
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
            loading={saving}
            className="!px-8 !py-3.5 text-base"
          >
            <Save className="w-5 h-5" />
            Save Economy & Quests Engine
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
