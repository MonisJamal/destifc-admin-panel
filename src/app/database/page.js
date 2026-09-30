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
  Lock
} from 'lucide-react';

export default function DatabasePage() {
  const [tab, setTab] = useState('official'); // default to 'official' so cards are visible right away
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inspectCard, setInspectCard] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tab, page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/database?tab=${tab}&search=${encodeURIComponent(search)}&page=${page}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
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
  };

  const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // Reusable Layered Mini Card Renderer with Text & Logos
  const renderCardThumbnail = (row) => {
    const ovr = row.rating || row.ovr || 100;
    const pos = row.position || 'ST';
    const isMaster = ovr >= 120;
    const isElite = ovr >= 115 && ovr < 120;

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Cloud Database Explorer</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Supabase Live Sync
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Direct query inspection of Supabase PostgreSQL tables with full FC Mobile card visuals, logos, stats & ownership.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`Search ${tab}...`}
                className="apple-input pl-10 text-sm"
              />
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
              <Database className="w-4 h-4" /> Official Cards Pool
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
                            <td className="py-4 px-6 font-mono text-xs text-neutral-800">{row.user_id}</td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-neutral-900">{row.player_name}</div>
                              <div className="text-[11px] font-semibold text-blue-600 uppercase">{row.program || 'Standard'}</div>
                            </td>
                            <td className="py-4 px-6 font-bold text-amber-500">{row.ovr} OVR</td>
                            <td className="py-4 px-6 text-xs text-neutral-500">
                              {row.club_name || 'Club'} • {row.nation_name || 'Nation'}
                            </td>
                            <td className="py-4 px-6 text-xs">
                              {row.locked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                  🟢 Unlocked
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        {tab === 'market' && (
                          <>
                            <td className="py-3 px-6">
                              {renderCardThumbnail(row)}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-800">{row.seller_id}</td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-neutral-900">{row.player_name}</div>
                              <div className="text-[11px] font-semibold text-blue-600 uppercase">{row.program || 'Market'}</div>
                            </td>
                            <td className="py-4 px-6 font-bold text-amber-500">{row.ovr} OVR</td>
                            <td className="py-4 px-6 font-bold text-emerald-600">🪙 {parseInt(row.price || 0).toLocaleString()}</td>
                            <td className="py-4 px-6 text-xs text-neutral-400">{new Date(row.listed_at).toLocaleString()}</td>
                          </>
                        )}
                        {tab === 'official' && (
                          <>
                            <td className="py-3 px-6">
                              {renderCardThumbnail(row)}
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-500">#{row.asset_id}</td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-neutral-900 text-base">{row.player_name}</div>
                              <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                                <span>{row.club_name || 'Club'}</span>
                                <span>•</span>
                                <span>{row.nation_name || 'Nation'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-black text-amber-500 text-base">{row.rating}</span>{' '}
                              <span className="text-xs font-bold text-neutral-700 px-1.5 py-0.5 rounded bg-neutral-100 border border-black/5 ml-1">
                                {row.position}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs font-bold text-blue-600 uppercase tracking-wide">
                              {row.program || row.source || 'Standard'}
                            </td>
                            <td className="py-4 px-6 text-xs text-neutral-600 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{row.club_name || 'Club'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-neutral-500">
                                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{row.nation_name || 'Nation'}</span>
                              </div>
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
            <div className="p-4 border-t border-black/5 flex items-center justify-between text-xs font-medium text-neutral-500 bg-white/20">
              <span>Showing {data.length} of {total.toLocaleString()} total records</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-xl bg-white/80 border border-white disabled:opacity-30 hover:bg-white cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-neutral-700">Page {page} of {totalPages || 1}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-xl bg-white/80 border border-white disabled:opacity-30 hover:bg-white cursor-pointer shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
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
