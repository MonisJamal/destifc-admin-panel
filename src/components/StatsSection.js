'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, RefreshCw, Zap, Shield, Flame, Check, HelpCircle } from 'lucide-react';

export function calculateDefaultStats(ovr, buffedOvr, position) {
  const baseRating = parseInt(buffedOvr, 10) > 0 ? parseInt(buffedOvr, 10) : parseInt(ovr || 120, 10);
  const pos = (position || 'ST').toUpperCase();

  if (pos === 'GK') {
    return {
      is_gk: true,
      avg1: baseRating + 4, // DIV
      avg2: baseRating + 3, // POS
      avg3: baseRating + 2, // HAN
      avg4: baseRating + 5, // REF
      avg5: Math.max(50, baseRating - 4), // KIC
      avg6: baseRating + 1, // PHY
      labels: ['DIV', 'POS', 'HAN', 'REF', 'KIC', 'PHY'],
      names: ['Diving', 'Positioning', 'Handling', 'Reflexes', 'Kicking', 'Physical']
    };
  }

  // Outfield positions
  let deltas = { avg1: 2, avg2: 5, avg3: -8, avg4: 2, avg5: -45, avg6: 1 }; // Default ST

  if (['ST', 'CF'].includes(pos)) {
    deltas = { avg1: 2, avg2: 5, avg3: -8, avg4: 2, avg5: -45, avg6: 1 };
  } else if (['LW', 'RW', 'LF', 'RF'].includes(pos)) {
    deltas = { avg1: 6, avg2: 2, avg3: -2, avg4: 6, avg5: -45, avg6: -6 };
  } else if (pos === 'CAM') {
    deltas = { avg1: -1, avg2: 2, avg3: 5, avg4: 5, avg5: -35, avg6: -4 };
  } else if (pos === 'CM') {
    deltas = { avg1: -2, avg2: 0, avg3: 4, avg4: 2, avg5: -1, avg6: 1 };
  } else if (['LM', 'RM'].includes(pos)) {
    deltas = { avg1: 5, avg2: -1, avg3: 3, avg4: 5, avg5: -20, avg6: -3 };
  } else if (pos === 'CDM') {
    deltas = { avg1: -4, avg2: -12, avg3: 2, avg4: 0, avg5: 5, avg6: 5 };
  } else if (pos === 'CB') {
    deltas = { avg1: -4, avg2: -50, avg3: -14, avg4: -10, avg5: 6, avg6: 6 };
  } else if (['LB', 'RB', 'LWB', 'RWB'].includes(pos)) {
    deltas = { avg1: 5, avg2: -25, avg3: 0, avg4: 1, avg5: 3, avg6: 2 };
  }

  return {
    is_gk: false,
    avg1: Math.max(40, baseRating + deltas.avg1),
    avg2: Math.max(40, baseRating + deltas.avg2),
    avg3: Math.max(40, baseRating + deltas.avg3),
    avg4: Math.max(40, baseRating + deltas.avg4),
    avg5: Math.max(30, baseRating + deltas.avg5),
    avg6: Math.max(40, baseRating + deltas.avg6),
    labels: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
    names: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical']
  };
}

export default function StatsSection({
  ovr,
  buffedOvr,
  position,
  stats,
  onChange
}) {
  const [autoSync, setAutoSync] = useState(true);

  // Sync automatically when OVR, Buffed OVR, or Position changes if autoSync is active
  useEffect(() => {
    if (autoSync) {
      const generated = calculateDefaultStats(ovr, buffedOvr, position);
      onChange({
        avg1: generated.avg1,
        avg2: generated.avg2,
        avg3: generated.avg3,
        avg4: generated.avg4,
        avg5: generated.avg5,
        avg6: generated.avg6,
        is_gk: generated.is_gk
      });
    }
  }, [ovr, buffedOvr, position, autoSync]);

  const handleStatChange = (key, value) => {
    setAutoSync(false); // User touched an input manually
    const num = parseInt(value, 10);
    onChange({
      ...stats,
      [key]: isNaN(num) ? '' : num
    });
  };

  const handleRegenerate = () => {
    setAutoSync(true);
    const generated = calculateDefaultStats(ovr, buffedOvr, position);
    onChange({
      avg1: generated.avg1,
      avg2: generated.avg2,
      avg3: generated.avg3,
      avg4: generated.avg4,
      avg5: generated.avg5,
      avg6: generated.avg6,
      is_gk: generated.is_gk
    });
  };

  const isGK = (position || '').toUpperCase() === 'GK';
  const labels = isGK ? ['DIV', 'POS', 'HAN', 'REF', 'KIC', 'PHY'] : ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
  const names = isGK 
    ? ['Diving', 'Positioning', 'Handling', 'Reflexes', 'Kicking', 'Physical'] 
    : ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'];

  const statKeys = ['avg1', 'avg2', 'avg3', 'avg4', 'avg5', 'avg6'];

  const getStatBadgeColor = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return 'border-neutral-700 text-neutral-400 bg-neutral-900/40';
    if (num >= 140) return 'border-fuchsia-500/50 text-fuchsia-300 bg-fuchsia-950/40 shadow-sm shadow-fuchsia-500/20';
    if (num >= 120) return 'border-pink-500/50 text-pink-300 bg-pink-950/40';
    if (num >= 100) return 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30';
    if (num >= 80) return 'border-amber-500/40 text-amber-300 bg-amber-950/30';
    return 'border-neutral-700 text-neutral-400 bg-neutral-900/30';
  };

  const effectiveBase = parseInt(buffedOvr, 10) > 0 ? parseInt(buffedOvr, 10) : parseInt(ovr || 120, 10);

  return (
    <div className="bg-gradient-to-br from-[var(--card-bg)]/80 to-[var(--card-bg)]/40 border border-fuchsia-500/30 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-fuchsia-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wide text-fuchsia-200 flex items-center gap-1.5 uppercase">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              RenderZ In-Game Attributes & Match Stats
            </h3>
          </div>
          <p className="text-xs text-[var(--text-main)] opacity-75 mt-0.5">
            Auto-generated from <span className="text-pink-300 font-semibold">{position || 'ST'}</span> position & <span className="text-pink-300 font-semibold">{effectiveBase} OVR</span> performance power. Fully editable below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {autoSync ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-Synced
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Custom Overrides Active
            </span>
          )}

          <button
            type="button"
            onClick={handleRegenerate}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-500/40 transition-colors flex items-center gap-1.5"
            title="Recalculate stats based on current position and OVR"
          >
            <RefreshCw className="w-3 h-3" /> Auto-Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statKeys.map((key, idx) => {
          const val = stats ? stats[key] : '';
          const label = labels[idx];
          const name = names[idx];

          return (
            <div
              key={key}
              className={`p-3 rounded-xl border transition-all ${getStatBadgeColor(val)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black tracking-wider uppercase">{label}</span>
                <span className="text-[10px] opacity-70 font-medium truncate max-w-[60px]" title={name}>
                  {name}
                </span>
              </div>
              <input
                type="number"
                min="30"
                max="250"
                value={val !== undefined ? val : ''}
                onChange={(e) => handleStatChange(key, e.target.value)}
                placeholder="120"
                className="w-full text-center text-lg font-black font-mono bg-black/40 rounded-lg py-1 px-1 border border-white/10 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 text-white"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-[var(--text-main)] opacity-70">
        <span>⚡ Directly governs match chances, finishing, pace, tackles & saves in Head-to-Head (/play).</span>
        <span className="font-mono text-fuchsia-300">avgStats: PAC · SHO · PAS · DRI · DEF · PHY</span>
      </div>
    </div>
  );
}
