'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Trophy, 
  Swords, 
  Users, 
  Sparkles, 
  Flame, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Gamepad2,
  TrendingUp,
  Percent,
  Clock,
  Timer,
  Award,
  Plus,
  Trash2,
  Layers,
  Crown,
  ChevronRight
} from 'lucide-react';

const DEFAULT_TIERS = [
  { id: 1, name: 'Amateur III', min_fans: 0, badge: '🥉', win_reward_coins: 10000000, win_reward_vouchers: 1 },
  { id: 2, name: 'Amateur II', min_fans: 10000, badge: '🥉', win_reward_coins: 12000000, win_reward_vouchers: 1 },
  { id: 3, name: 'Amateur I', min_fans: 20000, badge: '🥉', win_reward_coins: 15000000, win_reward_vouchers: 1 },
  { id: 4, name: 'Pro III', min_fans: 30000, badge: '🥈', win_reward_coins: 18000000, win_reward_vouchers: 2 },
  { id: 5, name: 'Pro II', min_fans: 50000, badge: '🥈', win_reward_coins: 20000000, win_reward_vouchers: 2 },
  { id: 6, name: 'Pro I', min_fans: 70000, badge: '🥈', win_reward_coins: 25000000, win_reward_vouchers: 2 },
  { id: 7, name: 'World Class III', min_fans: 100000, badge: '🥇', win_reward_coins: 30000000, win_reward_vouchers: 3 },
  { id: 8, name: 'World Class II', min_fans: 200000, badge: '🥇', win_reward_coins: 35000000, win_reward_vouchers: 3 },
  { id: 9, name: 'World Class I', min_fans: 300000, badge: '🥇', win_reward_coins: 40000000, win_reward_vouchers: 3 },
  { id: 10, name: 'Legendary III', min_fans: 400000, badge: '💎', win_reward_coins: 50000000, win_reward_vouchers: 4 },
  { id: 11, name: 'Legendary II', min_fans: 600000, badge: '💎', win_reward_coins: 65000000, win_reward_vouchers: 4 },
  { id: 12, name: 'Legendary I', min_fans: 800000, badge: '💎', win_reward_coins: 80000000, win_reward_vouchers: 5 },
  { id: 13, name: 'FC Champion', min_fans: 1000000, badge: '🏆', win_reward_coins: 100000000, win_reward_vouchers: 6 }
];

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

export default function GameplayConfigAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Match Simulation Payouts
  const [matchWinCoins, setMatchWinCoins] = useState(25000000);
  const [matchDrawCoins, setMatchDrawCoins] = useState(10000000);
  const [matchLossCoins, setMatchLossCoins] = useState(5000000);

  // H2H Fans Ranking & XP
  const [matchWinFans, setMatchWinFans] = useState(25);
  const [matchDrawFans, setMatchDrawFans] = useState(0);
  const [matchLossFans, setMatchLossFans] = useState(-15);
  const [matchWinXp, setMatchWinXp] = useState(75);

  // Match Timings Settings
  const [matchChallengeTimeoutSecs, setMatchChallengeTimeoutSecs] = useState(60);
  const [matchCooldownMins, setMatchCooldownMins] = useState(0);
  const [matchSimStepDelaySecs, setMatchSimStepDelaySecs] = useState(0);

  // Draft Battle Arena
  const [draftBattleEntryFee, setDraftBattleEntryFee] = useState(0);
  const [draftBattleWinnerCoins, setDraftBattleWinnerCoins] = useState(50000000);
  const [draftBattleWinnerVouchers, setDraftBattleWinnerVouchers] = useState(5);
  const [penaltyShootoutEnabled, setPenaltyShootoutEnabled] = useState(true);

  // Custom & Signature Boost
  const [customCardMatchBoost, setCustomCardMatchBoost] = useState(1.15);

  // Division Rivals Ladder Tiers
  const [divisionTiers, setDivisionTiers] = useState(DEFAULT_TIERS);
  const [draftRotationHours, setDraftRotationHours] = useState(2);
  const [storeRotationHours, setStoreRotationHours] = useState(3);
  const [exchangeRotationHours, setExchangeRotationHours] = useState(2);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gameplay-config');
      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        setMatchWinCoins(c.match_win_coins ?? 25000000);
        setMatchDrawCoins(c.match_draw_coins ?? 10000000);
        setMatchLossCoins(c.match_loss_coins ?? 5000000);

        setMatchWinFans(c.match_win_fans ?? 25);
        setMatchDrawFans(c.match_draw_fans ?? 0);
        setMatchLossFans(c.match_loss_fans ?? -15);
        setMatchWinXp(c.match_win_xp ?? 75);

        setMatchChallengeTimeoutSecs(c.match_challenge_timeout_secs ?? 60);
        setMatchCooldownMins(c.match_cooldown_mins ?? 0);
        setMatchSimStepDelaySecs(c.match_sim_step_delay_secs ?? 0);

        setDraftBattleEntryFee(c.draft_battle_entry_fee ?? 0);
        setDraftBattleWinnerCoins(c.draft_battle_winner_coins ?? 50000000);
        setDraftBattleWinnerVouchers(c.draft_battle_winner_vouchers ?? 5);
        setPenaltyShootoutEnabled(c.penalty_shootout_enabled !== undefined ? c.penalty_shootout_enabled : true);

        setCustomCardMatchBoost(c.custom_card_match_boost ?? 1.15);
        setDivisionTiers(c.division_tiers && c.division_tiers.length > 0 ? c.division_tiers : DEFAULT_TIERS);
        setDraftRotationHours(c.draft_rotation_hours ?? 2);
        setStoreRotationHours(c.store_rotation_hours ?? 3);
        setExchangeRotationHours(c.exchange_rotation_hours ?? 2);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load gameplay configuration.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...divisionTiers];
    updated[index] = { ...updated[index], [field]: value };
    setDivisionTiers(updated);
  };

  const handleAddTier = () => {
    const sorted = [...divisionTiers].sort((a, b) => (Number(a.min_fans) || 0) - (Number(b.min_fans) || 0));
    const lastFan = sorted.length > 0 ? Number(sorted[sorted.length - 1].min_fans) || 0 : 0;
    const newTier = {
      id: Date.now(),
      name: `Tier ${divisionTiers.length + 1}`,
      min_fans: lastFan + 200000,
      badge: '👑',
      win_reward_coins: 50000000,
      win_reward_vouchers: 3
    };
    setDivisionTiers([...divisionTiers, newTier]);
  };

  const handleDeleteTier = (id) => {
    if (divisionTiers.length <= 1) {
      alert('You must have at least one active division tier.');
      return;
    }
    setDivisionTiers(divisionTiers.filter(t => t.id !== id));
  };

  const handleResetTiers = () => {
    if (confirm('Reset division tiers back to default 13 FC Mobile tiers?')) {
      setDivisionTiers(DEFAULT_TIERS);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      match_win_coins: parseInt(matchWinCoins, 10) || 25000000,
      match_draw_coins: parseInt(matchDrawCoins, 10) || 10000000,
      match_loss_coins: parseInt(matchLossCoins, 10) || 5000000,
      match_win_fans: parseInt(matchWinFans, 10) || 25,
      match_draw_fans: parseInt(matchDrawFans, 10) || 0,
      match_loss_fans: parseInt(matchLossFans, 10) || -15,
      match_win_xp: parseInt(matchWinXp, 10) || 75,
      match_challenge_timeout_secs: parseInt(matchChallengeTimeoutSecs, 10) || 60,
      match_cooldown_mins: parseInt(matchCooldownMins, 10) || 0,
      match_sim_step_delay_secs: parseInt(matchSimStepDelaySecs, 10) || 0,
      draft_battle_entry_fee: parseInt(draftBattleEntryFee, 10) || 0,
      draft_battle_winner_coins: parseInt(draftBattleWinnerCoins, 10) || 50000000,
      draft_battle_winner_vouchers: parseInt(draftBattleWinnerVouchers, 10) || 5,
      penalty_shootout_enabled: Boolean(penaltyShootoutEnabled),
      custom_card_match_boost: parseFloat(customCardMatchBoost) || 1.15,
      draft_rotation_hours: parseFloat(draftRotationHours) || 2,
      store_rotation_hours: parseFloat(storeRotationHours) || 3,
      exchange_rotation_hours: parseFloat(exchangeRotationHours) || 2,
      division_tiers: divisionTiers.map(t => ({
        id: t.id || Date.now(),
        name: t.name || 'Division',
        min_fans: parseInt(t.min_fans, 10) || 0,
        badge: t.badge || '🥉',
        win_reward_coins: parseInt(t.win_reward_coins, 10) || 0,
        win_reward_vouchers: parseInt(t.win_reward_vouchers, 10) || 0
      }))
    };

    try {
      const res = await fetch('/api/gameplay-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Gameplay and match timing settings saved. Discord bot updated in real time.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save gameplay settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving gameplay settings.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0914] text-white flex font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading Gameplay and Match Engine...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0914] text-neutral-100 flex selection:bg-purple-500/30 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" /> Simulation and PvP Mechanics
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                Live Dynamic Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Match Rewards, Timings and Simulation
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Configure Head-to-Head ranked rewards, match response timeouts, simulation play speed, Draft Battle jackpots, and custom card boosts.
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
              Save Match Settings
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

        
        {/* Global Timers & Rotations Adjuster */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl mb-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-purple-900/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">🔄 Global Pool & Refresh Timers Adjuster</h2>
              <p className="text-xs text-neutral-400">
                Adjust how often draft pools rotate, player market shops restock, and dynamic exchanges refresh in Discord.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-purple-900/30 space-y-3">
              <label className="block text-xs font-bold text-neutral-200">📦 /draft Pool Refresh Cycle</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="48"
                  value={draftRotationHours}
                  onChange={(e) => setDraftRotationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-sm font-semibold focus:outline-none focus:border-fuchsia-500"
                />
                <span className="text-xs font-semibold text-neutral-400 shrink-0">Hours</span>
              </div>
              <p className="text-[11px] text-neutral-500">Every {draftRotationHours}h, 3 brand new Featured Walkout draft packs are automatically selected.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-purple-900/30 space-y-3">
              <label className="block text-xs font-bold text-neutral-200">🏪 /store Player Shop Rotation</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="48"
                  value={storeRotationHours}
                  onChange={(e) => setStoreRotationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-sm font-semibold focus:outline-none focus:border-fuchsia-500"
                />
                <span className="text-xs font-semibold text-neutral-400 shrink-0">Hours</span>
              </div>
              <p className="text-[11px] text-neutral-500">Every {storeRotationHours}h, the featured coin & voucher store inventory is restocked.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-purple-900/30 space-y-3">
              <label className="block text-xs font-bold text-neutral-200">⚡ /exchange Requirements Cycle</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="48"
                  value={exchangeRotationHours}
                  onChange={(e) => setExchangeRotationHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-sm font-semibold focus:outline-none focus:border-fuchsia-500"
                />
                <span className="text-xs font-semibold text-neutral-400 shrink-0">Hours</span>
              </div>
              <p className="text-[11px] text-neutral-500">Every {exchangeRotationHours}h, the OVR sacrifice card exchange requirements rotate.</p>
            </div>
          </div>
        </div>
    
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Match Coin Payouts */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">H2H /match Coin Payouts</h2>
                <p className="text-xs text-neutral-400">Coins rewarded to users upon match completion</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Victory Win Reward</label>
                <input
                  type="number"
                  value={matchWinCoins}
                  onChange={(e) => setMatchWinCoins(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500 font-semibold"
                />
                <span className="text-[11px] font-mono text-pink-400 mt-1 block">{formatShortPrice(matchWinCoins)} coins</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Draw / Tie Reward</label>
                <input
                  type="number"
                  value={matchDrawCoins}
                  onChange={(e) => setMatchDrawCoins(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500 font-semibold"
                />
                <span className="text-[11px] font-mono text-fuchsia-300 mt-1 block">{formatShortPrice(matchDrawCoins)} coins</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Consolation Loss Reward</label>
                <input
                  type="number"
                  value={matchLossCoins}
                  onChange={(e) => setMatchLossCoins(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-purple-500 font-semibold"
                />
                <span className="text-[11px] font-mono text-neutral-400 mt-1 block">{formatShortPrice(matchLossCoins)} coins</span>
              </div>
            </div>
          </div>

          {/* Ranked Fans Rating Ladder & XP */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Ranked Fans ELO & Season XP</h2>
                <p className="text-xs text-neutral-400">Fans and Season Pass XP gained/lost for leaderboard rankings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Fans Gained on Win</label>
                  <input
                    type="number"
                    value={matchWinFans}
                    onChange={(e) => setMatchWinFans(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500 font-semibold"
                  />
                  <span className="text-[11px] text-pink-300 mt-1 block">+{matchWinFans} Fans</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Season Pass XP per Win</label>
                  <input
                    type="number"
                    value={matchWinXp}
                    onChange={(e) => setMatchWinXp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500 font-semibold"
                  />
                  <span className="text-[11px] text-pink-300 mt-1 block">+{matchWinXp} Season XP</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Fans Gained on Draw</label>
                  <input
                    type="number"
                    value={matchDrawFans}
                    onChange={(e) => setMatchDrawFans(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500 font-semibold"
                  />
                  <span className="text-[11px] text-fuchsia-300 mt-1 block">{matchDrawFans >= 0 ? `+${matchDrawFans}` : matchDrawFans} Fans</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Fans Lost on Defeat</label>
                  <input
                    type="number"
                    value={matchLossFans}
                    onChange={(e) => setMatchLossFans(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-purple-500 font-semibold"
                  />
                  <span className="text-[11px] text-purple-400 mt-1 block">{matchLossFans} Fans</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Match Timings & Draft Battle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Timings Settings */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Match Timing and Simulation Speed</h2>
                <p className="text-xs text-neutral-400">Controls acceptance timers, play-by-play animation, and cooldowns</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Match Challenge Response Timeout (Seconds)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={matchChallengeTimeoutSecs}
                    onChange={(e) => setMatchChallengeTimeoutSecs(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500 font-semibold"
                  />
                  <span className="text-xs font-bold text-neutral-400 shrink-0">Seconds</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Opponent has {matchChallengeTimeoutSecs}s to click Accept or Decline before the match challenge expires.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Match Cooldown Between Challenges (Minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={matchCooldownMins}
                    onChange={(e) => setMatchCooldownMins(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500 font-semibold"
                  />
                  <span className="text-xs font-bold text-neutral-400 shrink-0">Minutes</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Time users must wait between challenging each other (Set to 0 for unlimited instant rematches).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Live Play-by-Play Event Delay (Seconds)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={matchSimStepDelaySecs}
                    onChange={(e) => setMatchSimStepDelaySecs(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500 font-semibold"
                  />
                  <span className="text-xs font-bold text-neutral-400 shrink-0">Secs / Event</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">0 = Instant match result. 1-5s = Dramatic live play-by-play commentary stream.</p>
              </div>
            </div>
          </div>

          {/* Draft Battle Arena & Aura Boost */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Draft Battle and Card Aura Multipliers</h2>
                <p className="text-xs text-neutral-400">Settings for 1v1 Draft Battle tournament mode and custom card buffs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Default Battle Winner Coins</label>
                <input
                  type="number"
                  value={draftBattleWinnerCoins}
                  onChange={(e) => setDraftBattleWinnerCoins(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
                />
                <span className="text-[11px] font-mono text-pink-400 mt-1 block">{formatShortPrice(draftBattleWinnerCoins)} coins</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Winner Draft Vouchers Bonus</label>
                <input
                  type="number"
                  value={draftBattleWinnerVouchers}
                  onChange={(e) => setDraftBattleWinnerVouchers(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">{draftBattleWinnerVouchers} Vouchers</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-neutral-300 font-semibold">Custom & Signature Card Impact Boost</span>
                  <span className="text-fuchsia-300 font-mono font-bold">{((customCardMatchBoost - 1) * 100).toFixed(0)}% Boost ({customCardMatchBoost}x)</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.0"
                    max="1.5"
                    step="0.01"
                    value={customCardMatchBoost}
                    onChange={(e) => setCustomCardMatchBoost(e.target.value)}
                    className="flex-1 accent-fuchsia-400"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="2.0"
                    value={customCardMatchBoost}
                    onChange={(e) => setCustomCardMatchBoost(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-purple-900/40 text-right font-mono text-sm font-semibold text-fuchsia-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-200 block">Sudden Death Penalty Shootouts</span>
                  <span className="text-[11px] text-neutral-400">Resolve drawn matches with penalties</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPenaltyShootoutEnabled(!penaltyShootoutEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    penaltyShootoutEnabled ? 'bg-gradient-to-r from-pink-500 to-purple-600 justify-end' : 'bg-neutral-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Division Rivals & Ladder Tiers Controller */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Division Rivals & Ladder Tiers Controller</h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {divisionTiers.length} Active Divisions
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure required fans for promotion, division badge icons, and milestone win rewards applied in <code className="text-fuchsia-300">/play</code> and <code className="text-fuchsia-300">/leaderboard</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetTiers}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-purple-900/40 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset 13 Tiers
              </button>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg shadow-pink-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Division Tier
              </button>
            </div>
          </div>

          {/* Ladder Visual Preview */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-purple-900/20 overflow-x-auto">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-fuchsia-400" /> Progression Ladder Preview
            </span>
            <div className="flex items-center gap-2 min-w-max">
              {[...divisionTiers]
                .sort((a, b) => (Number(a.min_fans) || 0) - (Number(b.min_fans) || 0))
                .map((tier, idx, arr) => (
                  <div key={tier.id || idx} className="flex items-center gap-2">
                    <div className="px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-center flex flex-col items-center min-w-[110px]">
                      <span className="text-lg">{tier.badge || '🥉'}</span>
                      <span className="text-xs font-bold text-neutral-200 mt-0.5 truncate max-w-[100px]">{tier.name}</span>
                      <span className="text-[10px] font-mono text-fuchsia-400 font-semibold">{Number(tier.min_fans || 0).toLocaleString()} Fans</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Editable Tiers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {divisionTiers.map((tier, idx) => (
              <div 
                key={tier.id || idx}
                className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 hover:border-purple-700/50 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-purple-900/20">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center border border-purple-500/30">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-neutral-300">Tier #{idx + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Tier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Division Name</label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Pro I"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 text-xs font-semibold focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Badge Emoji</label>
                    <input
                      type="text"
                      value={tier.badge || ''}
                      onChange={(e) => handleTierChange(idx, 'badge', e.target.value)}
                      placeholder="🥉"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 text-xs text-center font-semibold focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Required Min Fans</label>
                  <input
                    type="number"
                    min="0"
                    value={tier.min_fans}
                    onChange={(e) => handleTierChange(idx, 'min_fans', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-xs font-semibold focus:outline-none focus:border-fuchsia-500"
                  />
                  <span className="text-[10px] text-fuchsia-400 font-mono mt-0.5 block">{Number(tier.min_fans || 0).toLocaleString()} Fans required</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 mb-1">Win Bonus Coins</label>
                    <input
                      type="number"
                      min="0"
                      value={tier.win_reward_coins || 0}
                      onChange={(e) => handleTierChange(idx, 'win_reward_coins', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-xs focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-[9px] text-pink-400 font-mono mt-0.5 block">{formatShortPrice(tier.win_reward_coins || 0)}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-400 mb-1">Win Bonus Vouchers</label>
                    <input
                      type="number"
                      min="0"
                      value={tier.win_reward_vouchers || 0}
                      onChange={(e) => handleTierChange(idx, 'win_reward_vouchers', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-purple-900/40 text-neutral-100 font-mono text-xs focus:outline-none focus:border-fuchsia-500"
                    />
                    <span className="text-[9px] text-neutral-400 mt-0.5 block">+{tier.win_reward_vouchers || 0}x Vouchers</span>
                  </div>
                </div>
              </div>
            ))}
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
            Save Match Settings
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
