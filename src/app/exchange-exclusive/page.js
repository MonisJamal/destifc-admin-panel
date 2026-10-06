'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  ArrowRightLeft, 
  Sparkles, 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Lock, 
  Unlock, 
  Globe, 
  Shield, 
  HelpCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function ExchangeExclusivePage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [refreshingPool, setRefreshingPool] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings
  const [targetOvr, setTargetOvr] = useState(122);
  const [enabled, setEnabled] = useState(true);
  const [allowOtherInExchanges, setAllowOtherInExchanges] = useState(false);

  // Cards
  const [exclusiveCards, setExclusiveCards] = useState([]);
  const [targetOvrCards, setTargetOvrCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exchange-exclusive');
      const data = await res.json();
      if (data.success) {
        setTargetOvr(parseInt(data.settings?.target_ovr || 122, 10));
        setEnabled(data.settings?.enabled !== undefined ? Boolean(data.settings.enabled) : true);
        setAllowOtherInExchanges(Boolean(data.settings?.allow_other_in_exchanges));
        setExclusiveCards(data.exclusiveCards || []);
        setTargetOvrCards(data.targetOvrCards || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load exchange exclusive settings' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Network connection failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/exchange-exclusive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          target_ovr: parseInt(targetOvr, 10),
          enabled,
          allow_other_in_exchanges: allowOtherInExchanges
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchData(); // Reload card list matching new target OVR
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network failure while saving settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleCard = async (card, currentlyExclusive) => {
    const assetId = card.assetId || card.id;
    setTogglingId(assetId);
    setMessage({ type: '', text: '' });

    const newExcl = !currentlyExclusive;

    // Optimistic UI update
    setTargetOvrCards(prev => prev.map(c => {
      if ((c.assetId || c.id) === assetId) {
        return { ...c, isExchangeExclusive: newExcl, exchange_exclusive: newExcl ? 1 : 0 };
      }
      return c;
    }));

    if (newExcl) {
      setExclusiveCards(prev => [...prev.filter(c => (c.assetId || c.id) !== assetId), { ...card, isExchangeExclusive: true }]);
    } else {
      setExclusiveCards(prev => prev.filter(c => (c.assetId || c.id) !== assetId));
    }

    try {
      const res = await fetch('/api/exchange-exclusive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_card',
          assetId,
          exclusive: newExcl
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `✅ ${card.cardName || card.name} (${card.rating} OVR) is now ${newExcl ? 'EXCHANGE EXCLUSIVE ONLY (Removed from drafts)' : 'STANDARD (Available in drafts)'}!`
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update card exclusivity' });
        await fetchData(); // Revert on failure
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network failure while toggling card' });
      await fetchData();
    } finally {
      setTogglingId(null);
    }
  };

  const handleForceRefreshPool = async () => {
    if (!confirm('Are you sure you want to force-rotate the active Discord Exchange Pool right now?')) return;
    setRefreshingPool(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/exchange-exclusive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh_pool' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Exchange Pool cache cleared! Bot will regenerate exclusively with selected cards.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset pool' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error resetting pool' });
    } finally {
      setRefreshingPool(false);
    }
  };

  const filteredCards = targetOvrCards.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (c.cardName || c.name || '').toLowerCase();
    const pos = (c.position || '').toLowerCase();
    const club = (c.club?.name || c.club || '').toLowerCase();
    const nation = (c.nation?.name || c.nation || '').toLowerCase();
    return name.includes(q) || pos.includes(q) || club.includes(q) || nation.includes(q);
  });

  const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-orange-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400 shrink-0">
                <ArrowRightLeft className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
                    Exchange Exclusive Players
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-500/15 text-amber-300 border-amber-500/30">
                    OVR {targetOvr} Tier
                  </span>
                </div>
                <p className="text-sm text-[var(--text-main)] opacity-70 mt-1">
                  Selected {targetOvr} OVR cards become strictly <strong>Exchange Exclusive</strong> (removed from Drafts). All other {targetOvr}s remain Draft-exclusive and never appear in /exchange.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleForceRefreshPool}
                disabled={refreshingPool}
                className="px-4 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-bold text-[var(--text-main)] opacity-80 hover:opacity-100 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingPool ? 'animate-spin' : ''}`} />
                <span>Rotate Exchange Pool Now</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {message.text && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              message.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Configuration Card (Future Proofing OVR Setting) */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-pink-400" />
                <h2 className="text-base font-bold text-[var(--text-main)]">
                  Tier & Future-Proofing Configuration
                </h2>
              </div>
              <span className="text-xs text-[var(--text-main)] opacity-50">
                Dynamically upgrade when higher OVRs (123, 124, 125+) release
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] opacity-70 uppercase tracking-wider mb-2">
                  Exchange Exclusive Target Rating (OVR)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="115"
                    max="135"
                    value={targetOvr}
                    onChange={(e) => setTargetOvr(parseInt(e.target.value) || 122)}
                    className="w-32 px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] font-mono font-bold text-amber-300 text-lg focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-xs text-[var(--text-main)] opacity-50">
                    Default: 122 OVR
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1.5">
                  Change this anytime new event seasons introduce 123+, 124+, or 125+ players.
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-bold text-[var(--text-main)] opacity-70 uppercase tracking-wider mb-2">
                  Segregation System
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-main)]">
                    {enabled ? 'Active Strict Segregation' : 'System Disabled'}
                  </span>
                </label>
                <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1.5">
                  When active, selected cards never appear in drafts.
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-bold text-[var(--text-main)] opacity-70 uppercase tracking-wider mb-2">
                  Other {targetOvr}s in Exchanges
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={allowOtherInExchanges}
                      onChange={(e) => setAllowOtherInExchanges(e.target.checked)}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${allowOtherInExchanges ? 'bg-cyan-500' : 'bg-zinc-700'}`} />
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${allowOtherInExchanges ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-main)]">
                    {allowOtherInExchanges ? 'Allowed in Exchanges' : 'Exclusive ONLY'}
                  </span>
                </label>
                <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1.5">
                  {allowOtherInExchanges ? `Exclusives stay locked out of drafts, but non-exclusive ${targetOvr}s can roll in exchanges too.` : `Only your selected exclusive cards can ever appear in exchanges.`}
                </p>
              </div>

              <div className="flex items-end justify-start md:justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-main)] opacity-60">Exchange Exclusives Active</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {targetOvrCards.filter(c => c.isExchangeExclusive).length} <span className="text-xs text-[var(--text-main)] opacity-50 font-sans">cards</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-main)] opacity-60">Draft Pool Active ({targetOvr} OVR)</div>
                <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">
                  {targetOvrCards.filter(c => !c.isExchangeExclusive).length} <span className="text-xs text-[var(--text-main)] opacity-50 font-sans">cards</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Unlock className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-main)] opacity-60">Total {targetOvr} OVR in Database</div>
                <div className="text-2xl font-black text-purple-400 font-mono mt-0.5">
                  {targetOvrCards.length} <span className="text-xs text-[var(--text-main)] opacity-50 font-sans">cards</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Player Management Grid */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                  <span>Manage {targetOvr} OVR Player Exclusivity</span>
                </h3>
                <p className="text-xs text-[var(--text-main)] opacity-60 mt-0.5">
                  Click <strong>Make Exclusive</strong> to restrict a player to /exchange only. Unlocked players appear in Drafts.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[var(--text-main)] opacity-60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter player name..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center text-[var(--text-main)] opacity-60 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                <p className="text-xs font-semibold">Loading {targetOvr} OVR Database...</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <p className="text-sm font-bold text-[var(--text-main)]">No {targetOvr} OVR players found</p>
                <p className="text-xs text-[var(--text-main)] opacity-50">Try clearing your search query or check the Card Database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCards.map((card) => {
                  const assetId = card.assetId || card.id;
                  const isExcl = card.isExchangeExclusive;
                  const isBusy = togglingId === assetId;

                  return (
                    <div
                      key={assetId}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isExcl
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-[var(--input-bg)] border-[var(--border-glass)] hover:border-pink-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Rating Badge */}
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                          isExcl
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          <span className="text-base font-black leading-none">{card.rating}</span>
                          <span className="text-[9px] font-bold opacity-80 mt-0.5">{card.position}</span>
                        </div>

                        {/* Player Metadata */}
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[var(--text-main)] truncate">
                              {card.cardName || card.name}
                            </span>
                            {isExcl && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-black shrink-0">
                                EXCL
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-main)] opacity-60 truncate">
                            {card.club?.name || card.club || 'Club'} • {card.nation?.name || card.nation || 'Nation'}
                          </div>
                          <div className="text-[10px] text-pink-400 font-mono truncate mt-0.5">
                            #{assetId}
                          </div>
                        </div>
                      </div>

                      {/* Status & Toggle Button */}
                      <div className="pt-4 border-t border-[var(--border-glass)] mt-3 flex items-center justify-between">
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          isExcl ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {isExcl ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{isExcl ? 'Exchange Only' : 'Draft Active'}</span>
                        </span>

                        <button
                          onClick={() => handleToggleCard(card, isExcl)}
                          disabled={isBusy}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isExcl
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                              : 'bg-[var(--card-bg)] hover:bg-[var(--card-bg)] text-[var(--text-main)] opacity-80 hover:opacity-100 border border-[var(--border-glass)]'
                          } disabled:opacity-40`}
                        >
                          {isBusy ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : isExcl ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Make Normal</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>Set Exclusive</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
