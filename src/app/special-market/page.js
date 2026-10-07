'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Crown, Zap, Clock, Coins, Plus, Trash2, Save, AlertCircle, CheckCircle2, 
  Shield, Radio, Sparkles, RefreshCw, Gift, UserPlus, Search, X, User,
  Layers, Flame
} from 'lucide-react';

export default function SpecialMarketAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isActive, setIsActive] = useState(false);
  const [closesAt, setClosesAt] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [title, setTitle] = useState('👑 OWNER VIP SPECIAL MARKET 👑');
  const [channels, setChannels] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [pingType, setPingType] = useState('none');

  // Custom deals list
  const [rewards, setRewards] = useState([
    {
      id: "vip_1",
      deal_type: "voucher", // "voucher" | "player" | "custom_card"
      title: "100x Mega Voucher Treasury",
      description: "100 Draft Vouchers + VIP Pass",
      cost_coins: 1000000000,
      vouchers: 100,
      player_data: null
    },
    {
      id: "vip_2",
      deal_type: "voucher",
      title: "250x Imperial Voucher Hoard",
      description: "250 Draft Vouchers",
      cost_coins: 2500000000,
      vouchers: 250,
      player_data: null
    }
  ]);

  // Card search & picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRewardIndex, setPickerRewardIndex] = useState(null);
  const [pickerTab, setPickerTab] = useState('custom'); // 'custom' | 'official'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Catalog custom cards list
  const [customDraftCards, setCustomDraftCards] = useState([]);
  const [customSignatureCards, setCustomSignatureCards] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    fetchMarketData();
    fetchCustomCards();
  }, []);

  const fetchCustomCards = async () => {
    setLoadingCustom(true);
    try {
      const res = await fetch('/api/custom-cards');
      const data = await res.json();
      if (data.success) {
        setCustomDraftCards(data.draftCards || data.cards || []);
        setCustomSignatureCards(data.signatureCards || []);
      }
    } catch (e) {
      console.error('Error fetching custom cards:', e);
    } finally {
      setLoadingCustom(false);
    }
  };

  // Official card search debounce
  useEffect(() => {
    if (!pickerOpen || pickerTab !== 'official') return;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/renderz/cards?query=${encodeURIComponent(searchQuery.trim())}&size=12`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.cards || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, pickerOpen, pickerTab]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/special-market');
      const data = await res.json();
      if (data.success && data.data) {
        setIsActive(Boolean(data.data.is_active));
        setClosesAt(data.data.closes_at);
        setDurationMinutes(data.data.duration_minutes || 60);
        setTitle(data.data.title || '👑 OWNER VIP SPECIAL MARKET 👑');
        setChannels(data.data.channels || []);
        setRoleId(data.data.role_id || '');
        setPingType(data.data.ping_type || 'none');
        if (data.data.custom_rewards && data.data.custom_rewards.length > 0) {
          setRewards(data.data.custom_rewards);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNow = async () => {
    const dur = parseInt(durationMinutes) || 60;
    if (!confirm(`Open the VIP Special Market right now for ${dur} minutes? The announcement and deal controls will be broadcasted to your target channels in Discord!`)) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/special-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_now',
          title,
          custom_rewards: rewards,
          channels,
          role_id: roleId,
          ping_type: pingType,
          duration_minutes: dur
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsActive(true);
        setMessage({ type: 'success', text: `👑 The VIP Special Market is NOW LIVE for ${dur} minutes in Discord!` });
        fetchMarketData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to open Special Market' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNow = async () => {
    if (!confirm('Close the VIP Special Market immediately?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/special-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close_now' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsActive(false);
        setMessage({ type: 'success', text: 'VIP Special Market has been closed manually.' });
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
      const res = await fetch('/api/special-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          title,
          custom_rewards: rewards,
          channels,
          role_id: roleId,
          ping_type: pingType,
          duration_minutes: parseInt(durationMinutes) || 60
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'VIP Special Market configuration saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addVoucherReward = () => {
    const newId = `vip_${Date.now()}`;
    setRewards([
      ...rewards,
      {
        id: newId,
        deal_type: "voucher",
        title: "Exclusive Voucher Treasury",
        description: "50 Draft Vouchers",
        cost_coins: 500000000,
        vouchers: 50,
        player_data: null
      }
    ]);
  };

  const addCustomCardReward = () => {
    const newId = `vip_${Date.now()}`;
    const newIndex = rewards.length;
    setRewards([
      ...rewards,
      {
        id: newId,
        deal_type: "custom_card",
        title: "✨ Special Custom Card Deal",
        description: "Exclusive Custom Creation",
        cost_coins: 2000000000,
        vouchers: 0,
        player_data: null
      }
    ]);
    // Automatically open custom card tab in picker
    setPickerRewardIndex(newIndex);
    setPickerTab('custom');
    setSearchQuery('');
    setPickerOpen(true);
  };

  const addOfficialPlayerReward = () => {
    const newId = `vip_${Date.now()}`;
    const newIndex = rewards.length;
    setRewards([
      ...rewards,
      {
        id: newId,
        deal_type: "player",
        title: "⭐ Superstar Player Deal",
        description: "Official High-OVR Card",
        cost_coins: 1000000000,
        vouchers: 0,
        player_data: null
      }
    ]);
    // Automatically open official card search for this slot
    setPickerRewardIndex(newIndex);
    setPickerTab('official');
    setSearchQuery('');
    setSearchResults([]);
    setPickerOpen(true);
  };

  const openPlayerPickerFor = (idx, defaultTab = 'custom') => {
    setPickerRewardIndex(idx);
    setPickerTab(defaultTab);
    setSearchQuery('');
    setSearchResults([]);
    setPickerOpen(true);
  };

  const selectCardForReward = (card, isCustom = false) => {
    if (pickerRewardIndex === null) return;
    const ovr = card.rating || card.ovr || 120;
    const name = card.cardName || card.lastName || card.player_name || card.card_name || 'Superstar';
    const pos = card.position || 'ST';
    
    // Suggested pricing based on OVR & custom status
    let baseCost = 1500000000;
    if (isCustom) {
      baseCost = ovr >= 125 ? 5000000000 : (ovr >= 120 ? 3000000000 : 1500000000);
    } else {
      baseCost = ovr >= 122 ? 3000000000 : (ovr >= 120 ? 1500000000 : 750000000);
    }

    // Format normalized player_data payload for inventory insertion
    const normalizedData = {
      ...card,
      id: card.id || card.custom_id || `custom_${Date.now()}`,
      cardName: name,
      lastName: name,
      player_name: name,
      rating: ovr,
      ovr: ovr,
      position: pos,
      is_custom: Boolean(isCustom || card.is_custom),
      performance_boost: card.performance_boost || card.matchBoost || 1.15
    };

    const updated = [...rewards];
    updated[pickerRewardIndex] = {
      ...updated[pickerRewardIndex],
      deal_type: isCustom ? "custom_card" : "player",
      title: `${isCustom ? '✨ [CUSTOM] ' : '⭐ '}${name} (${ovr} OVR, ${pos})`,
      description: isCustom ? `Custom Master Card • ${pos} • ${ovr} OVR` : `${ovr} OVR ${pos} • ${card.club?.name || 'Club'} / ${card.nation?.name || 'Nation'}`,
      cost_coins: updated[pickerRewardIndex].cost_coins || baseCost,
      vouchers: 0,
      player_data: normalizedData
    };
    setRewards(updated);
    setPickerOpen(false);
    setPickerRewardIndex(null);
  };

  const removeReward = (idx) => {
    const updated = [...rewards];
    updated.splice(idx, 1);
    setRewards(updated);
  };

  const updateReward = (idx, field, val) => {
    const updated = [...rewards];
    updated[idx] = { ...updated[idx], [field]: val };
    setRewards(updated);
  };

  const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // Filtered custom cards based on search query
  const filteredCustomCards = [...customDraftCards, ...customSignatureCards].filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const cName = (c.cardName || c.card_name || c.player_name || '').toLowerCase();
    const cClub = (c.clubName || c.club?.name || '').toLowerCase();
    return cName.includes(q) || cClub.includes(q);
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-8 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-black flex items-center justify-center text-amber-300 shadow-lg shadow-amber-900/30 flex-shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-300 flex flex-wrap items-center gap-2">
                VIP Special Market
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  OWNER-ONLY • MANUAL
                </span>
              </h1>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-70">
              Exclusive high-roller bazaar that <strong>never opens randomly</strong>. You can summon this market, customize time, add <strong>Custom Cards</strong>, pick official players, and set custom coin prices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {isActive ? (
              <button
                type="button"
                onClick={handleCloseNow}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Close Market Now
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerNow}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-black text-xs font-black shadow-lg shadow-amber-500/25 hover:opacity-90 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Summon VIP Market ({durationMinutes}m)
              </button>
            )}

            <LiquidButton onClick={handleSaveSettings} disabled={saving} loading={saving} className="flex-1 sm:flex-initial justify-center">
              <Save className="w-4 h-4" />
              Save Settings
            </LiquidButton>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border ${
            message.type === 'success' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-amber-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />}
            <span className="break-words">{message.text}</span>
          </div>
        )}

        {/* Status Card & Duration Controls */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-black to-yellow-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                Live Status: <span className={isActive ? 'text-emerald-400 font-black' : 'text-neutral-400 font-bold'}>{isActive ? 'LIVE IN DISCORD (/specialmarket UNLOCKED)' : 'CLOSED (AWAITING YOUR MANUAL SUMMON)'}</span>
              </h2>
            </div>
            {closesAt && isActive && (
              <div className="text-xs text-amber-300 font-mono bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                Closes: {new Date(closesAt).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Custom VIP Market Duration (Minutes)
              </label>
              <p className="text-[11px] text-[var(--text-main)] opacity-70">
                Set how long this market will stay open when triggered (e.g. 15m, 30m, 60m, 120m, or 1440m for 24h).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[var(--input-bg)] border border-amber-500/30 rounded-2xl px-3 py-1.5">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center font-mono font-bold text-sm text-amber-300 bg-transparent focus:outline-none"
                />
                <span className="text-xs font-bold text-[var(--text-muted)]">mins</span>
              </div>

              {/* Quick preset pills */}
              <div className="flex items-center gap-1">
                {[15, 30, 60, 120, 360, 1440].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationMinutes === m 
                        ? 'bg-amber-500 text-black shadow-md' 
                        : 'bg-[var(--card-bg)] text-amber-300/80 hover:bg-amber-500/20 border border-amber-500/20'
                    }`}
                  >
                    {m >= 60 ? `${m/60}h` : `${m}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Title & Target Channels */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              Event Announcement & Target Channels
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Same channels & ping support</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Market Event Banner Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Broadcast Discord Channel IDs (Comma or Space Separated)
              </label>
              <textarea
                rows={2}
                placeholder="Leave blank to use standard Black Market channels, or specify custom IDs"
                value={Array.isArray(channels) ? channels.join(', ') : (channels || '')}
                onChange={e => {
                  const arr = e.target.value.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
                  setChannels(arr);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Ping Target Type
              </label>
              <select
                value={pingType}
                onChange={e => setPingType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="none">🔕 No Ping (Clean Embed Only)</option>
                <option value="everyone">🔔 Ping @everyone</option>
                <option value="here">📍 Ping @here (Online Members)</option>
                <option value="role">👥 Ping Specific Role</option>
              </select>
            </div>

            {pingType === 'role' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Discord Role ID to Ping
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1557010712013045860"
                  value={roleId}
                  onChange={e => setRoleId(e.target.value.trim())}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Custom Deals & Prices Config */}
        <div className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-glass)] gap-3">
            <div>
              <h2 className="text-base font-bold text-yellow-300 flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                VIP Rewards & Player Cards
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Configure deals with Custom Cards from your catalog, official FC Mobile cards, or vouchers</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={addCustomCardReward}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:opacity-90 text-xs font-black flex items-center gap-1.5 shadow-md shadow-fuchsia-600/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                + Add Custom Card Deal
              </button>
              <button
                type="button"
                onClick={addOfficialPlayerReward}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Add Official Card
              </button>
              <button
                type="button"
                onClick={addVoucherReward}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Voucher Deal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewards.map((r, i) => {
              const isPlayer = Boolean(r.player_data) || r.deal_type === 'player' || r.deal_type === 'custom_card';
              const card = r.player_data;
              const isCustom = r.deal_type === 'custom_card' || Boolean(card?.is_custom);
              const ovr = card ? (card.rating || card.ovr) : null;

              return (
                <div key={r.id || i} className={`p-4 rounded-2xl bg-[var(--input-bg)] border space-y-3 relative group transition-all ${
                  isCustom 
                    ? 'border-fuchsia-500/40 bg-gradient-to-b from-fuchsia-950/20 to-[var(--input-bg)] shadow-md shadow-fuchsia-950/20' 
                    : isPlayer 
                      ? 'border-amber-400/40 bg-gradient-to-b from-amber-950/20 to-[var(--input-bg)]' 
                      : 'border-amber-500/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      {isCustom ? (
                        <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                      ) : isPlayer ? (
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Gift className="w-3.5 h-3.5 text-yellow-400" />
                      )}
                      VIP Slot #{i + 1} 
                      {isCustom && <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-bold">✨ CUSTOM CARD</span>}
                      {!isCustom && isPlayer && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">OFFICIAL PLAYER</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeReward(i)}
                      className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Player Card Preview & Selection */}
                  {isPlayer && (
                    <div className={`p-3 rounded-xl bg-black/40 border flex items-center gap-3 ${
                      isCustom ? 'border-fuchsia-500/30' : 'border-amber-500/30'
                    }`}>
                      {card ? (
                        <>
                          <div className={`relative w-14 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-neutral-900 border ${
                            isCustom ? 'border-fuchsia-500/50' : 'border-amber-500/40'
                          }`}>
                            {card.imageUrl ? (
                              <img
                                src={getProxyUrl(card.imageUrl)}
                                alt=""
                                className="w-full h-full object-contain"
                              />
                            ) : card.images?.playerCardBackground ? (
                              <>
                                <img
                                  src={getProxyUrl(card.images.playerCardBackground)}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                />
                                {card.images?.playerCardImage || card.images?.playerImage ? (
                                  <img
                                    src={getProxyUrl(card.images.playerCardImage || card.images.playerImage)}
                                    alt=""
                                    className="relative z-10 w-12 h-12 object-contain"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-amber-400" />
                                )}
                              </>
                            ) : card.images?.playerCardImage || card.images?.playerImage ? (
                              <img
                                src={getProxyUrl(card.images.playerCardImage || card.images.playerImage)}
                                alt=""
                                className="relative z-10 w-12 h-12 object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-pink-900 flex flex-col items-center justify-center text-white">
                                <span className="text-[10px] font-black">{ovr}</span>
                                <span className="text-[8px] opacity-75">{card.position || 'ST'}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-black ${isCustom ? 'text-fuchsia-400' : 'text-amber-400'}`}>{ovr} OVR</span>
                              <span className="text-[10px] font-bold text-neutral-400">{card.position || 'ST'}</span>
                              {isCustom && <span className="text-[9px] font-mono text-fuchsia-300">Custom</span>}
                            </div>
                            <div className="text-xs font-bold text-[var(--text-main)] truncate">
                              {card.cardName || card.lastName || card.player_name || card.card_name}
                            </div>
                            <button
                              type="button"
                              onClick={() => openPlayerPickerFor(i, isCustom ? 'custom' : 'official')}
                              className={`text-[10px] font-bold hover:underline mt-1 cursor-pointer ${
                                isCustom ? 'text-fuchsia-400' : 'text-amber-400'
                              }`}
                            >
                              Change Card Selection →
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs text-neutral-400">{isCustom ? 'No custom card chosen' : 'No card selected'}</span>
                          <button
                            type="button"
                            onClick={() => openPlayerPickerFor(i, isCustom ? 'custom' : 'official')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCustom ? 'bg-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/40' : 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/40'
                            }`}
                          >
                            Select Card
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Title</label>
                    <input
                      type="text"
                      value={r.title}
                      onChange={e => updateReward(i, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Subtitle / Description</label>
                    <input
                      type="text"
                      value={r.description || ''}
                      onChange={e => updateReward(i, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                        {isPlayer ? "Bonus Vouchers" : "Draft Vouchers"}
                      </label>
                      <input
                        type="number"
                        value={r.vouchers || 0}
                        onChange={e => updateReward(i, 'vouchers', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Price (Coins)</label>
                      <input
                        type="number"
                        step="10000000"
                        value={r.cost_coins || 0}
                        onChange={e => updateReward(i, 'cost_coins', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unified Card Picker Modal (Tabs: Custom Cards vs Official Cards) */}
        {pickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-3xl rounded-3xl border border-amber-500/40 p-6 space-y-5 bg-gradient-to-b from-neutral-900 to-black max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-amber-300">Choose Card for VIP Special Market</h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setPickerOpen(false); setPickerRewardIndex(null); }}
                  className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Switcher: Custom Cards vs Official RenderZ */}
              <div className="flex items-center gap-2 p-1 bg-neutral-950/80 rounded-2xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setPickerTab('custom'); setSearchQuery(''); }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pickerTab === 'custom'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Catalog Custom Cards ({customDraftCards.length + customSignatureCards.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setPickerTab('official'); setSearchQuery(''); }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pickerTab === 'official'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Official FC Mobile Database
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={
                    pickerTab === 'custom'
                      ? "Filter custom cards by name..."
                      : "Search official player name (e.g. Messi, Ronaldo, Cruyff, Mbappe)..."
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-amber-500/30 text-sm text-[var(--text-main)] focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Results Container */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
                {/* 1. Custom Cards Tab */}
                {pickerTab === 'custom' && (
                  <div>
                    {loadingCustom ? (
                      <div className="py-16 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400 mx-auto" />
                        <p className="text-xs text-neutral-400 mt-2">Loading custom cards...</p>
                      </div>
                    ) : filteredCustomCards.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredCustomCards.map((card, idx) => {
                          const ovr = card.rating || card.ovr || 120;
                          const name = card.cardName || card.card_name || card.player_name || 'Custom';
                          const pos = card.position || 'ST';
                          const isSig = card.type === 'signature_box_custom' || card.box_id;

                          return (
                            <div
                              key={card.id || card.custom_id || idx}
                              onClick={() => selectCardForReward(card, true)}
                              className="p-3 rounded-2xl bg-gradient-to-br from-fuchsia-950/40 to-neutral-950 border border-fuchsia-500/30 hover:border-fuchsia-400 hover:scale-[1.02] flex items-center gap-3 cursor-pointer transition-all group"
                            >
                              <div className="relative w-12 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-black border border-fuchsia-500/40 group-hover:border-fuchsia-300">
                                {card.imageUrl ? (
                                  <img
                                    src={getProxyUrl(card.imageUrl)}
                                    alt=""
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-tr from-pink-600 to-purple-600 flex flex-col items-center justify-center text-white">
                                    <span className="text-[10px] font-black">{ovr}</span>
                                    <span className="text-[8px] opacity-80">{pos}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-fuchsia-400">{ovr} OVR</span>
                                  <span className="text-[10px] font-bold text-neutral-400">{pos}</span>
                                  {isSig && <span className="text-[8px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200">SIG</span>}
                                </div>
                                <div className="text-xs font-bold text-white truncate">{name}</div>
                                <div className="text-[10px] text-fuchsia-300/80 truncate">
                                  {card.clubName || card.club?.name || 'Custom Master'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-xs text-neutral-500">
                        {searchQuery ? `No custom cards matching "${searchQuery}"` : "No custom cards found in your catalog. Create one first in the Custom Cards tab!"}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Official FC Mobile Cards Tab */}
                {pickerTab === 'official' && (
                  <div>
                    {searchLoading ? (
                      <div className="py-16 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                        <p className="text-xs text-neutral-400 mt-2">Searching RenderZ database...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {searchResults.map((card) => {
                          const ovr = card.rating || card.ovr;
                          const name = card.cardName || card.lastName || card.player_name;
                          return (
                            <div
                              key={card.id || card.assetId}
                              onClick={() => selectCardForReward(card, false)}
                              className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-400 hover:bg-amber-950/20 flex items-center gap-3 cursor-pointer transition-all group"
                            >
                              <div className="relative w-12 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-black border border-neutral-700 group-hover:border-amber-400">
                                {card.images?.playerCardBackground && (
                                  <img
                                    src={getProxyUrl(card.images.playerCardBackground)}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                  />
                                )}
                                {card.images?.playerCardImage || card.images?.playerImage ? (
                                  <img
                                    src={getProxyUrl(card.images.playerCardImage || card.images.playerImage)}
                                    alt=""
                                    className="relative z-10 w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-amber-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-amber-400">{ovr} OVR</span>
                                  <span className="text-[10px] font-bold text-neutral-400">{card.position}</span>
                                </div>
                                <div className="text-xs font-bold text-white truncate">{name}</div>
                                <div className="text-[10px] text-neutral-400 truncate">{card.club?.name || card.program?.name || 'Player'}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : searchQuery ? (
                      <div className="py-16 text-center text-xs text-neutral-500">
                        No players found matching "{searchQuery}". Try a different spelling or last name.
                      </div>
                    ) : (
                      <div className="py-16 text-center text-xs text-neutral-500">
                        Type a player name above to search through thousands of official FC Mobile cards.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
