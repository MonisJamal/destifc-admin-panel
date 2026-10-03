'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Bot, 
  Power, 
  ShieldAlert, 
  Sliders, 
  Radio, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Activity,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';

const COMMAND_LIST = [
  { key: 'draft', label: '/draft', desc: 'Packs, Walkouts, and Global Draft Pools' },
  { key: 'market', label: '/market', desc: 'Card buying, selling, and searching' },
  { key: 'draft_battle', label: '/draft_battle', desc: '1v1 Draft Tournament Arena' },
  { key: 'match', label: '/match', desc: 'Head-to-Head ranked match simulation' },
  { key: 'exchange', label: '/exchange', desc: 'OVR player sacrifice upgrades' },
  { key: 'trade', label: '/trade', desc: 'Player-to-player direct card swapping' },
  { key: 'signature_box', label: '/signature_box', desc: 'Exclusive 10-Reward Signature Draw' },
  { key: 'squad', label: '/squad', desc: 'Starting XI lineup management' },
  { key: 'sbc', label: '/sbc', desc: 'Squad Building Challenges' },
  { key: 'daily', label: '/daily', desc: 'Daily claimable coins and vouchers' },
  { key: 'work', label: '/work', desc: 'Mini-job shifts for coins' }
];

export default function BotConfigAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Presence State
  const [activityType, setActivityType] = useState('Playing');
  const [statusText, setStatusText] = useState('FC Mobile 27');
  const [statusState, setStatusState] = useState('online');
  const [draftRotationHours, setDraftRotationHours] = useState(2);
  const [storeRotationHours, setStoreRotationHours] = useState(3);
  const [exchangeRotationHours, setExchangeRotationHours] = useState(2);

  // Maintenance State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "DestiFC is currently undergoing scheduled maintenance. Commands are temporarily paused."
  );

  // Command Toggles
  const [commandsEnabled, setCommandsEnabled] = useState({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot-config');
      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        setActivityType(c.presence_activity_type || 'Playing');
        setStatusText(c.presence_status_text || 'FC Mobile 27');
        setStatusState(c.presence_status_state || 'online');
        setMaintenanceMode(Boolean(c.maintenance_mode));
        setMaintenanceMessage(
          c.maintenance_message ||
            "DestiFC is currently undergoing scheduled maintenance. Commands are temporarily paused."
        );
        setCommandsEnabled(c.commands_enabled || {});
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load bot configuration.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleCommand = (key) => {
    setCommandsEnabled((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  const handleToggleAllCommands = (enable) => {
    const next = {};
    COMMAND_LIST.forEach((cmd) => {
      next[cmd.key] = enable;
    });
    setCommandsEnabled(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      presence_activity_type: activityType,
      presence_status_text: statusText,
      presence_status_state: statusState,
      draft_rotation_hours: parseFloat(draftRotationHours) || 2,
      store_rotation_hours: parseFloat(storeRotationHours) || 3,
      exchange_rotation_hours: parseFloat(exchangeRotationHours) || 2,
      maintenance_mode: Boolean(maintenanceMode),
      maintenance_message: maintenanceMessage,
      commands_enabled: commandsEnabled
    };

    try {
      const res = await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Bot System and Presence settings saved. Live Discord bot updated.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save bot settings.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error saving bot settings.' });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-[var(--text-main)] opacity-70">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-medium">Loading Bot System Configuration...</p>
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
                <Bot className="w-3.5 h-3.5" /> Bot Presence and Core Operations
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-[var(--border-glass)]">
                Live Discord Sync
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Bot Status, Maintenance and Permissions
            </h1>
            <p className="text-sm text-[var(--text-main)] opacity-70 mt-1">
              Control Discord rich presence activity, emergency maintenance mode switches, and individual slash command permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchConfig}
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
              {saving ? 'Saving...' : 'Save Bot Config'}
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
          {/* Discord Presence Settings */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-glass)]">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">Discord Rich Presence</h2>
                <p className="text-xs text-[var(--text-main)] opacity-70">Status activity displayed on the bot Discord profile</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-90 mb-1.5">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="Playing">Playing (e.g. Playing FC Mobile 27)</option>
                  <option value="Streaming">Streaming (e.g. Streaming DestiFC Live)</option>
                  <option value="Watching">Watching (e.g. Watching 10,000 Matches)</option>
                  <option value="Listening">Listening (e.g. Listening to /draft)</option>
                  <option value="Competing">Competing (e.g. Competing in Champions League)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-90 mb-1.5">Status Message Text</label>
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="e.g. FC Mobile 27"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-90 mb-1.5">Online Status State</label>
                <select
                  value={statusState}
                  onChange={(e) => setStatusState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="online">Online (Green Indicator)</option>
                  <option value="idle">Idle (Yellow Moon)</option>
                  <option value="dnd">Do Not Disturb (Red Minus)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Maintenance Mode Controls */}
          <div className="p-6 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  maintenanceMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-main)]">Emergency Maintenance Mode</h2>
                  <p className="text-xs text-[var(--text-main)] opacity-70">Lock all non-admin bot commands instantly</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  maintenanceMode ? 'bg-red-600 justify-end' : 'bg-[var(--card-bg)] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-md" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-3.5 rounded-2xl border text-xs ${
                maintenanceMode ? 'bg-red-950/40 border-red-500/40 text-red-300' : 'bg-[var(--input-bg)] border-[var(--border-glass)] text-[var(--text-main)] opacity-70'
              }`}>
                {maintenanceMode
                  ? 'Maintenance mode is active: Standard users cannot run commands. Only Bot Admins and Owners have access.'
                  : 'Bot is operating normally. All users have full command access.'}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] opacity-90 mb-1.5">Maintenance Notice Message</label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-[var(--text-main)] text-sm focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Individual Command Toggles */}
        <div className="mt-8 p-6 rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] backdrop-blur-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center border border-[var(--border-glass)]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">Individual Slash Command Permissions</h2>
                <p className="text-xs text-[var(--text-main)] opacity-70">Toggle individual Discord slash commands ON or OFF</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleAllCommands(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/30 transition"
              >
                Enable All
              </button>
              <button
                onClick={() => handleToggleAllCommands(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition"
              >
                Disable All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMAND_LIST.map((cmd) => {
              const isEnabled = commandsEnabled[cmd.key] !== false;
              return (
                <div
                  key={cmd.key}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isEnabled
                      ? 'bg-[var(--input-bg)]/80 border-[var(--border-glass)]'
                      : 'bg-red-950/20 border-red-500/30 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[var(--text-main)]">{cmd.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isEnabled ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-main)] opacity-70 mt-0.5">{cmd.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCommand(cmd.key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                      isEnabled ? 'bg-gradient-to-r from-pink-500 to-purple-600 justify-end' : 'bg-[var(--card-bg)] justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[var(--card-bg)] shadow-md" />
                  </button>
                </div>
              );
            })}
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
            {saving ? 'Saving System Rates...' : 'Save & Sync Bot Configuration'}
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
