'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  CreditCard, 
  ShoppingBag, 
  Database, 
  Sparkles, 
  Shield, 
  Globe,
  X,
  Flame,
  Maximize2,
  Lock,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export default function DatabasePage() {
  const [tab, setTab] = useState('official'); // 'official' | 'inventory' | 'market' | 'users'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minOvr, setMinOvr] = useState('');
  const [maxOvr, setMaxOvr] = useState('');
  const [position, setPosition] = useState('ALL');
  const [program, setProgram] = useState('ALL');
  const [sort, setSort] = useState('ovr_desc');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [maxDbOvr, setMaxDbOvr] = useState(124);
  const [loading, setLoading] = useState(false);
  const [inspectCard, setInspectCard] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [tab, page, debouncedSearch, minOvr, maxOvr, position, program, sort]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tab,
        search: debouncedSearch,
        page: page.toString(),
        sort
      });

      if (minOvr) params.append('minOvr', minOvr);
      if (maxOvr) params.append('maxOvr', maxOvr);
      if (position && position !== 'ALL') params.append('position', position);
      if (program && program !== 'ALL') params.append('program', program);

      const res = await fetch(`/api/database?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        if (json.maxOvr) {
          setMaxDbOvr(json.maxOvr);
        }
      }
    } catch (e) {}
    finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
    setSearch('');
    setDebouncedSearch('');
    setMinOvr('');
    setMaxOvr('');
    setPosition('ALL');
    setProgram('ALL');
  };

  const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // Dynamic OVR Presets based on highest OVR available
  const topTierMin = Math.max(120, maxDbOvr - 2);
  const eliteTierMin = Math.max(115, maxDbOvr - 5);
  const eliteTierMax = Math.max(117, maxDbOvr - 3);
  const standardTierMin = Math.max(110, maxDbOvr - 10);
  const standardTierMax = Math.max(112, maxDbOvr - 6);

  const ovrPresets = [
    { label: 'All Ratings', min: '', max: '' },
    { label: `${topTierMin} - ${maxDbOvr}+ (Pool A Walkouts)`, min: topTierMin.toString(), max: maxDbOvr.toString() },
    { label: `${eliteTierMin} - ${eliteTierMax} (Pool B Elites)`, min: eliteTierMin.toString(), max: eliteTierMax.toString() },
    { label: `${standardTierMin} - ${standardTierMax} (Pool C Standards)`, min: standardTierMin.toString(), max: standardTierMax.toString() },
    { label: '100 - 111 (Base / Events)', min: '100', max: '111' },
    { label: '< 100 (Core / Silvers / Bronzes)', min: '45', max: '99' },
  ];

  const positions = ['ALL', 'ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'GK'];
  const programs = ['ALL', 'ICON', 'HERO', 'TOTY', 'TOTS', 'UCL', 'BALLON', 'RETRO', 'RIVALS', 'BASE'];

  // Reusable Layered Mini Card Renderer with Text & Logos
  const renderCardThumbnail = (row) => {
    const ovr = row.rating || row.ovr || 100;
    const pos = row.position || 'ST';
    const isMaster = ovr >= topTierMin;
    const isElite = ovr >= eliteTierMin && ovr < topTierMin;

    return (
      <div 
        onClick={() => setInspectCard(row)}
        className="w-20 h-28 rounded-2xl bg-neutral-950 relative overflow-hidden flex flex-col justify-between p-1.5 border border-white/20 shadow-md group cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 select-none"
        title="Click to inspect card in HD"
      >
        {/* Background Card Art */}
        {row.bg_image ? (
          <img 
            src={getProxyUrl(row.bg_image)} 
            alt="" 
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            onError={(e) => { e.currentTarget.src = row.bg_image; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-950"></div>
        )}

        {/* Player Render Cut-out */}
        {row.image ? (
          <img 
            src={getProxyUrl(row.image)} 
            alt="" 
            referrerPolicy="no-referrer"
            className="absolute inset-x-0 bottom-3 w-16 h-16 mx-auto object-contain drop-shadow-md z-10 group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.currentTarget.src = row.image; }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500 z-10">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        )}

        {/* Top Badges (OVR & POS on Left | Club & Flag on Right) */}
        <div className="relative z-20 flex items-start justify-between w-full">
          {/* Left: OVR & Position */}
          <div className="flex flex-col items-center leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <span className={`text-xs font-black ${isMaster ? 'text-amber-400' : (isElite ? 'text-purple-300' : 'text-blue-300')}`}>
              {ovr}
            </span>
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">
              {pos}
            </span>
          </div>

          {/* Right: Club Crest & Flag Logo */}
          <div className="flex flex-col items-end gap-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {row.flag_image && (
              <img 
                src={getProxyUrl(row.flag_image)} 
                alt="" 
                referrerPolicy="no-referrer"
                className="w-3.5 h-2.5 object-contain rounded-sm"
                onError={(e) => { e.currentTarget.src = row.flag_image; }}
              />
            )}
            {row.club_image && (
              <img 
                src={getProxyUrl(row.club_image)} 
                alt="" 
                referrerPolicy="no-referrer"
                className="w-3.5 h-3.5 object-contain"
                onError={(e) => { e.currentTarget.src = row.club_image; }}
              />
            )}
          </div>
        </div>

        {/* Bottom Banner: Player Name */}
        <div className="relative z-20 w-full text-center bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-1 pb-0.5 rounded-b-xl">
          <span className="block text-[8px] font-black text-white uppercase tracking-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {row.player_name || 'PLAYER'}
          </span>
        </div>

        {/* Quick Inspect Hover Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 pointer-events-none rounded-2xl">
          <Maximize2 className="w-4 h-4 text-white drop-shadow" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0d0914] text-neutral-100 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-64 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Cloud Database Explorer</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Max OVR: {maxDbOvr}+
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {total.toLocaleString()} Total Records
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Direct query inspection of Supabase PostgreSQL tables with exact OVR tiers, positions, events, logos & stats.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab} by name, asset ID, or source...`}
                className="apple-input pl-10 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl glass-card w-fit border border-white/60">
            <button
              onClick={() => handleTabChange('official')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'official' ? 'bg-neutral-900 text-amber-400 shadow-md' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Database className="w-4 h-4" /> Official Cards Pool ({total.toLocaleString()})
            </button>
            <button
              onClick={() => handleTabChange('inventory')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'inventory' ? 'bg-neutral-900 text-amber-400 shadow-md' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card Inventory
            </button>
            <button
              onClick={() => handleTabChange('market')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'market' ? 'bg-neutral-900 text-amber-400 shadow-md' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Market Listings
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'users' ? 'bg-neutral-900 text-amber-400 shadow-md' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-4 h-4" /> Users & Balances
            </button>
          </div>

          {/* Exact Filter Controls (for official, inventory, and market tabs) */}
          {tab !== 'users' && (
            <div className="glass-card p-6 space-y-4">
              {/* OVR Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> OVR Tier:
                </span>
                {ovrPresets.map((preset, idx) => {
                  const isActive = minOvr === preset.min && maxOvr === preset.max;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setMinOvr(preset.min);
                        setMaxOvr(preset.max);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-neutral-900 text-amber-400 shadow-sm'
                          : 'bg-white/60 text-neutral-600 hover:bg-white hover:text-neutral-900 border border-white/80'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Exact Controls Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-black/5">
                {/* Custom Min / Max OVR */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">Min OVR:</span>
                  <input
                    type="number"
                    min="45"
                    max={maxDbOvr}
                    value={minOvr}
                    onChange={(e) => { setMinOvr(e.target.value); setPage(1); }}
                    placeholder="45"
                    className="w-16 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                  <span className="text-xs font-semibold text-neutral-500">Max OVR:</span>
                  <input
                    type="number"
                    min="45"
                    max={maxDbOvr + 5}
                    value={maxOvr}
                    onChange={(e) => { setMaxOvr(e.target.value); setPage(1); }}
                    placeholder={maxDbOvr.toString()}
                    className="w-16 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {/* Position Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">Position:</span>
                  <select
                    value={position}
                    onChange={(e) => { setPosition(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                  >
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                {/* Program Filter */}
                {tab === 'official' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500">Event / Program:</span>
                    <select
                      value={program}
                      onChange={(e) => { setProgram(e.target.value); setPage(1); }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                    >
                      {programs.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort Order */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                  >
                    <option value="ovr_desc">OVR: High to Low</option>
                    <option value="ovr_asc">OVR: Low to High</option>
                    <option value="name_asc">Player Name: A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="glass-card overflow-hidden rounded-3xl border border-white/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-[11px] font-black text-neutral-400 uppercase tracking-wider bg-white/40">
                    {tab === 'users' && (
                      <>
                        <th className="py-4 px-6">User Discord ID</th>
                        <th className="py-4 px-6">Coins</th>
                        <th className="py-4 px-6">Vouchers</th>
                        <th className="py-4 px-6">Gems</th>
                        <th className="py-4 px-6">Fans</th>
                        <th className="py-4 px-6">Drafts Opened</th>
                      </>
                    )}
                    {tab === 'inventory' && (
                      <>
                        <th className="py-4 px-6">Card Visual</th>
                        <th className="py-4 px-6">Owner User ID</th>
                        <th className="py-4 px-6">Player & Program</th>
                        <th className="py-4 px-6">OVR Rating</th>
                        <th className="py-4 px-6">Club & Nation</th>
                        <th className="py-4 px-6">Locked Status</th>
                      </>
                    )}
                    {tab === 'market' && (
                      <>
                        <th className="py-4 px-6">Card Visual</th>
                        <th className="py-4 px-6">Seller ID</th>
                        <th className="py-4 px-6">Player & Program</th>
                        <th className="py-4 px-6">OVR</th>
                        <th className="py-4 px-6">Asking Price</th>
                        <th className="py-4 px-6">Listed Timestamp</th>
                      </>
                    )}
                    {tab === 'official' && (
                      <>
                        <th className="py-4 px-6">Card Visual</th>
                        <th className="py-4 px-6">Asset ID</th>
                        <th className="py-4 px-6">Player Name</th>
                        <th className="py-4 px-6">OVR & POS</th>
                        <th className="py-4 px-6">Program / Event</th>
                        <th className="py-4 px-6">Club & Nation</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-sm font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-neutral-400">
                        <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Loading live table records...</span>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-neutral-400">
                        No records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/50 transition-colors">
                        {tab === 'users' && (
                          <>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-800">{row.user_id}</td>
                            <td className="py-4 px-6 font-bold text-emerald-600">🪙 {parseInt(row.coins || 0).toLocaleString()}</td>
                            <td className="py-4 px-6 text-indigo-600 font-semibold">{row.vouchers || 0}</td>
                            <td className="py-4 px-6 text-purple-600 font-semibold">{row.gems || 0}</td>
                            <td className="py-4 px-6 text-neutral-600">{parseInt(row.fans || 0).toLocaleString()}</td>
                            <td className="py-4 px-6 text-neutral-600">{row.drafts_opened || 0}</td>
                          </>
                        )}
                        {tab === 'inventory' && (
                          <>
                            <td className="py-3 px-6">
                              {renderCardThumbnail(row)}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-700">{row.user_id}</td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-neutral-900">{row.player_name}</div>
                              <div className="text-xs text-neutral-500">{row.program}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-neutral-900 text-amber-400 shadow-sm">
                                {row.ovr} {row.position}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-neutral-600">
                              <div>🛡️ {row.club_name}</div>
                              <div>🌍 {row.nation_name}</div>
                            </td>
                            <td className="py-4 px-6">
                              {row.locked === 1 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400 font-medium">Unlocked</span>
                              )}
                            </td>
                          </>
                        )}
                        {tab === 'market' && (
                          <>
                            <td className="py-3 px-6">
                              {renderCardThumbnail(row)}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-700">{row.seller_id}</td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-neutral-900">{row.player_name}</div>
                              <div className="text-xs text-neutral-500">{row.program}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-neutral-900 text-amber-400 shadow-sm">
                                {row.ovr} {row.position}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-emerald-600">
                              🪙 {parseInt(row.price || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-xs text-neutral-500 font-mono">
                              {new Date(row.listed_at).toLocaleString()}
                            </td>
                          </>
                        )}
                        {tab === 'official' && (
                          <>
                            <td className="py-3 px-6">
                              {renderCardThumbnail(row)}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-600">#{row.asset_id}</td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-neutral-900">{row.player_name}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-neutral-900 text-amber-400 shadow-sm">
                                {row.rating} {row.position}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {row.program}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs text-neutral-600">
                              <div>🛡️ {row.club_name}</div>
                              <div>🌍 {row.nation_name}</div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-black/5 flex items-center justify-between bg-white/40">
              <span className="text-xs font-semibold text-neutral-500">
                Showing Page <span className="text-neutral-900 font-bold">{page}</span> of <span className="text-neutral-900 font-bold">{totalPages}</span> ({total.toLocaleString()} records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-black/10 text-xs font-bold text-neutral-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-black/10 text-xs font-bold text-neutral-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Inspector HD Modal */}
        {inspectCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <div className="bg-neutral-950 border border-white/10 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold">Player Card Inspector</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                    {inspectCard.program || inspectCard.source || 'Official Card'}
                  </span>
                </div>
                <button
                  onClick={() => setInspectCard(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Card Visual */}
              <div className="flex justify-center">
                <div className="w-48 h-64 rounded-3xl bg-neutral-900 relative overflow-hidden flex flex-col justify-between p-3 border border-white/20 shadow-2xl">
                  {inspectCard.bg_image ? (
                    <img 
                      src={getProxyUrl(inspectCard.bg_image)} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-800"></div>
                  )}

                  {inspectCard.image && (
                    <img 
                      src={getProxyUrl(inspectCard.image)} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="absolute inset-x-0 bottom-6 w-36 h-36 mx-auto object-contain drop-shadow-xl z-10"
                    />
                  )}

                  {/* Top Badges */}
                  <div className="relative z-20 flex items-start justify-between w-full">
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-xl font-black text-amber-400 drop-shadow">
                        {inspectCard.rating || inspectCard.ovr}
                      </span>
                      <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow mt-0.5">
                        {inspectCard.position || 'ST'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 drop-shadow">
                      {inspectCard.flag_image && (
                        <img 
                          src={getProxyUrl(inspectCard.flag_image)} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-6 h-4 object-contain rounded"
                        />
                      )}
                      {inspectCard.club_image && (
                        <img 
                          src={getProxyUrl(inspectCard.club_image)} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Bottom Banner */}
                  <div className="relative z-20 w-full text-center bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-2 pb-1 rounded-b-2xl">
                    <span className="block text-xs font-black text-white uppercase tracking-wide truncate">
                      {inspectCard.player_name}
                    </span>
                    <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                      {inspectCard.club_name || 'Official'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Metadata & Stats */}
              <div className="bg-neutral-900/80 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Player Name:</span>
                  <span className="font-bold text-white">{inspectCard.player_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Rating & Position:</span>
                  <span className="font-bold text-amber-400">{inspectCard.rating || inspectCard.ovr} OVR • {inspectCard.position}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Club & League:</span>
                  <span className="font-medium text-neutral-200">{inspectCard.club_name || 'Club'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-neutral-400">Nation:</span>
                  <span className="font-medium text-neutral-200">{inspectCard.nation_name || 'World'}</span>
                </div>
                {inspectCard.asset_id && (
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">RenderZ Asset ID:</span>
                    <span className="font-mono text-neutral-300">#{inspectCard.asset_id}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <button
                  onClick={() => setInspectCard(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
