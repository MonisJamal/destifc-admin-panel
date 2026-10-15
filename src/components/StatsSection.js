'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Sparkles, RefreshCw, Zap, Shield, Flame, Check, Search, UserCheck } from 'lucide-react';

export function calculateDefaultStats(ovr, buffedOvr, position) {
  const baseRating = parseInt(buffedOvr, 10) > 0 ? parseInt(buffedOvr, 10) : parseInt(ovr || 120, 10);
  const pos = (position || 'ST').toUpperCase();

  if (pos === 'GK') {
    return {
      is_gk: true,
      avg1: baseRating + 29, // DIV (+29 over OVR)
      avg2: baseRating + 28, // POS (+28)
      avg3: baseRating + 28, // HAN (+28)
      avg4: baseRating + 30, // REF (+30)
      avg5: Math.max(50, baseRating + 24), // KIC (+24)
      avg6: baseRating + 3,  // PHY (+3)
      labels: ['DIV', 'POS', 'HAN', 'REF', 'KIC', 'PHY'],
      names: ['Diving', 'Positioning', 'Handling', 'Reflexes', 'Kicking', 'Physical']
    };
  }

  // Exact empirical RenderZ average attribute deltas from over 1,800 official cards:
  let deltas = { avg1: 23, avg2: 24, avg3: -3, avg4: 17, avg5: -47, avg6: 5 }; // Default ST

  if (['ST', 'CF'].includes(pos)) {
    deltas = { avg1: 23, avg2: 24, avg3: -3, avg4: 17, avg5: -47, avg6: 5 };
  } else if (['LW', 'LF'].includes(pos)) {
    deltas = { avg1: 30, avg2: 17, avg3: 11, avg4: 27, avg5: -47, avg6: -8 };
  } else if (['RW', 'RF'].includes(pos)) {
    deltas = { avg1: 28, avg2: 16, avg3: 11, avg4: 26, avg5: -48, avg6: -11 };
  } else if (pos === 'CAM') {
    deltas = { avg1: 19, avg2: 17, avg3: 15, avg4: 24, avg5: -33, avg6: -14 };
  } else if (pos === 'CM') {
    deltas = { avg1: 11, avg2: 5, avg3: 19, avg4: 17, avg5: 1, avg6: 0 };
  } else if (['LM', 'RM'].includes(pos)) {
    deltas = { avg1: 25, avg2: 10, avg3: 14, avg4: 22, avg5: -25, avg6: -6 };
  } else if (pos === 'CDM') {
    deltas = { avg1: 6, avg2: -13, avg3: 6, avg4: 11, avg5: 19, avg6: 16 };
  } else if (pos === 'CB') {
    deltas = { avg1: 8, avg2: -29, avg3: -9, avg4: 1, avg5: 28, avg6: 23 };
  } else if (['LB', 'LWB'].includes(pos)) {
    deltas = { avg1: 21, avg2: -17, avg3: 7, avg4: 13, avg5: 17, avg6: 10 };
  } else if (['RB', 'RWB'].includes(pos)) {
    deltas = { avg1: 18, avg2: -25, avg3: -1, avg4: 8, avg5: 19, avg6: 12 };
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

export function calculatePlayerSpecificStats(matchedCard, ovr, buffedOvr, targetPosition) {
  const effectiveBase = parseInt(buffedOvr, 10) > 0 ? parseInt(buffedOvr, 10) : parseInt(ovr || 120, 10);
  const pos = (targetPosition || matchedCard.position || 'ST').toUpperCase();
  const isGK = pos === 'GK';

  // For goalkeepers, prefer authentic avgGkStats from RenderZ
  const rzStats = isGK ? (matchedCard.avgGkStats || matchedCard.avgStats) : (matchedCard.avgStats || matchedCard.avgGkStats);
  const baseCardRating = matchedCard.rating || matchedCard.ovr || 100;

  if (!rzStats || !rzStats.avg1) {
    return calculateDefaultStats(ovr, buffedOvr, pos);
  }

  // Calculate that specific player's exact offsets relative to their base card OVR
  const d1 = (parseInt(rzStats.avg1, 10) || baseCardRating) - baseCardRating;
  const d2 = (parseInt(rzStats.avg2, 10) || baseCardRating) - baseCardRating;
  const d3 = (parseInt(rzStats.avg3, 10) || baseCardRating) - baseCardRating;
  const d4 = (parseInt(rzStats.avg4, 10) || baseCardRating) - baseCardRating;
  const d5 = (parseInt(rzStats.avg5, 10) || baseCardRating) - baseCardRating;
  const d6 = (parseInt(rzStats.avg6, 10) || baseCardRating) - baseCardRating;

  return {
    is_gk: isGK,
    avg1: Math.max(30, effectiveBase + d1),
    avg2: Math.max(30, effectiveBase + d2),
    avg3: Math.max(30, effectiveBase + d3),
    avg4: Math.max(30, effectiveBase + d4),
    avg5: Math.max(30, effectiveBase + d5),
    avg6: Math.max(30, effectiveBase + d6),
    labels: isGK ? ['DIV', 'POS', 'HAN', 'REF', 'KIC', 'PHY'] : ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
    names: isGK 
      ? ['Diving', 'Positioning', 'Handling', 'Reflexes', 'Kicking', 'Physical'] 
      : ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical']
  };
}

export default function StatsSection({
  playerName = '',
  ovr = 120,
  buffedOvr = '',
  position = 'ST',
  stats,
  onChange,
  onPositionSelect
}) {
  const [autoSync, setAutoSync] = useState(true);
  const [matchedPlayer, setMatchedPlayer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Debounced search for the specific player on RenderZ / official cards
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const cleanName = (playerName || '').trim();
    if (!cleanName || cleanName.length < 2) {
      setMatchedPlayer(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/renderz/cards?query=${encodeURIComponent(cleanName)}&size=8`);
        const data = await res.json();
        
        if (data.success && data.cards && data.cards.length > 0) {
          const currentPos = (position || '').toUpperCase();
          // Find matching position if available, else highest rated card for that player
          const samePos = data.cards.find(c => (c.position || '').toUpperCase() === currentPos);
          const bestMatch = samePos || data.cards[0];
          
          const isGK = (bestMatch.position || '').toUpperCase() === 'GK' || currentPos === 'GK';
          const rzStats = isGK ? (bestMatch.avgGkStats || bestMatch.avgStats) : bestMatch.avgStats;

          if (rzStats && rzStats.avg1) {
            setMatchedPlayer({
              id: bestMatch.id || bestMatch.assetId,
              name: bestMatch.cardName || bestMatch.name,
              rating: bestMatch.rating || bestMatch.ovr || 100,
              position: bestMatch.position,
              program: bestMatch.program?.name || '',
              avgStats: rzStats,
              avgGkStats: bestMatch.avgGkStats
            });
          } else {
            setMatchedPlayer(null);
          }
        } else {
          setMatchedPlayer(null);
        }
      } catch (err) {
        console.error('Error fetching RenderZ player stats:', err);
        setMatchedPlayer(null);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [playerName]);

  // Sync stats when inputs or matched player changes, provided autoSync is active
  useEffect(() => {
    if (autoSync) {
      let generated;
      if (matchedPlayer) {
        generated = calculatePlayerSpecificStats(matchedPlayer, ovr, buffedOvr, position);
      } else {
        generated = calculateDefaultStats(ovr, buffedOvr, position);
      }

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
  }, [matchedPlayer, ovr, buffedOvr, position, autoSync]);

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
    let generated;
    if (matchedPlayer) {
      generated = calculatePlayerSpecificStats(matchedPlayer, ovr, buffedOvr, position);
    } else {
      generated = calculateDefaultStats(ovr, buffedOvr, position);
    }

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

          <div className="mt-1">
            {isSearching ? (
              <p className="text-xs text-fuchsia-300 flex items-center gap-1.5 animate-pulse">
                <Search className="w-3.5 h-3.5" /> Searching RenderZ for authentic player stats...
              </p>
            ) : matchedPlayer ? (
              <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Auto-matched RenderZ player: <span className="font-bold underline text-white">{matchedPlayer.name}</span> ({matchedPlayer.rating} OVR {matchedPlayer.position})
                <span className="text-[11px] text-neutral-400">→ scaled to {effectiveBase} OVR</span>
              </p>
            ) : (
              <p className="text-xs text-[var(--text-main)] opacity-75">
                Using empirical RenderZ position baseline for <span className="text-pink-300 font-semibold">{position || 'ST'}</span> at <span className="text-pink-300 font-semibold">{effectiveBase} OVR</span>.
              </p>
            )}
          </div>
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
            title="Recalculate stats based on RenderZ player or position profile"
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

      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[var(--text-main)] opacity-70 gap-1">
        <span>⚡ In H2H matches (/play), these authentic RenderZ stats drive finishing, speed, saves & assists.</span>
        <span className="font-mono text-fuchsia-300">
          {isGK ? 'DIV · POS · HAN · REF · KIC · PHY' : 'PAC · SHO · PAS · DRI · DEF · PHY'}
        </span>
      </div>
    </div>
  );
}
