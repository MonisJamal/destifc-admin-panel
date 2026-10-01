'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Trophy, 
  Layers, 
  Coins, 
  Ticket, 
  Sparkles, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2,
  Calendar,
  Flame,
  Award
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

export default function SeasonSbcAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Season Pass State
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [seasonTitle, setSeasonTitle] = useState('Inaugural Champions Pass');
  const [xpPerTier, setXpPerTier] = useState(200);
  const [tiers, setTiers] = useState([]);

  // Active SBCs List
  const [sbcs, setSbcs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/season-sbc');
      const data = await res.json();
      if (data.success) {
        if (data.season) {
          setSeasonNumber(data.season.season_number || 1);
          setSeasonTitle(data.season.season_title || 'Inaugural Champions Pass');
          setXpPerTier(data.season.xp_per_tier || 200);
          setTiers(data.season.tiers || []);
        }
        if (data.sbcs) {
          setSbcs(data.sbcs);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load season and SBC data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (index, field, value) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddTier = () => {
    setTiers((prev) => {
      const nextTierNum = prev.length + 1;
      const nextXp = nextTierNum * xpPerTier;
      return [
        ...prev,
        {
          tier: nextTierNum,
          xp_needed: nextXp,
          reward_type: 'coins',
          reward_value: 100000000,
          reward_name: '100,000,000 Coins'
        }
      ];
    });
  };

  const handleDeleteTier = (index) => {
    setTiers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      season: {
        season_number: parseInt(seasonNumber, 10) || 1,
        season_title: seasonTitle,
        xp_per_tier: parseInt(xpPerTier, 10) || 200,
        tiers_count: tiers.length,
        tiers
      }
    };

    try {
      const res = await fetch('/api/season-sbc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Season Pass configuration saved. Live bot updated.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save season config.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving season settings.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0914] text-white flex font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-64 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading Season Pass and SBC Manager...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0914] text-neutral-100 flex selection:bg-fuchsia-500/30 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-64 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Progression and Challenges
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Live Discord Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Season Pass and SBC Architect
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Configure season progression tiers, XP thresholds, tier rewards, and inspect active Squad Building Challenges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
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
              {saving ? 'Saving...' : 'Save Season Pass'}
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

        {/* Season Metadata */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl mb-8 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-fuchsia-400" /> Active Season Pass Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Season Number</label>
              <input
                type="number"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Season Title</label>
              <input
                type="text"
                value={seasonTitle}
                onChange={(e) => setSeasonTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">XP Required per Tier</label>
              <input
                type="number"
                value={xpPerTier}
                onChange={(e) => setXpPerTier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 text-neutral-100 font-mono text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Tiers Editor Table */}
        <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Season Pass Progression Tiers ({tiers.length} Tiers)
              </h2>
              <p className="text-xs text-neutral-400">Claimable milestone rewards as players earn season XP</p>
            </div>

            <button
              onClick={handleAddTier}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-purple-900/40 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-fuchsia-400" /> Add Tier
            </button>
          </div>

          <div className="space-y-3">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-md">
                    {t.tier}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Tier {t.tier}</span>
                    <span className="text-[11px] font-mono text-neutral-400">{t.xp_needed} XP Required</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <select
                    value={t.reward_type}
                    onChange={(e) => handleTierChange(idx, 'reward_type', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-xs text-neutral-100 focus:outline-none focus:border-pink-500"
                  >
                    <option value="coins">Coins</option>
                    <option value="vouchers">Vouchers</option>
                    <option value="card">Player Card</option>
                  </select>

                  <input
                    type="text"
                    value={t.reward_name}
                    onChange={(e) => handleTierChange(idx, 'reward_name', e.target.value)}
                    placeholder="Reward Display Name..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-xs text-neutral-100 focus:outline-none focus:border-pink-500"
                  />

                  <input
                    type="number"
                    value={t.reward_value}
                    onChange={(e) => handleTierChange(idx, 'reward_value', e.target.value)}
                    placeholder="Value..."
                    className="w-32 px-3 py-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-xs text-neutral-100 font-mono focus:outline-none focus:border-pink-500 text-right"
                  />
                </div>

                <button
                  onClick={() => handleDeleteTier(idx)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Remove Tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
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
            {saving ? 'Saving...' : 'Save Season Pass'}
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
