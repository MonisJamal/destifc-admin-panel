'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import ImageUpload from '@/components/ImageUpload';
import DateTimePicker from '@/components/DateTimePicker';
import { Gift, Sparkles, Shield, Coins, Ticket, Gem, Users, Box, RefreshCw, Save, CheckCircle2, AlertCircle, Trash2, Plus, Clock, Eye, Info, Calendar } from 'lucide-react';

export default function SignatureBoxAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Main Box State
  const [title, setTitle] = useState('FC SIGNATURE BOX');
  const [subtitle, setSubtitle] = useState('Exclusive 10-Reward Limited Box Draw');
  const [isActive, setIsActive] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');
  const [startsAt, setStartsAt] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);

  // Exclusive Signature Card
  const [cardName, setCardName] = useState('Zinedine Zidane');
  const [cardRating, setCardRating] = useState(124);
  const [cardPosition, setCardPosition] = useState('CAM');
  const [cardClub, setCardClub] = useState('Real Madrid');
  const [cardNation, setCardNation] = useState('France');
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState('');
  const [cardBoost, setCardBoost] = useState(1.25);

  // 10 Rewards
  const [rewards, setRewards] = useState([]);

  // 10 Draw Costs
  const [drawCosts, setDrawCosts] = useState([]);

  useEffect(() => {
    fetchBox();
  }, []);

  const fetchBox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/signature-box');
      const data = await res.json();
      if (data.success && data.box) {
        const b = data.box;
        setTitle(b.title || 'FC SIGNATURE BOX');
        setSubtitle(b.subtitle || '10 Exclusive Limited Time Rewards');
        setIsActive(b.is_active !== undefined ? b.is_active : true);
        setBannerUrl(b.banner_url || '');
        setStartsAt(b.starts_at || null);
        setExpiresAt(b.expires_at || null);

        const card = b.signature_card_data || {};
        setCardName(card.cardName || 'Zinedine Zidane');
        setCardRating(card.rating || 124);
        setCardPosition(card.position || 'CAM');
        setCardClub(card.club?.name || 'Real Madrid');
        setCardNation(card.nation?.name || 'France');
        setCardBackgroundUrl(card.custom_background_url || card.images?.playerImage || '');
        setCardBoost(card.performance_boost || 1.25);

        setRewards(b.rewards_json || []);
        setDrawCosts(b.draw_costs_json || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRewardChange = (index, field, value) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], [field]: value };
    setRewards(updated);
  };

  const handleCostChange = (index, field, value) => {
    const updated = [...drawCosts];
    updated[index] = { ...updated[index], [field]: field === 'amount' ? parseInt(value, 10) || 0 : value };
    setDrawCosts(updated);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        title,
        subtitle,
        is_active: isActive,
        banner_url: bannerUrl,
        starts_at: startsAt,
        expires_at: expiresAt,
        signature_card_data: {
          id: `sig_${cardName.toLowerCase().replace(/\s+/g, '_')}_${cardRating}`,
          cardName,
          player_name: cardName,
          rating: parseInt(cardRating, 10),
          position: cardPosition,
          club: { name: cardClub },
          nation: { name: cardNation },
          source: 'SIGNATURE_BOX',
          is_signature_box: true,
          is_custom: true,
          performance_boost: parseFloat(cardBoost) || 1.25,
          custom_background_url: cardBackgroundUrl,
          images: {
            playerImage: cardBackgroundUrl,
            playerCardImage: cardBackgroundUrl
          }
        },
        rewards_json: rewards,
        draw_costs_json: drawCosts
      };

      const res = await fetch('/api/signature-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Signature Box saved and synchronized live to Discord Bot.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save Signature Box' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error: ' + (err.message || 'Unknown Payload Error') });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteBox = async () => {
    if (!confirm('Are you sure you want to delete and close the active Signature Box? The event will be closed in Discord.')) return;
    try {
      const res = await fetch('/api/signature-box?action=clear_box', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIsActive(false);
        setTitle('NO ACTIVE SIGNATURE BOX');
        setSubtitle('Event Closed');
        setBannerUrl('');
        setStartsAt(null);
        setExpiresAt(null);
        setMessage({ type: 'success', text: 'Signature Box has been deleted and closed in Discord.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete box' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: `Network error: ${e.message}` });
    }
  };

  const handleResetUserDraws = async () => {
    if (!confirm('Are you sure you want to reset all players Signature Box progress? They will start from Draw #1 again.')) return;
    try {
      const res = await fetch('/api/signature-box', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Successfully reset all user Signature Box draws.');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert(`Network error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-[var(--text-main)] opacity-70 font-medium">
            <RefreshCw className="w-6 h-6 animate-spin text-fuchsia-400" />
            Loading Signature Box Editor...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans selection:bg-fuchsia-500/30">
      <Sidebar />

      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-glass)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-[var(--text-main)] shadow-lg shadow-fuchsia-500/20">
                <Gift className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
                Signature Box Manager
              </h1>
            </div>
            <p className="text-sm text-[var(--text-main)] opacity-70">
              Create and schedule limited-time 10-reward Signature Box draws with non-repeatable prizes and increasing costs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDeleteBox}
              className="px-3.5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/15 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Delete and close active box"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Active Box
            </button>
            <button
              type="button"
              onClick={handleResetUserDraws}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--border-glass)] text-purple-300 hover:bg-purple-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Player Progress
            </button>
            <LiquidButton onClick={handleSave} disabled={saving} loading={saving}>
              <Save className="w-4 h-4" />
              Save and Publish Live
            </LiquidButton>
          </div>
        </div>

        {/* Status Alerts */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            message.type === 'success' ? 'bg-fuchsia-950/40 border border-fuchsia-500/40 text-fuchsia-200' : 'bg-red-950/40 border border-red-500/40 text-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-fuchsia-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Top Grid: General Settings + Exclusive Signature Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Box Header Settings */}
            <div className="lg:col-span-5 bg-[var(--card-bg)]/50 border border-[var(--border-glass)] rounded-3xl p-6 backdrop-blur-xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
                <Gift className="w-5 h-5 text-fuchsia-400" />
                Box Configuration and Scheduling
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Box Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                  placeholder="e.g. FC SIGNATURE BOX"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                  placeholder="e.g. 10 Exclusive Limited Time Rewards"
                />
              </div>

              {/* Event Status Toggle */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Box Visibility Status</label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300 shadow-sm shadow-fuchsia-500/10'
                      : 'bg-[var(--input-bg)] border-purple-900/40 text-[var(--text-main)] opacity-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-fuchsia-400 animate-pulse' : 'bg-neutral-600'}`} />
                  {isActive ? 'ACTIVE & VISIBLE IN DISCORD' : 'DISABLED / CLOSED'}
                </button>
              </div>

              {/* Event Scheduling Dates with DateTimePicker */}
              <div className="space-y-4 pt-2 border-t border-[var(--border-glass)]">
                <DateTimePicker
                  value={startsAt}
                  onChange={setStartsAt}
                  label="Event Start Date & Time"
                  helperText="When box unlocks for players"
                  presets={[
                    { label: "Start Now", hours: 0 },
                    { label: "+1 Hour", hours: 1 },
                    { label: "+6 Hours", hours: 6 },
                    { label: "+1 Day", hours: 24 }
                  ]}
                />

                <DateTimePicker
                  value={expiresAt}
                  onChange={setExpiresAt}
                  label="Event End Date & Time"
                  helperText="When box expires and closes"
                  presets={[
                    { label: "+1 Day", hours: 24 },
                    { label: "+3 Days", hours: 72 },
                    { label: "+7 Days", hours: 168 },
                    { label: "+14 Days", hours: 336 },
                    { label: "+30 Days", hours: 720 }
                  ]}
                />
              </div>

              {/* Banner Image Upload */}
              <div className="pt-2 border-t border-[var(--border-glass)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[var(--text-main)] opacity-90 uppercase tracking-wider">Event Banner Image</span>
                  <span className="text-[11px] text-fuchsia-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Header image for Discord embed
                  </span>
                </div>
                <ImageUpload
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  aspectRatio="banner"
                  label=""
                  helperText="Upload wide promo banner (.png or .webp)"
                />
              </div>
            </div>

            {/* Signature Exclusive Card Customizer */}
            <div className="lg:col-span-7 bg-[var(--card-bg)]/50 border border-[var(--border-glass)] rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden space-y-4">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-lg font-bold flex items-center gap-2 text-fuchsia-300">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                Featured Exclusive Signature Card (Good Reward #10)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Player Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none font-semibold text-[var(--text-main)]"
                    placeholder="e.g. Zinedine Zidane"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">OVR Rating (120 - 125)</label>
                  <input
                    type="number"
                    min="115"
                    max="125"
                    value={cardRating}
                    onChange={(e) => setCardRating(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none font-bold text-fuchsia-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Position</label>
                  <input
                    type="text"
                    value={cardPosition}
                    onChange={(e) => setCardPosition(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                    placeholder="CAM, ST, RW, CB..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">In-Game Match Buff Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="2.0"
                    value={cardBoost}
                    onChange={(e) => setCardBoost(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none text-fuchsia-300 font-semibold"
                    placeholder="1.25 (+25% buff)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Club Name</label>
                  <input
                    type="text"
                    value={cardClub}
                    onChange={(e) => setCardClub(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                    placeholder="Real Madrid, Barcelona..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5 uppercase tracking-wider">Nation Name</label>
                  <input
                    type="text"
                    value={cardNation}
                    onChange={(e) => setCardNation(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                    placeholder="France, Argentina..."
                  />
                </div>

                {/* Card Art / Player Render Upload */}
                <div className="md:col-span-2">
                  <ImageUpload
                    value={cardBackgroundUrl}
                    onChange={setCardBackgroundUrl}
                    label="Signature Card Image / Render (.png / .webp)"
                    helperText="Upload transparent player cut-out or card graphic (.png or .webp)"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center gap-3 text-xs text-fuchsia-300">
                <Shield className="w-4 h-4 flex-shrink-0 text-fuchsia-400" />
                <span>This card is exclusive to the Signature Box with 1% initial drop rate and custom in-game match aura. It will not appear in regular drafts or exchanges.</span>
              </div>
            </div>
          </div>

          {/* 10 Rewards Matrix */}
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border-glass)] rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
                  <Box className="w-5 h-5 text-fuchsia-400" />
                  10-Reward Pool Matrix (2 Bad, 5 Mid, 3 Good)
                </h2>
                <p className="text-xs text-[var(--text-main)] opacity-70 mt-1">
                  Configure the 10 rewards. Each reward can only be won once per player cycle.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {rewards.map((r, idx) => {
                const tierColor = r.tier === 'good' ? 'border-fuchsia-500/40 bg-fuchsia-500/5' : (r.tier === 'mid' ? 'border-[var(--border-glass)] bg-purple-500/5' : 'border-[var(--border-glass)] bg-[var(--input-bg)]/60');
                const tierBadge = r.tier === 'good' ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' : (r.tier === 'mid' ? 'bg-purple-500/20 text-purple-300 border-[var(--border-glass)]' : 'bg-[var(--card-bg)] text-[var(--text-main)] opacity-70 border-[var(--border-glass)]');

                return (
                  <div key={r.id || idx} className={`p-4 rounded-2xl border ${tierColor} grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all`}>
                    <div className="md:col-span-1 flex items-center gap-2 font-mono font-bold text-[var(--text-main)] opacity-50 text-sm">
                      <span>#{r.id}</span>
                      <input
                        type="text"
                        value={r.icon || ''}
                        onChange={(e) => handleRewardChange(idx, 'icon', e.target.value)}
                        placeholder="Tag"
                        className="w-10 text-center bg-transparent border-b border-purple-900/40 text-xs focus:outline-none text-[var(--text-main)] opacity-90"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => handleRewardChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-purple-900/40 text-sm font-semibold text-[var(--text-main)] focus:outline-none focus:border-pink-500"
                        placeholder="Reward display title"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <select
                        value={r.tier}
                        onChange={(e) => handleRewardChange(idx, 'tier', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold uppercase focus:outline-none ${tierBadge}`}
                      >
                        <option value="bad">BAD Tier</option>
                        <option value="mid">MID Tier</option>
                        <option value="good">GOOD Tier</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <select
                        value={r.type}
                        onChange={(e) => handleRewardChange(idx, 'type', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-purple-900/40 text-xs font-medium focus:outline-none text-[var(--text-main)] opacity-90"
                      >
                        <option value="coins">Coins</option>
                        <option value="vouchers">Draft Vouchers</option>
                        <option value="gems">Gems</option>
                        <option value="fans">Fans</option>
                        <option value="pack">Card Pack</option>
                        <option value="signature_card">Signature Card</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      {r.type === 'pack' ? (
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={r.pack_rating_min || 115}
                            onChange={(e) => handleRewardChange(idx, 'pack_rating_min', parseInt(e.target.value, 10))}
                            className="w-1/2 px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-purple-900/40 text-xs font-bold text-[var(--text-main)] opacity-90 focus:outline-none"
                            placeholder="Min OVR"
                            title="Min OVR"
                          />
                          <input
                            type="number"
                            value={r.pack_rating_max || 118}
                            onChange={(e) => handleRewardChange(idx, 'pack_rating_max', parseInt(e.target.value, 10))}
                            className="w-1/2 px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-purple-900/40 text-xs font-bold text-[var(--text-main)] opacity-90 focus:outline-none"
                            placeholder="Max OVR"
                            title="Max OVR"
                          />
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={r.amount || 0}
                          onChange={(e) => handleRewardChange(idx, 'amount', parseInt(e.target.value, 10))}
                          disabled={r.type === 'signature_card'}
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-purple-900/40 text-xs font-bold text-[var(--text-main)] opacity-90 focus:outline-none"
                          placeholder="Amount"
                        />
                      )}
                    </div>

                    <div className="md:col-span-1 text-right text-xs font-mono font-bold text-[var(--text-main)] opacity-70">
                      {r.base_weight}% wt
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 10-Step Draw Cost Manager */}
          <div className="bg-[var(--card-bg)]/50 border border-[var(--border-glass)] rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-fuchsia-300">
              <Coins className="w-5 h-5 text-fuchsia-400" />
              10-Draw Step Cost Progression
            </h2>
            <p className="text-xs text-[var(--text-main)] opacity-70 mb-6">
              Customize the currency and price required for each consecutive draw from Draw #1 to Draw #10.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {drawCosts.map((cost, idx) => (
                <div key={cost.draw || idx} className="p-4 rounded-2xl bg-[var(--input-bg)]/80 border border-[var(--border-glass)] flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-fuchsia-300 font-mono">DRAW #{cost.draw || idx + 1}</span>
                    <select
                      value={cost.currency}
                      onChange={(e) => handleCostChange(idx, 'currency', e.target.value)}
                      className="bg-[var(--card-bg)] border border-purple-900/40 text-[var(--text-main)] opacity-90 rounded-md px-1.5 py-0.5 text-xs focus:outline-none"
                    >
                      <option value="coins">Coins</option>
                      <option value="vouchers">Vouchers</option>
                      <option value="gems">Gems</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[var(--text-main)] opacity-50 font-semibold mb-1">Cost</label>
                    <input
                      type="number"
                      step="1000000"
                      value={cost.amount}
                      onChange={(e) => handleCostChange(idx, 'amount', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--card-bg)] border border-purple-900/40 text-xs font-mono font-bold text-[var(--text-main)] focus:outline-none focus:border-pink-500"
                    />
                    <div className="text-[10px] text-[var(--text-main)] opacity-50 mt-1 font-mono text-right">
                      {parseInt(cost.amount, 10).toLocaleString()} {cost.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save bar */}
          <div className="sticky bottom-6 p-4 rounded-2xl bg-[var(--input-bg)]/95 border border-purple-900/40 backdrop-blur-xl flex items-center justify-between shadow-2xl">
            <div className="text-xs text-[var(--text-main)] opacity-70">
              Changes saved here apply instantly in real-time to the Discord <code>/signature_box</code> command.
            </div>
            <LiquidButton onClick={handleSave} disabled={saving} loading={saving}>
              <Save className="w-4 h-4" />
              Save and Publish Live
            </LiquidButton>
          </div>
        </form>
      </main>
    </div>
  );
}
