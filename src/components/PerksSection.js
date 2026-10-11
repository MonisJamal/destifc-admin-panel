'use client';
import React, { useState } from 'react';
import { Zap, Sparkles, Target, Shield, Flame, Activity, Award, ChevronDown, ChevronUp, Check, Plus, Minus } from 'lucide-react';

export const DEFAULT_PERKS = {
  enabled: false,
  clinical_finisher: false,
  speed_demon: false,
  playmaker: false,
  iron_fortress: false,
  the_wall: false,
  clutch_performer: false,
  sector_surge: 3,
  aura_dominance: false
};

const PERK_ITEMS = [
  {
    key: 'clinical_finisher',
    name: 'Clinical Finisher',
    icon: '🎯',
    badge: 'Scorer Priority',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300',
    desc: 'Lethal chance conversion priority for forwards.',
    type: 'toggle'
  },
  {
    key: 'speed_demon',
    name: 'Speed Demon',
    icon: '⚡',
    badge: '+3 Attack',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300',
    desc: 'Injects +3.0 direct attack sector power to forward line.',
    type: 'toggle'
  },
  {
    key: 'playmaker',
    name: 'Maestro Playmaker',
    icon: '🪄',
    badge: '+3 Midfield',
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-300',
    desc: 'Adds +3.0 midfield sector power and doubles assist rate.',
    type: 'toggle'
  },
  {
    key: 'iron_fortress',
    name: 'Iron Fortress',
    icon: '🛡️',
    badge: '+3 Defense',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
    desc: 'Adds +3.0 defensive sector power for tackles & blocks.',
    type: 'toggle'
  },
  {
    key: 'the_wall',
    name: 'The Wall (GK)',
    icon: '🧤',
    badge: '+5 GK Rating',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300',
    desc: 'World-class reflexes. Adds +5.0 goalkeeper rating.',
    type: 'toggle'
  },
  {
    key: 'clutch_performer',
    name: 'Clutch Performer',
    icon: '🔥',
    badge: '80’+ Min Drama',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-300',
    desc: 'High bonus priority to net 88’–90’ late winners.',
    type: 'toggle'
  },
  {
    key: 'aura_dominance',
    name: 'Aura Dominance',
    icon: '🚀',
    badge: '+2 All Sectors',
    color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300',
    desc: 'Adds flat +2.0 to Attack, Midfield, and Defense sectors.',
    type: 'toggle'
  },
  {
    key: 'sector_surge',
    name: 'Sector Surge Power',
    icon: '👑',
    badge: 'Custom Boost',
    color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40 text-fuchsia-300',
    desc: 'Direct configurable power surge to player sector (+1 to +10).',
    type: 'number',
    min: 1,
    max: 10
  }
];

export default function PerksSection({ perks = DEFAULT_PERKS, onChange }) {
  const currentPerks = { ...DEFAULT_PERKS, ...(perks || {}) };
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMasterToggle = () => {
    const nextEnabled = !currentPerks.enabled;
    onChange({
      ...currentPerks,
      enabled: nextEnabled
    });
    if (nextEnabled) {
      setIsExpanded(true);
    }
  };

  const handleTogglePerk = (key) => {
    onChange({
      ...currentPerks,
      [key]: !currentPerks[key]
    });
  };

  const handleNumberChange = (key, val) => {
    const num = Math.max(1, Math.min(10, parseInt(val, 10) || 1));
    onChange({
      ...currentPerks,
      [key]: num
    });
  };

  const handleEnableAll = () => {
    const updated = { ...currentPerks, enabled: true };
    PERK_ITEMS.forEach(p => {
      if (p.type === 'toggle') updated[p.key] = true;
      if (p.type === 'number') updated[p.key] = updated[p.key] || 3;
    });
    onChange(updated);
  };

  const handleDisableAll = () => {
    const updated = { ...currentPerks, enabled: true };
    PERK_ITEMS.forEach(p => {
      if (p.type === 'toggle') updated[p.key] = false;
    });
    onChange(updated);
  };

  const activeCount = PERK_ITEMS.filter(p => {
    if (p.type === 'toggle') return Boolean(currentPerks[p.key]);
    if (p.type === 'number') return (currentPerks[p.key] || 0) > 0;
    return false;
  }).length;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-purple-950/20 p-3 sm:p-4 space-y-3">
      {/* Header and Master Toggle */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">Extra Perks (Match Powers)</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0 ${
                currentPerks.enabled 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-white/5 text-[var(--text-main)] opacity-50 border-white/10'
              }`}>
                {currentPerks.enabled ? `${activeCount} Active` : 'Disabled'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] opacity-60 hidden sm:block truncate">
              Match engine abilities & sector buffs for H2H simulation
            </p>
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {currentPerks.enabled && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-main)] opacity-70 hover:opacity-100 transition border border-white/10 text-xs flex items-center gap-1"
              title={isExpanded ? 'Collapse perks' : 'Expand perks'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleMasterToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
              currentPerks.enabled
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-400 shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-[var(--text-main)] opacity-70 border-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {currentPerks.enabled ? 'Perks: ON' : 'Perks: OFF'}
          </button>
        </div>
      </div>

      {/* Expanded Perks Grid when Enabled */}
      {currentPerks.enabled && isExpanded && (
        <div className="space-y-2.5 pt-2 border-t border-amber-500/20">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-amber-300/80 font-medium truncate">
              Select abilities below:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleEnableAll}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition"
              >
                All ON
              </button>
              <button
                type="button"
                onClick={handleDisableAll}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-[var(--text-main)] opacity-70 border border-white/10 transition"
              >
                All OFF
              </button>
            </div>
          </div>

          {/* Compact Responsive Perks Grid with Max Height Scroll if needed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {PERK_ITEMS.map((item) => {
              const isChecked = Boolean(currentPerks[item.key]);

              return (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-1.5 ${
                    isChecked
                      ? `bg-gradient-to-br ${item.color} shadow-sm ring-1 ring-amber-400/30`
                      : 'bg-[var(--card-bg)] border-[var(--border-glass)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <span className="font-bold text-xs text-[var(--text-main)] truncate">{item.name}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-black/40 border border-white/10 shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-[10px] text-[var(--text-main)] opacity-70 leading-snug line-clamp-2">
                    {item.desc}
                  </p>

                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-2">
                    {item.type === 'toggle' ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePerk(item.key)}
                        className={`w-full py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 border ${
                          isChecked
                            ? 'bg-amber-400 text-black border-amber-300'
                            : 'bg-white/5 hover:bg-white/10 text-[var(--text-main)] opacity-60 border-white/10'
                        }`}
                      >
                        {isChecked ? 'Enabled' : 'Disabled'}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[10px] text-[var(--text-main)] opacity-80 font-semibold">Boost:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleNumberChange(item.key, (currentPerks[item.key] || 3) - 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center text-xs font-bold border border-white/10"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-fuchsia-300">
                            +{currentPerks[item.key] || 3}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleNumberChange(item.key, (currentPerks[item.key] || 3) + 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 flex items-center justify-center text-xs font-bold border border-white/10"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
