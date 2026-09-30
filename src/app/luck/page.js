'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Sparkles, 
  Dice5, 
  Sliders, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Percent, 
  Zap, 
  ShieldAlert, 
  ArrowRightLeft,
  Flame,
  Layers,
  Box
} from 'lucide-react';

const PRESETS = {
  balanced: {
    draft_pool_a_rate: 2.5,
    draft_pool_b_rate: 30.0,
    draft_pool_c_rate: 67.5,
    walkout_122_share: 6.0,
    walkout_121_share: 35.0,
    walkout_120_share: 59.0,
    pity_pool_a_threshold: 70,
    pity_pool_b_interval: 10,
    global_luck_multiplier: 1.0,
    exchange_top_rate: 5.0,
    exchange_mid_rate: 35.0,
    exchange_base_rate: 60.0,
  },
  generous_weekend: {
    draft_pool_a_rate: 5.0,
    draft_pool_b_rate: 45.0,
    draft_pool_c_rate: 50.0,
    walkout_122_share: 15.0,
    walkout_121_share: 45.0,
    walkout_120_share: 40.0,
    pity_pool_a_threshold: 50,
    pity_pool_b_interval: 7,
    global_luck_multiplier: 1.5,
    exchange_top_rate: 10.0,
    exchange_mid_rate: 45.0,
    exchange_base_rate: 45.0,
  },
  ultra_luck_frenzy: {
    draft_pool_a_rate: 10.0,
    draft_pool_b_rate: 50.0,
    draft_pool_c_rate: 40.0,
    walkout_122_share: 25.0,
    walkout_121_share: 45.0,
    walkout_120_share: 30.0,
    pity_pool_a_threshold: 30,
    pity_pool_b_interval: 5,
    global_luck_multiplier: 2.0,
    exchange_top_rate: 20.0,
    exchange_mid_rate: 50.0,
    exchange_base_rate: 30.0,
  },
};

export default function LuckAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Draft Pool Distribution Rates (%)
  const [poolARate, setPoolARate] = useState(2.5);
  const [poolBRate, setPoolBRate] = useState(30.0);
  const [poolCRate, setPoolCRate] = useState(67.5);

  // Walkout (120+) Shares (%)
  const [walkout122Share, setWalkout122Share] = useState(6.0);
  const [walkout121Share, setWalkout121Share] = useState(35.0);
  const [walkout120Share, setWalkout120Share] = useState(59.0);

  // Pity Thresholds & Global Multiplier
  const [pityPoolA, setPityPoolA] = useState(70);
  const [pityPoolB, setPityPoolB] = useState(10);
  const [globalMultiplier, setGlobalMultiplier] = useState(1.0);

  // Exchange Rates (%)
  const [exchangeTopRate, setExchangeTopRate] = useState(5.0);
  const [exchangeMidRate, setExchangeMidRate] = useState(35.0);
  const [exchangeBaseRate, setExchangeBaseRate] = useState(60.0);

  useEffect(() => {
    fetchLuck();
  }, []);

  const fetchLuck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/luck');
      const data = await res.json();
      if (data.success && data.settings) {
        applySettings(data.settings);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load drop rate settings.' });
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (s) => {
    setPoolARate(Number(s.draft_pool_a_rate ?? 2.5));
    setPoolBRate(Number(s.draft_pool_b_rate ?? 30.0));
    setPoolCRate(Number(s.draft_pool_c_rate ?? 67.5));

    setWalkout122Share(Number(s.walkout_122_share ?? 6.0));
    setWalkout121Share(Number(s.walkout_121_share ?? 35.0));
    setWalkout120Share(Number(s.walkout_120_share ?? 59.0));

    setPityPoolA(Number(s.pity_pool_a_threshold ?? 70));
    setPityPoolB(Number(s.pity_pool_b_interval ?? 10));
    setGlobalMultiplier(Number(s.global_luck_multiplier ?? 1.0));

    setExchangeTopRate(Number(s.exchange_top_rate ?? 5.0));
    setExchangeMidRate(Number(s.exchange_mid_rate ?? 35.0));
    setExchangeBaseRate(Number(s.exchange_base_rate ?? 60.0));
  };

  const handlePreset = (key) => {
    if (PRESETS[key]) {
      applySettings(PRESETS[key]);
      setMessage({ type: 'success', text: `Preset loaded. Click "Save Drop Rates" to broadcast live.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      draft_pool_a_rate: parseFloat(poolARate) || 2.5,
      draft_pool_b_rate: parseFloat(poolBRate) || 30.0,
      draft_pool_c_rate: parseFloat(poolCRate) || 67.5,
      walkout_122_share: parseFloat(walkout122Share) || 6.0,
      walkout_121_share: parseFloat(walkout121Share) || 35.0,
      walkout_120_share: parseFloat(walkout120Share) || 59.0,
      pity_pool_a_threshold: parseInt(pityPoolA, 10) || 70,
      pity_pool_b_interval: parseInt(pityPoolB, 10) || 10,
      global_luck_multiplier: parseFloat(globalMultiplier) || 1.0,
      exchange_top_rate: parseFloat(exchangeTopRate) || 5.0,
      exchange_mid_rate: parseFloat(exchangeMidRate) || 35.0,
      exchange_base_rate: parseFloat(exchangeBaseRate) || 60.0,
    };

    try {
      const res = await fetch('/api/luck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Drop rates and probability matrix updated live.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving luck settings.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Computations
  const draftPoolTotal = (parseFloat(poolARate) || 0) + (parseFloat(poolBRate) || 0) + (parseFloat(poolCRate) || 0);
  const walkoutTotal = (parseFloat(walkout122Share) || 0) + (parseFloat(walkout121Share) || 0) + (parseFloat(walkout120Share) || 0);
  const exchangeTotal = (parseFloat(exchangeTopRate) || 0) + (parseFloat(exchangeMidRate) || 0) + (parseFloat(exchangeBaseRate) || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0914] text-neutral-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-purple-300">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading probability engine...</p>
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
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                Probability Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Real-Time Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-300 via-fuchsia-200 to-purple-300 bg-clip-text text-transparent">
              Luck & Drop Rates Control
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Configure global draft luck, pity thresholds, walkout weight distributions, and exchange probabilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLuck}
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
              {saving ? 'Saving...' : 'Save Drop Rates'}
            </LiquidButton>
          </div>
        </div>

        {/* Status Message */}
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

        {/* Presets Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-neutral-900/60 border border-purple-900/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-300 font-medium">
            <Zap className="w-4 h-4 text-fuchsia-400" />
            <span>Drop Rate Presets:</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handlePreset('balanced')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              Standard Balanced (2.5% Pool A)
            </button>
            <button
              onClick={() => handlePreset('generous_weekend')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition"
            >
              Weekend Event (5.0% Pool A)
            </button>
            <button
              onClick={() => handlePreset('ultra_luck_frenzy')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 transition"
            >
              Frenzy Boost (10.0% Pool A)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Draft Luck Engine */}
          <div className="space-y-8">
            {/* Draft Pool Probabilities */}
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/30">
                    <Dice5 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Draft Base Pool Rates</h2>
                    <p className="text-xs text-neutral-400">Probability of hitting Pool A, B, or C on regular spins</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                    Math.abs(draftPoolTotal - 100) < 0.1 ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Total: {draftPoolTotal.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Pool Ratio Bar */}
              <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden flex mb-6">
                <div style={{ width: `${poolARate}%` }} className="bg-gradient-to-r from-pink-500 to-fuchsia-500 transition-all duration-300" title={`Pool A: ${poolARate}%`} />
                <div style={{ width: `${poolBRate}%` }} className="bg-gradient-to-r from-fuchsia-600 to-purple-600 transition-all duration-300" title={`Pool B: ${poolBRate}%`} />
                <div style={{ width: `${poolCRate}%` }} className="bg-gradient-to-r from-neutral-700 to-neutral-800 transition-all duration-300" title={`Pool C: ${poolCRate}%`} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-pink-300 font-bold">Pool A Rate (120+ Walkouts)</span>
                    <span className="text-neutral-300 font-mono">{poolARate}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="30"
                      step="0.1"
                      value={poolARate}
                      onChange={(e) => setPoolARate(e.target.value)}
                      className="flex-1 accent-pink-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={poolARate}
                      onChange={(e) => setPoolARate(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-pink-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-fuchsia-300 font-bold">Pool B Rate (115 - 119 OVR)</span>
                    <span className="text-neutral-300 font-mono">{poolBRate}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="0.5"
                      value={poolBRate}
                      onChange={(e) => setPoolBRate(e.target.value)}
                      className="flex-1 accent-fuchsia-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={poolBRate}
                      onChange={(e) => setPoolBRate(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-fuchsia-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-neutral-400 font-bold">Pool C Rate (105 - 114 OVR)</span>
                    <span className="text-neutral-300 font-mono">{poolCRate}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="95"
                      step="0.5"
                      value={poolCRate}
                      onChange={(e) => setPoolCRate(e.target.value)}
                      className="flex-1 accent-neutral-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={poolCRate}
                      onChange={(e) => setPoolCRate(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-neutral-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Walkout (120+) Tier Share Breakdown */}
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-purple-500/30">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">120+ Walkout Tier Distribution</h2>
                    <p className="text-xs text-neutral-400">Share of cards when Pool A (Walkout) is triggered</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                    Math.abs(walkoutTotal - 100) < 0.1 ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Share: {walkoutTotal.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Walkout Ratio Bar */}
              <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden flex mb-6">
                <div style={{ width: `${walkout122Share}%` }} className="bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300" title={`122+: ${walkout122Share}%`} />
                <div style={{ width: `${walkout121Share}%` }} className="bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-300" title={`121: ${walkout121Share}%`} />
                <div style={{ width: `${walkout120Share}%` }} className="bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300" title={`120: ${walkout120Share}%`} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-pink-300 font-bold">122+ OVR Prime Icons</span>
                    <span className="text-neutral-300 font-mono">{walkout122Share}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="0.5"
                      value={walkout122Share}
                      onChange={(e) => setWalkout122Share(e.target.value)}
                      className="flex-1 accent-pink-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={walkout122Share}
                      onChange={(e) => setWalkout122Share(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-pink-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-fuchsia-300 font-bold">121 OVR Superstars</span>
                    <span className="text-neutral-300 font-mono">{walkout121Share}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="70"
                      step="0.5"
                      value={walkout121Share}
                      onChange={(e) => setWalkout121Share(e.target.value)}
                      className="flex-1 accent-fuchsia-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={walkout121Share}
                      onChange={(e) => setWalkout121Share(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-fuchsia-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-purple-300 font-bold">120 OVR Elite Base Walkouts</span>
                    <span className="text-neutral-300 font-mono">{walkout120Share}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="0.5"
                      value={walkout120Share}
                      onChange={(e) => setWalkout120Share(e.target.value)}
                      className="flex-1 accent-purple-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={walkout120Share}
                      onChange={(e) => setWalkout120Share(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-purple-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Pity Limits & Exchange System */}
          <div className="space-y-8">
            {/* Pity & Multiplier */}
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Pity & Multiplier Settings</h2>
                  <p className="text-xs text-neutral-400">Guaranteed safety nets and global event multipliers</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Pool A Pity Threshold (Max Pulls Before Guaranteed 120+ Walkout)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={pityPoolA}
                      onChange={(e) => setPityPoolA(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500"
                    />
                    <span className="text-xs font-bold text-neutral-400 shrink-0">Pulls</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">If a user does not hit Pool A within {pityPoolA} pulls, their {pityPoolA}th pull is 100% guaranteed Pool A.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Pool B Pity Interval (Guaranteed 115+ Every N Pulls)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={pityPoolB}
                      onChange={(e) => setPityPoolB(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 font-mono text-sm focus:outline-none focus:border-fuchsia-500"
                    />
                    <span className="text-xs font-bold text-neutral-400 shrink-0">Pulls</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Guarantees at least a Pool B (115-119) card every {pityPoolB} pulls.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Global Luck Multiplier
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={globalMultiplier}
                      onChange={(e) => setGlobalMultiplier(e.target.value)}
                      className="flex-1 accent-fuchsia-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      value={globalMultiplier}
                      onChange={(e) => setGlobalMultiplier(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-fuchsia-300"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">Scales drop odds across the bot (1.0x = Normal, 2.0x = Double Luck Event).</p>
                </div>
              </div>
            </div>

            {/* Exchange Luck Matrix */}
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Player Exchange Probabilities</h2>
                    <p className="text-xs text-neutral-400">Tuning chances for /exchange reward tiers</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                    Math.abs(exchangeTotal - 100) < 0.1 ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Total: {exchangeTotal.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Exchange Ratio Bar */}
              <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden flex mb-6">
                <div style={{ width: `${exchangeTopRate}%` }} className="bg-gradient-to-r from-pink-500 to-fuchsia-500 transition-all duration-300" title={`Top: ${exchangeTopRate}%`} />
                <div style={{ width: `${exchangeMidRate}%` }} className="bg-gradient-to-r from-fuchsia-600 to-purple-600 transition-all duration-300" title={`Mid: ${exchangeMidRate}%`} />
                <div style={{ width: `${exchangeBaseRate}%` }} className="bg-gradient-to-r from-neutral-700 to-neutral-800 transition-all duration-300" title={`Base: ${exchangeBaseRate}%`} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-pink-300 font-bold">Top Tier Pull (Maximum OVR Jackpot)</span>
                    <span className="text-neutral-300 font-mono">{exchangeTopRate}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="0.5"
                      value={exchangeTopRate}
                      onChange={(e) => setExchangeTopRate(e.target.value)}
                      className="flex-1 accent-pink-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={exchangeTopRate}
                      onChange={(e) => setExchangeTopRate(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-pink-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-fuchsia-300 font-bold">Mid Tier Pull (Mid OVR Range)</span>
                    <span className="text-neutral-300 font-mono">{exchangeMidRate}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="70"
                      step="0.5"
                      value={exchangeMidRate}
                      onChange={(e) => setExchangeMidRate(e.target.value)}
                      className="flex-1 accent-fuchsia-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={exchangeMidRate}
                      onChange={(e) => setExchangeMidRate(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-fuchsia-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-neutral-400 font-bold">Base Tier Pull (Floor OVR)</span>
                    <span className="text-neutral-300 font-mono">{exchangeBaseRate}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="0.5"
                      value={exchangeBaseRate}
                      onChange={(e) => setExchangeBaseRate(e.target.value)}
                      className="flex-1 accent-neutral-500"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={exchangeBaseRate}
                      onChange={(e) => setExchangeBaseRate(e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-right font-mono text-sm font-semibold text-neutral-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer save floating button */}
        <div className="mt-12 flex justify-end pb-12">
          <LiquidButton
            onClick={handleSave}
            disabled={saving}
            className="!px-8 !py-3.5 !bg-gradient-to-r !from-pink-600 !via-fuchsia-600 !to-purple-600 hover:!from-pink-500 hover:!to-purple-500 !text-white !font-bold !rounded-2xl !shadow-xl !shadow-fuchsia-600/30 flex items-center gap-3 text-base"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Drop Rates'}
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
