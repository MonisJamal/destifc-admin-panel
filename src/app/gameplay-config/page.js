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
  Percent
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

export default function GameplayConfigAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Match Simulation Payouts
  const [matchWinCoins, setMatchWinCoins] = useState(25000000);
  const [matchDrawCoins, setMatchDrawCoins] = useState(10000000);
  const [matchLossCoins, setMatchLossCoins] = useState(5000000);

  // H2H Fans Ranking
  const [matchWinFans, setMatchWinFans] = useState(25);
  const [matchDrawFans, setMatchDrawFans] = useState(0);
  const [matchLossFans, setMatchLossFans] = useState(-15);

  // Draft Battle Arena
  const [draftBattleEntryFee, setDraftBattleEntryFee] = useState(0);
  const [draftBattleWinnerCoins, setDraftBattleWinnerCoins] = useState(50000000);
  const [draftBattleWinnerVouchers, setDraftBattleWinnerVouchers] = useState(5);
  const [penaltyShootoutEnabled, setPenaltyShootoutEnabled] = useState(true);

  // Custom & Signature Boost
  const [customCardMatchBoost, setCustomCardMatchBoost] = useState(1.15);

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

        setDraftBattleEntryFee(c.draft_battle_entry_fee ?? 0);
        setDraftBattleWinnerCoins(c.draft_battle_winner_coins ?? 50000000);
        setDraftBattleWinnerVouchers(c.draft_battle_winner_vouchers ?? 5);
        setPenaltyShootoutEnabled(c.penalty_shootout_enabled !== undefined ? c.penalty_shootout_enabled : true);

        setCustomCardMatchBoost(c.custom_card_match_boost ?? 1.15);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load gameplay configuration.' });
    } finally {
      setLoading(false);
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
      draft_battle_entry_fee: parseInt(draftBattleEntryFee, 10) || 0,
      draft_battle_winner_coins: parseInt(draftBattleWinnerCoins, 10) || 50000000,
      draft_battle_winner_vouchers: parseInt(draftBattleWinnerVouchers, 10) || 5,
      penalty_shootout_enabled: Boolean(penaltyShootoutEnabled),
      custom_card_match_boost: parseFloat(customCardMatchBoost) || 1.15
    };

    try {
      const res = await fetch('/api/gameplay-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Gameplay and match parameters saved. Discord bot updated in real time.' });
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
      <div className="min-h-screen bg-[#0d0914] text-white flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading Gameplay and Match Engine...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0914] text-neutral-100 flex selection:bg-purple-500/30">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-7xl">
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
              Gameplay and Match Rewards
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Configure Head-to-Head ranked rewards, fan rating ladders, Draft Battle jackpots, and custom card performance multipliers.
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
              {saving ? 'Saving...' : 'Save Gameplay'}
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

          {/* Ranked Fans Rating Ladder */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Ranked Fans Rating Ladder</h2>
                <p className="text-xs text-neutral-400">Fans gained or lost for leaderboard ranking</p>
              </div>
            </div>

            <div className="space-y-4">
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

          {/* Draft Battle Arena */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Draft Battle Arena</h2>
                <p className="text-xs text-neutral-400">Settings for 1v1 Draft Battle tournament mode</p>
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

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-200 block">Penalty Shootouts</span>
                  <span className="text-[11px] text-neutral-400">Resolve draws with sudden death penalties</span>
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

          {/* Custom Card Power Boost */}
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Card Aura and Match Boost</h2>
                <p className="text-xs text-neutral-400">In-game performance advantage for Custom and Box cards</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-neutral-300 font-semibold">Custom and Signature Card Impact Boost</span>
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
                <p className="text-[11px] text-neutral-500 mt-2">
                  Multiplies attacking and defensive roll probabilities in match simulation for custom cards over regular cards of the same OVR.
                </p>
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
            {saving ? 'Saving System Rates...' : 'Save & Sync Gameplay Mechanics'}
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
