'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, RefreshCw, Check } from 'lucide-react';

export function calculateDefaultStats(ovr, buffedOvr, position) {
  const baseRating = parseInt(buffedOvr, 10) > 0 ? parseInt(buffedOvr, 10) : parseInt(ovr || 120, 10);
  const pos = (position || 'ST').toUpperCase();

  if (pos === 'GK') {
    return {
      is_gk: true,
      avg1: baseRating + 31, // DIV (+31 over OVR on RenderZ)
      avg2: baseRating + 30, // POS (+30)
      avg3: baseRating + 30, // HAN (+30)
      avg4: baseRating + 31, // REF (+31)
      avg5: Math.max(50, baseRating + 27), // KIC (+27)
      avg6: baseRating + 16, // PHY (+16)
      labels: ['DIV', 'POS', 'HAN', 'REF', 'KIC', 'PHY'],
      names: ['Diving', 'Positioning', 'Handling', 'Reflexes', 'Kicking', 'Physical']
    };
  }

  // Exact empirical RenderZ average attribute deltas from over 1,000 top official cards (115-124 OVR):
  let deltas = { avg1: 26, avg2: 27, avg3: 2, avg4: 21, avg5: -44, avg6: 9 }; // Default ST

  if (['ST', 'CF'].includes(pos)) {
    deltas = { avg1: 26, avg2: 27, avg3: 2, avg4: 21, avg5: -44, avg6: 9 };
  } else if (['LW', 'LF'].includes(pos)) {
    deltas = { avg1: 32, avg2: 20, avg3: 15, avg4: 28, avg5: -43, avg6: -2 };
  } else if (['RW', 'RF'].includes(pos)) {
    deltas = { avg1: 30, avg2: 20, avg3: 15, avg4: 28, avg5: -46, avg6: -7 };
  } else if (pos === 'CAM') {
    deltas = { avg1: 21, avg2: 20, avg3: 19, avg4: 25, avg5: -30, avg6: -11 };
  } else if (pos === 'CM') {
    deltas = { avg1: 16, avg2: 9, avg3: 22, avg4: 20, avg5: 5, avg6: 4 };
  } else if (['LM', 'RM'].includes(pos)) {
    deltas = { avg1: 28, avg2: 15, avg3: 16, avg4: 24, avg5: -25, avg6: -3 };
  } else if (pos === 'CDM') {
    deltas = { avg1: 13, avg2: -3, avg3: 12, avg4: 16, avg5: 22, avg6: 18 };
  } else if (pos === 'CB') {
    deltas = { avg1: 13, avg2: -22, avg3: -5, avg4: 5, avg5: 30, avg6: 25 };
  } else if (['LB', 'LWB'].includes(pos)) {
    deltas = { avg1: 24, avg2: -11, avg3: 11, avg4: 15, avg5: 20, avg6: 14 };
  } else if (['RB', 'RWB'].includes(pos)) {
    deltas = { avg1: 22, avg2: -20, avg3: 3, avg4: 11, avg5: 22, avg6: 15 };
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
  ovr = 120,
  buffedOvr = '',
  position = 'ST',
  stats,
  onChange
}) {
  const [autoSync, setAutoSync] = useState(true);

  // Sync automatically whenever OVR, Buffed OVR, or Position changes, unless user manually edited stats
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
              Custom Card In-Game Stats (Editable)
            </h3>
          </div>

          <p className="text-xs text-[var(--text-main)] opacity-75 mt-0.5">
            Auto-generated for <span className="text-pink-300 font-semibold">{position || 'ST'}</span> at <span className="text-pink-300 font-semibold">{effectiveBase} OVR</span>. You can edit any stat below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {autoSync ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-Generated
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Manually Edited
            </span>
          )}

          <button
            type="button"
            onClick={handleRegenerate}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-500/40 transition-colors flex items-center gap-1.5"
            title="Recalculate baseline stats for this position and OVR"
          >
            <RefreshCw className="w-3 h-3" /> Reset to Baseline
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

      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[var(--text-main)] opacity-70 gap-1">
        <span>⚡ Directly drives this custom card's finishing, pace, tackles & saves in Head-to-Head (/play).</span>
        <span className="font-mono text-fuchsia-300">
          {isGK ? 'DIV · POS · HAN · REF · KIC · PHY' : 'PAC · SHO · PAS · DRI · DEF · PHY'}
        </span>
      </div>
    </div>
  );
}
