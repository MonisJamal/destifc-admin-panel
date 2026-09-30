export const nationMap = {
  14: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", 18: "🇫🇷 France", 27: "🇮🇹 Italy", 54: "🇧🇷 Brazil", 
  34: "🇳🇱 Netherlands", 45: "🇪🇸 Spain", 35: "🍀 Northern Ireland", 50: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales", 
  108: "🇨🇮 Ivory Coast", 7: "🇧🇪 Belgium", 21: "🇩🇪 Germany", 38: "🇵🇹 Portugal", 
  52: "🇦🇷 Argentina", 60: "🇺🇾 Uruguay", 83: "🇲🇽 Mexico", 163: "🇯🇵 Japan", 
  95: "🇺🇸 USA", 10: "🇭🇷 Croatia", 36: "🇳🇴 Norway", 46: "🇸🇪 Sweden", 56: "🇨🇴 Colombia",
  106: "🇸🇳 Senegal", 111: "🇪🇬 Egypt", 13: "🇩🇰 Denmark", 104: "🇲🇦 Morocco",
  9: "🇧🇬 Bulgaria", 42: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland", 49: "🇺🇦 Ukraine", 133: "🇳🇬 Nigeria",
  39: "🇷🇴 Romania", 59: "🇵🇪 Peru", 70: "🇨🇦 Canada", 103: "🇨🇲 Cameroon",
  117: "🇬🇭 Ghana", 129: "🇲🇦 Morocco", 167: "🇰🇷 Korea Republic", 191: "🇺🇿 Uzbekistan",
  12: "🇨🇿 Czech Republic", 47: "🇨🇭 Switzerland", 20: "🇬🇪 Georgia", 48: "🇹🇷 Turkey"
};

export const clubMap = {
  114154: "🛡️ Icons", 115935: "🛡️ Heroes", 241: "🛡️ FC Barcelona", 243: "🛡️ Real Madrid",
  21: "🛡️ Bayern Munich", 11: "🛡️ Manchester United", 9: "🛡️ Liverpool", 10: "🛡️ Manchester City",
  5: "🛡️ Chelsea", 1: "🛡️ Arsenal", 73: "🛡️ Paris SG", 45: "🛡️ Juventus", 44: "🛡️ Inter", 
  47: "🛡️ AC Milan", 236: "🛡️ Sporting CP", 112139: "🛡️ Al Nassr", 112533: "🛡️ Inter Miami", 
  896: "🛡️ FC Basel", 175: "🛡️ Bayer Leverkusen", 112658: "🛡️ Al Hilal",
  325: "🛡️ Galatasaray", 1335: "🛡️ France", 1362: "🛡️ Spain",
  1318: "🛡️ England", 1325: "🛡️ Belgium", 1352: "🛡️ Norway", 
  1354: "🛡️ Portugal", 1364: "🛡️ Switzerland", 1369: "🛡️ Argentina",
  22: "🛡️ Borussia Dortmund", 327: "🛡️ VfB Stuttgart", 112606: "🛡️ Atletico Madrid",
  114640: "🛡️ Charlotte FC", 111111: "🛡️ PSV", 18: "🛡️ RB Leipzig", 689: "🛡️ NY Red Bulls",
  101014: "🛡️ CSKA Moscow", 111130: "🛡️ Liverpool", 1370: "🛡️ Brazil", 1328: "🛡️ Croatia"
};

export function formatNation(nation) {
  if (!nation) return "World";
  if (typeof nation === 'string') {
    const match = nation.match(/\d+/);
    if (match && nationMap[parseInt(match[0], 10)]) return nationMap[parseInt(match[0], 10)];
    return nation.replace('NationName_', '');
  }
  if (nation.id && nationMap[nation.id]) return nationMap[nation.id];
  if (nation.name) {
    const match = String(nation.name).match(/\d+/);
    if (match && nationMap[parseInt(match[0], 10)]) return nationMap[parseInt(match[0], 10)];
    return String(nation.name).replace('NationName_', '');
  }
  return "World";
}

export function formatClub(club) {
  if (!club) return "Club";
  if (typeof club === 'string') {
    const match = club.match(/\d+/);
    if (match && clubMap[parseInt(match[0], 10)]) return clubMap[parseInt(match[0], 10)];
    return club.replace('TeamName_', '');
  }
  if (club.id && clubMap[club.id]) return clubMap[club.id];
  if (club.name) {
    const match = String(club.name).match(/\d+/);
    if (match && clubMap[parseInt(match[0], 10)]) return clubMap[parseInt(match[0], 10)];
    return String(club.name).replace('TeamName_', '');
  }
  return "Club";
}

export function formatProgram(source) {
  if (!source) return "Base";
  return source.replace('PROGRAM_', '').replace(/_/g, ' ');
}
