'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Coins, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  ArrowUpDown,
  Calculator
} from 'lucide-react';

const DEFAULT_PRESET_OFFICIAL = {
  125: { min_price: 16000000000, max_price: 32000000000, quicksell: 11200000000 },
  124: { min_price: 8000000000, max_price: 16000000000, quicksell: 5600000000 },
  123: { min_price: 4000000000, max_price: 8000000000, quicksell: 2800000000 },
  122: { min_price: 2000000000, max_price: 4000000000, quicksell: 1400000000 },
  121: { min_price: 900000000, max_price: 1800000000, quicksell: 630000000 },
  120: { min_price: 400000000, max_price: 800000000, quicksell: 280000000 },
  119: { min_price: 70000000, max_price: 140000000, quicksell: 49000000 },
  118: { min_price: 65000000, max_price: 130000000, quicksell: 45500000 },
  117: { min_price: 60000000, max_price: 120000000, quicksell: 42000000 },
  116: { min_price: 10000000, max_price: 20000000, quicksell: 7000000 },
  115: { min_price: 9000000, max_price: 18000000, quicksell: 6300000 },
  114: { min_price: 8000000, max_price: 16000000, quicksell: 5600000 },
  113: { min_price: 7000000, max_price: 14000000, quicksell: 4900000 },
  112: { min_price: 6000000, max_price: 12000000, quicksell: 4200000 },
  111: { min_price: 5000000, max_price: 10000000, quicksell: 3500000 },
  110: { min_price: 4000000, max_price: 8000000, quicksell: 2800000 },
  109: { min_price: 3000000, max_price: 6000000, quicksell: 2100000 },
  108: { min_price: 2000000, max_price: 4000000, quicksell: 1400000 },
  107: { min_price: 1000000, max_price: 2000000, quicksell: 700000 },
  106: { min_price: 500000, max_price: 1000000, quicksell: 350000 },
  105: { min_price: 250000, max_price: 500000, quicksell: 175000 },
  104: { min_price: 200000, max_price: 400000, quicksell: 140000 },
  103: { min_price: 150000, max_price: 300000, quicksell: 105000 },
  102: { min_price: 100000, max_price: 200000, quicksell: 70000 },
  101: { min_price: 75000, max_price: 150000, quicksell: 52500 },
  100: { min_price: 50000, max_price: 100000, quicksell: 35000 },
};

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

export default function PriceSetterAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [prices, setPrices] = useState({});
  const [newOvr, setNewOvr] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prices');
      const data = await res.json();
      if (data.success && data.prices) {
        setPrices(data.prices);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch OVR price settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (ovr, field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setPrices((prev) => {
      const current = prev[ovr] || { min_price: 0, max_price: 0, quicksell: 0 };
      const updated = { ...current, [field]: num };
      if (field === 'min_price' && (!current.quicksell || current.quicksell === 0)) {
        updated.quicksell = Math.round(num * 0.7);
      }
      if (field === 'min_price' && (!current.max_price || current.max_price === 0)) {
        updated.max_price = num * 2;
      }
      return { ...prev, [ovr]: updated };
    });
  };

  const handleAddNewOvr = () => {
    const ovrNum = parseInt(newOvr, 10);
    if (!ovrNum || ovrNum < 50 || ovrNum > 150) {
      setMessage({ type: 'error', text: 'Please enter a valid OVR rating between 50 and 150.' });
      return;
    }
    if (prices[ovrNum]) {
      setMessage({ type: 'error', text: `OVR ${ovrNum} already exists in the price table.` });
      return;
    }
    const suggestedMin = ovrNum >= 120 ? 400000000 : 1000000;
    setPrices((prev) => ({
      ...prev,
      [ovrNum]: {
        min_price: suggestedMin,
        max_price: suggestedMin * 2,
        quicksell: Math.round(suggestedMin * 0.7)
      }
    }));
    setNewOvr('');
    setMessage({ type: 'success', text: `Added OVR ${ovrNum} row. Adjust prices and click Save.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDeleteOvr = (ovr) => {
    setPrices((prev) => {
      const copy = { ...prev };
      delete copy[ovr];
      return copy;
    });
  };

  const handleAutoCalcAll = () => {
    setPrices((prev) => {
      const updated = {};
      Object.keys(prev).forEach((ovr) => {
        const item = prev[ovr];
        const minP = Number(item.min_price) || 100;
        updated[ovr] = {
          min_price: minP,
          max_price: Number(item.max_price) > minP ? item.max_price : minP * 2,
          quicksell: Math.round(minP * 0.70)
        };
      });
      return updated;
    });
    setMessage({ type: 'success', text: 'Recalculated QuickSell (70% of Min) and Max (2x Min) across all OVRs.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleScaleAll = (multiplier) => {
    setPrices((prev) => {
      const updated = {};
      Object.keys(prev).forEach((ovr) => {
        const item = prev[ovr];
        updated[ovr] = {
          min_price: Math.round(item.min_price * multiplier),
          max_price: Math.round(item.max_price * multiplier),
          quicksell: Math.round(item.quicksell * multiplier),
        };
      });
      return updated;
    });
    setMessage({ type: 'success', text: `Scaled all OVR prices by ${(multiplier * 100).toFixed(0)}%. Click Save to apply.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleApplyPreset = (preset) => {
    setPrices(preset);
    setMessage({ type: 'success', text: 'Loaded standard price curve. Click Save to apply.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'All OVR Price limits saved. Discord market, quicksell, and inventory updated live.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save prices.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving prices.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sortedOvrs = Object.keys(prices)
    .map(Number)
    .sort((a, b) => b - a)
    .filter((ovr) => !searchTerm || ovr.toString().includes(searchTerm));

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-[var(--text-main)] opacity-70">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading OVR Price Matrix...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex selection:bg-fuchsia-500/30 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-glass)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Economy and Market Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-[var(--border-glass)]">
                Live Bot Synchronization
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              OVR Price Limits and QuickSell Setter
            </h1>
            <p className="text-sm text-[var(--text-main)] opacity-70 mt-1">
              Configure minimum price floors, maximum price ceilings, and quicksell values for each player card OVR rating.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPrices}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--card-bg)]/80 hover:bg-[var(--card-bg)] text-[var(--text-main)] opacity-90 border border-purple-900/40 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <LiquidButton
              onClick={handleSave}
              disabled={saving}
              className="!px-6 !py-2.5 !bg-gradient-to-r !from-pink-600 !via-fuchsia-600 !to-purple-600 hover:!from-pink-500 hover:!to-purple-500 !text-[var(--text-main)] !font-bold !rounded-xl !shadow-lg !shadow-fuchsia-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Live...' : 'Save All Prices'}
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

        {/* Toolbar & Batch Actions */}
        <div className="mb-8 p-5 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-[var(--text-main)] opacity-70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by OVR (e.g. 120)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-sm text-[var(--text-main)] placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Add Custom OVR */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="New OVR..."
                value={newOvr}
                onChange={(e) => setNewOvr(e.target.value)}
                className="w-28 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-sm text-[var(--text-main)] placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500 text-center font-mono"
              />
              <button
                onClick={handleAddNewOvr}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--card-bg)] hover:bg-neutral-700 text-[var(--text-main)] opacity-90 border border-purple-900/40 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-fuchsia-400" /> Add OVR
              </button>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="pt-3 border-t border-[var(--border-glass)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-fuchsia-400" />
              <span className="font-semibold text-[var(--text-main)] opacity-90">Quick Tools:</span>
              <button
                onClick={handleAutoCalcAll}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-neutral-700 text-[var(--text-main)] opacity-90 border border-[var(--border-glass)] font-medium transition"
              >
                Auto QuickSell (70%) and Max (2x)
              </button>
              <button
                onClick={() => handleScaleAll(1.2)}
                className="px-2.5 py-1.5 rounded-lg bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/30 font-medium transition"
              >
                +20% All Prices
              </button>
              <button
                onClick={() => handleScaleAll(0.8)}
                className="px-2.5 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 font-medium transition"
              >
                -20% All Prices
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApplyPreset(DEFAULT_PRESET_OFFICIAL)}
                className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-[var(--border-glass)] font-semibold transition"
              >
                Reset to Standard Curve
              </button>
            </div>
          </div>
        </div>

        {/* Prices Table */}
        <div className="rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-glass)] bg-[var(--card-bg)]/80 text-xs uppercase font-bold text-[var(--text-main)] opacity-70 tracking-wider">
                  <th className="py-4 px-6">OVR Rating</th>
                  <th className="py-4 px-6">Min Price Floor (Coins)</th>
                  <th className="py-4 px-6">Max Price Ceiling (Coins)</th>
                  <th className="py-4 px-6">QuickSell Instant Value</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-sm">
                {sortedOvrs.map((ovr) => {
                  const item = prices[ovr] || { min_price: 0, max_price: 0, quicksell: 0 };
                  const isHighTier = ovr >= 120;
                  const isPrime = ovr >= 122;

                  return (
                    <tr 
                      key={ovr} 
                      className={`hover:bg-purple-900/10 transition-colors ${
                        isPrime ? 'bg-fuchsia-500/[0.04]' : (isHighTier ? 'bg-purple-500/[0.03]' : '')
                      }`}
                    >
                      {/* OVR Badge */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-md font-mono ${
                              isPrime
                                ? 'bg-gradient-to-tr from-pink-500 to-fuchsia-400 text-[var(--text-main)] shadow-fuchsia-500/20 ring-2 ring-fuchsia-400/40'
                                : isHighTier
                                ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-[var(--text-main)] shadow-purple-500/20'
                                : 'bg-[var(--card-bg)] text-[var(--text-main)] opacity-90 border border-[var(--border-glass)]'
                            }`}
                          >
                            {ovr}
                          </span>
                          <div>
                            <span className="font-bold text-[var(--text-main)] opacity-90">
                              {ovr >= 122 ? 'Prime Icon Tier' : (ovr >= 120 ? 'Walkout Tier' : (ovr >= 115 ? 'Elite Tier' : 'Standard Tier'))}
                            </span>
                            <span className="block text-[11px] text-[var(--text-main)] opacity-50 font-mono">
                              OVR {ovr}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Min Price */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.min_price || ''}
                              onChange={(e) => handlePriceChange(ovr, 'min_price', e.target.value)}
                              className="w-44 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-pink-500 font-semibold"
                            />
                            <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-1 rounded-lg border border-pink-500/20">
                              {formatShortPrice(item.min_price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Max Price */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.max_price || ''}
                              onChange={(e) => handlePriceChange(ovr, 'max_price', e.target.value)}
                              className="w-44 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-purple-500 font-semibold"
                            />
                            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg border border-[var(--border-glass)]">
                              {formatShortPrice(item.max_price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* QuickSell Value */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quicksell || ''}
                              onChange={(e) => handlePriceChange(ovr, 'quicksell', e.target.value)}
                              className="w-44 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] font-mono text-sm focus:outline-none focus:border-fuchsia-500 font-semibold"
                            />
                            <span className="text-xs font-mono font-bold text-fuchsia-300 bg-fuchsia-500/10 px-2 py-1 rounded-lg border border-fuchsia-500/20">
                              {formatShortPrice(item.quicksell)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteOvr(ovr)}
                          className="p-2 rounded-xl text-[var(--text-main)] opacity-50 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Remove OVR Override"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {sortedOvrs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-[var(--text-main)] opacity-50">
                      No OVR ratings matching &quot;{searchTerm}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Save Footer */}
        <div className="mt-12 flex justify-end pb-12">
          <LiquidButton
            onClick={handleSave}
            disabled={saving}
            className="!px-8 !py-3.5 !bg-gradient-to-r !from-pink-600 !via-fuchsia-600 !to-purple-600 hover:!from-pink-500 hover:!to-purple-500 !text-[var(--text-main)] !font-bold !rounded-2xl !shadow-xl !shadow-fuchsia-600/30 flex items-center gap-3 text-base"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving System Rates...' : 'Save & Sync Economy Rates'}
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
