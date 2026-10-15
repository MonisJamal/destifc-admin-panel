/**
 * RenderZ In-Game Attributes & Match Stats Generator
 * Bridges primary avgStats (PAC, SHO, PAS, DRI, DEF, PHY / GK) into full detailed stats
 */

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
