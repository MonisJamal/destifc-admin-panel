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

export function buildFullStats(avgStats, position) {
  if (!avgStats) return { avgStats: null, stats: null };

  const pos = (position || 'ST').toUpperCase();
  const isGK = pos === 'GK';

  const a1 = parseInt(avgStats.avg1, 10) || 120;
  const a2 = parseInt(avgStats.avg2, 10) || 120;
  const a3 = parseInt(avgStats.avg3, 10) || 120;
  const a4 = parseInt(avgStats.avg4, 10) || 120;
  const a5 = parseInt(avgStats.avg5, 10) || 120;
  const a6 = parseInt(avgStats.avg6, 10) || 120;

  const cleanAvg = {
    avg1: a1,
    avg2: a2,
    avg3: a3,
    avg4: a4,
    avg5: a5,
    avg6: a6
  };

  let stats = {};

  if (isGK) {
    // a1: DIV, a2: POS, a3: HAN, a4: REF, a5: KIC, a6: PHY
    stats = {
      gkd: a1,
      gkp: a2,
      han: a3,
      ref: a4,
      gkk: a5,
      phy: a6,
      str: a6,
      jmp: a4,
      rea: a4,
      spd: Math.round(a1 * 0.6),
      acc: Math.round(a1 * 0.65),
      awr: a2,
      total: a1 + a2 + a3 + a4 + a5 + a6
    };
  } else {
    // a1: PAC, a2: SHO, a3: PAS, a4: DRI, a5: DEF, a6: PHY
    stats = {
      // Pace
      pac: a1,
      spd: a1,
      acc: a1,

      // Shooting
      sho: a2,
      fin: Math.round(a2 * 1.02),
      pos: a2,
      lgs: Math.round(a2 * 0.98),
      pen: a2,
      vol: Math.round(a2 * 0.96),

      // Passing
      pas: a3,
      spa: Math.round(a3 * 1.02),
      lpa: Math.round(a3 * 0.96),
      vis: a3,
      cro: Math.round(a3 * 0.92),
      cur: a3,
      frk: Math.round(a3 * 0.90),

      // Dribbling
      dri: a4,
      agi: a4,
      bal: Math.round(a4 * 0.98),
      rea: Math.round(a4 * 1.02),
      bac: a4,

      // Defending
      def: a5,
      mrk: a5,
      stt: Math.round(a5 * 1.02),
      slt: Math.round(a5 * 0.95),
      int: a5,
      awr: a5,
      hea: Math.round(a5 * 0.9 + a6 * 0.1),

      // Physical
      phy: a6,
      str: a6,
      sta: a6,
      agg: Math.round(a6 * 0.96),
      jmp: a6,

      total: a1 + a2 + a3 + a4 + a5 + a6
    };
  }

  return { avgStats: cleanAvg, stats };
}
