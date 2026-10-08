'use client';
import React from 'react';
import { Zap, Sparkles, Target, Shield, Flame, Activity, Award } from 'lucide-react';

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
    desc: 'Lethal chance conversion priority whenever team scores. Forwards finish chances clinically.',
    type: 'toggle'
  },
  {
    key: 'speed_demon',
    name: 'Speed Demon',
    icon: '⚡',
    badge: '+3 Attack Sector',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300',
    desc: 'Explosive pace on counters. Injects +3.0 direct attack sector power to forward line.',
    type: 'toggle'
  },
  {
    key: 'playmaker',
    name: 'Maestro Playmaker',
    icon: '🪄',
    badge: '+3 Midfield & Assists',
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-300',
    desc: 'Visionary passing master. Adds +3.0 midfield sector power and doubles assist involvement.',
    type: 'toggle'
  },
  {
    key: 'iron_fortress',
    name: 'Iron Fortress',
    icon: '🛡️',
    badge: '+3 Defense Sector',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
    desc: 'Impassable defensive wall. Adds +3.0 defensive sector power for tackles and interceptions.',
    type: 'toggle'
  },
  {
    key: 'the_wall',
    name: 'The Wall (GK)',
    icon: '🧤',
    badge: '+5 Goalkeeping',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-300',
    desc: 'World-class reflex shot-stopping. Adds +5.0 goalkeeper rating to deny opposition shots.',
    type: 'toggle'
  },
  {
    key: 'clutch_performer',
    name: 'Clutch Performer',
    icon: '🔥',
    badge: '80’+ Min Drama',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-300',
    desc: 'Ice in their veins late in matches. High bonus priority to net 88’–90’ equalizers/winners.',
    type: 'toggle'
  },
  {
    key: 'aura_dominance',
    name: 'Aura Dominance',
    icon: '🚀',
    badge: '+2 All Sectors',
    color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300',
    desc: 'Presence lifts entire starting XI. Adds flat +2.0 to Attack, Midfield, and Defense sectors.',
    type: 'toggle'
  },
  {
    key: 'sector_surge',
    name: 'Sector Surge Power',
    icon: '👑',
    badge: 'Custom Boost',
    color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40 text-fuchsia-300',
    desc: 'Direct configurable power surge added to this card’s natural formation sector (+1 to +10).',
    type: 'number',
    min: 1,
    max: 10
  }
];

export default function PerksSection({ perks = DEFAULT_PERKS, onChange }) {
  const currentPerks = { ...DEFAULT_PERKS, ...(perks || {}) };

  const handleMasterToggle = () => {
    onChange({
      ...currentPerks,
      enabled: !currentPerks.enabled
    });
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

  const activeCount = PERK_ITEMS.filter(p => {
    if (p.type === 'toggle') return Boolean(currentPerks[p.key]);
    if (p.type === 'number') return (currentPerks[p.key] || 0) > 0;
    return false;
  }).length;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/15 to-purple-950/20 p-4 space-y-4">
      {/* Header and Master Toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[var(--text-main)]">Extra Perks (Match Day Powers)</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                currentPerks.enabled 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-white/5 text-[var(--text-main)] opacity-50 border-white/10'
              }`}>
                {currentPerks.enabled ? `${activeCount} Active` : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-main)] opacity-60">
              Customize real-time match engine abilities & perks connected directly to Discord bot
            </p>
          </div>
        </div>

        {/* Master Toggle Button */}
        <button
          type="button"
          onClick={handleMasterToggle}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-sm ${
            currentPerks.enabled
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-400 shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-[var(--text-main)] opacity-70 border-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          {currentPerks.enabled ? 'Extra Perks: ON' : 'Extra Perks: OFF'}
        </button>
      </div>

      {/* Expanded Perks Grid when Enabled */}
      {currentPerks.enabled && (
        <div className="space-y-3 pt-2 border-t border-amber-500/20">
          <div className="text-[11px] text-amber-300/80 font-medium">
            Toggle specific abilities below. Changes apply in real-time to matches upon saving.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PERK_ITEMS.map((item) => {
              const isChecked = Boolean(currentPerks[item.key]);

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 bg-gradient-to-br ${
                    isChecked
                      ? `${item.color} shadow-sm ring-1 ring-amber-400/30`
                      : 'bg-[var(--card-bg)] border-[var(--border-glass)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-main)]">
                        <span className="text-sm">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-black/30 border border-white/10 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-main)] opacity-70 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
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
                        <span className="text-[10px] text-[var(--text-main)] opacity-80 font-semibold">Surge: +{currentPerks[item.key] || 3}</span>
                        <input
                          type="number"
                          min={item.min}
                          max={item.max}
                          value={currentPerks[item.key] || 3}
                          onChange={(e) => handleNumberChange(item.key, e.target.value)}
                          className="w-14 px-2 py-0.5 rounded-lg bg-[var(--input-bg)] border border-fuchsia-500/50 text-xs font-mono font-bold text-fuchsia-300 text-center focus:outline-none"
                        />
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
