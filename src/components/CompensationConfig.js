'use client';

import { useState, useEffect } from 'react';
import { Gift, Save, CheckCircle2, AlertCircle, Clock, Sparkles, Coins, Ticket, Gem } from 'lucide-react';

export default function CompensationConfig() {
  const [config, setConfig] = useState({
    is_active: false,
    event_id: 'season_2_welcome',
    message: 'Sorry for the downtime! Enjoy your Season 2 Welcome Pack!',
    coins: 50000000,
    vouchers: 50,
    gems: 0,
    start_timestamp: 0,
    end_timestamp: 0
  });
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/compensation-config')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setConfig(res.data);
          if (res.data.start_timestamp) {
            const sd = new Date(res.data.start_timestamp * 1000);
            setStartDateStr(sd.toISOString().slice(0, 16));
          }
          if (res.data.end_timestamp) {
            const ed = new Date(res.data.end_timestamp * 1000);
            setEndDateStr(ed.toISOString().slice(0, 16));
          }
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ type: '', text: '' });

    let payload = { ...config };
    if (startDateStr) payload.start_timestamp = Math.floor(new Date(startDateStr).getTime() / 1000);
    else payload.start_timestamp = 0;
    
    if (endDateStr) payload.end_timestamp = Math.floor(new Date(endDateStr).getTime() / 1000);
    else payload.end_timestamp = 0;

    try {
      const res = await fetch('/api/compensation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Compensation Event configuration successfully saved and published!' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to save compensation event.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication failure. Could not update config.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-12 text-center text-[var(--text-main)] opacity-70 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Loading Compensation Event State...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-orange-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400 shrink-0">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
                Compensation Events
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                config.is_active
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
              }`}>
                {config.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-main)] opacity-70 mt-1">
              Configure global player compensation packs claimable via Discord command <code className="text-pink-400 font-mono text-xs bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">/compensation</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Save & Publish Event'}</span>
        </button>
      </div>

      {/* Inline Feedback Alert */}
      {feedback.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          feedback.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Event Status & Meta */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Event Status & Identity
            </h3>

            {/* Status Toggle Switch */}
            <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] cursor-pointer hover:border-pink-500/40 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm text-[var(--text-main)]">Enable Compensation Event</div>
                <div className="text-xs text-[var(--text-main)] opacity-60">Allows any eligible player to execute <code className="text-pink-400">/compensation</code> in Discord</div>
              </div>
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={config.is_active}
                  onChange={e => setConfig({ ...config, is_active: e.target.checked })}
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${config.is_active ? 'bg-pink-600' : 'bg-zinc-700'}`} />
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.is_active ? 'translate-x-6' : ''}`} />
              </div>
            </label>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] opacity-80 uppercase tracking-wider mb-2">
                Unique Event ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
                value={config.event_id}
                onChange={e => setConfig({ ...config, event_id: e.target.value })}
                placeholder="e.g. season_2_apology_v1"
              />
              <p className="text-[11px] text-[var(--text-main)] opacity-50 mt-1.5">
                Changing this ID resets claim history so players who previously claimed can receive the new compensation package.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] opacity-80 uppercase tracking-wider mb-2">
                Announcement & Embed Message
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 h-28 resize-none font-sans"
                value={config.message}
                onChange={e => setConfig({ ...config, message: e.target.value })}
                placeholder="Sorry for the recent downtime! Here is an exclusive reward package to compensate..."
              />
            </div>
          </div>

          {/* Time Window */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Event Schedule & Expiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5">Starts At</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] focus:outline-none focus:border-pink-500"
                  value={startDateStr}
                  onChange={e => setStartDateStr(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-70 mb-1.5">Ends At (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-xs text-[var(--text-main)] focus:outline-none focus:border-pink-500"
                  value={endDateStr}
                  onChange={e => setEndDateStr(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reward Package */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            Reward Grants per User Claim
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">Coins</div>
                  <div className="text-xs text-[var(--text-main)] opacity-50">Transferred straight to user balance</div>
                </div>
              </div>
              <input
                type="number"
                className="w-36 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-glass)] text-right font-mono font-bold text-sm text-amber-300 focus:outline-none focus:border-pink-500"
                value={config.coins}
                onChange={e => setConfig({ ...config, coins: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">Draft Vouchers</div>
                  <div className="text-xs text-[var(--text-main)] opacity-50">Used to initiate high-tier drafts</div>
                </div>
              </div>
              <input
                type="number"
                className="w-36 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-glass)] text-right font-mono font-bold text-sm text-blue-300 focus:outline-none focus:border-pink-500"
                value={config.vouchers}
                onChange={e => setConfig({ ...config, vouchers: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Gem className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">Gems</div>
                  <div className="text-xs text-[var(--text-main)] opacity-50">Premium secondary currency</div>
                </div>
              </div>
              <input
                type="number"
                className="w-36 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-glass)] text-right font-mono font-bold text-sm text-purple-300 focus:outline-none focus:border-pink-500"
                value={config.gems}
                onChange={e => setConfig({ ...config, gems: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
