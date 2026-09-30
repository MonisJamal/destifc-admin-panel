'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, ChevronLeft, ChevronRight, User, CreditCard, ShoppingBag, Database, Sparkles, Shield, Globe } from 'lucide-react';

export default function DatabasePage() {
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Cloud Database Explorer</h1>
              <p className="text-sm text-neutral-500 mt-1">Direct query inspection of Supabase PostgreSQL tables with live card visuals.</p>
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

          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl glass-card w-fit border border-white/60">
            <button
              onClick={() => handleTabChange('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'users' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-4 h-4" /> Users
            </button>
            <button
              onClick={() => handleTabChange('inventory')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'inventory' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card Inventory
            </button>
            <button
              onClick={() => handleTabChange('market')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'market' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Market Listings
            </button>
            <button
              onClick={() => handleTabChange('official')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'official' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Database className="w-4 h-4" /> Official Cards Pool
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-white/30">
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
                        <th className="py-4 px-6">Player Name</th>
                        <th className="py-4 px-6">OVR Rating</th>
                        <th className="py-4 px-6">Locked Status</th>
                      </>
                    )}
                    {tab === 'market' && (
                      <>
                        <th className="py-4 px-6">Card Visual</th>
                        <th className="py-4 px-6">Seller ID</th>
                        <th className="py-4 px-6">Player Name</th>
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
                      <td colSpan="6" className="text-center py-12 text-neutral-400">Loading live table records...</td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-neutral-400">No records found matching criteria.</td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/40 transition-colors">
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
                              <div className="w-12 h-14 rounded-xl bg-neutral-900/10 relative overflow-hidden flex items-center justify-center border border-black/5 shadow-sm">
                                {row.bg_image && (
                                  <img src={getProxyUrl(row.bg_image)} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                )}
                                {row.image ? (
                                  <img src={getProxyUrl(row.image)} alt="" className="relative z-10 w-10 h-10 object-contain drop-shadow" />
                                ) : (
                                  <Sparkles className="w-5 h-5 text-neutral-400" />
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-800">{row.user_id}</td>
                            <td className="py-4 px-6 font-bold text-neutral-900">
                              <div className="flex items-center gap-2">
                                <span>{row.player_name}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">{row.position || 'ST'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-amber-500">{row.ovr} OVR</td>
                            <td className="py-4 px-6 text-xs">{row.locked ? '🔒 Locked' : '🟢 Unlocked'}</td>
                          </>
                        )}
                        {tab === 'market' && (
                          <>
                            <td className="py-3 px-6">
                              <div className="w-12 h-14 rounded-xl bg-neutral-900/10 relative overflow-hidden flex items-center justify-center border border-black/5 shadow-sm">
                                {row.bg_image && (
                                  <img src={getProxyUrl(row.bg_image)} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                )}
                                {row.image ? (
                                  <img src={getProxyUrl(row.image)} alt="" className="relative z-10 w-10 h-10 object-contain drop-shadow" />
                                ) : (
                                  <Sparkles className="w-5 h-5 text-neutral-400" />
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-800">{row.seller_id}</td>
                            <td className="py-4 px-6 font-bold text-neutral-900">
                              <div className="flex items-center gap-2">
                                <span>{row.player_name}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">{row.position || 'ST'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-amber-500">{row.ovr} OVR</td>
                            <td className="py-4 px-6 font-bold text-emerald-600">🪙 {parseInt(row.price || 0).toLocaleString()}</td>
                            <td className="py-4 px-6 text-xs text-neutral-400">{new Date(row.listed_at).toLocaleString()}</td>
                          </>
                        )}
                        {tab === 'official' && (
                          <>
                            <td className="py-3 px-6">
                              <div className="w-12 h-14 rounded-xl bg-neutral-900/10 relative overflow-hidden flex items-center justify-center border border-black/5 shadow-sm">
                                {row.bg_image && (
                                  <img src={getProxyUrl(row.bg_image)} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                )}
                                {row.image ? (
                                  <img src={getProxyUrl(row.image)} alt="" className="relative z-10 w-10 h-10 object-contain drop-shadow" />
                                ) : (
                                  <Sparkles className="w-5 h-5 text-neutral-400" />
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-xs text-neutral-500">#{row.asset_id}</td>
                            <td className="py-4 px-6 font-bold text-neutral-900">{row.player_name}</td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-amber-500">{row.rating} OVR</span>{' '}
                              <span className="text-xs font-semibold text-neutral-500">({row.position})</span>
                            </td>
                            <td className="py-4 px-6 text-xs font-semibold text-blue-600 uppercase">{row.source || 'Standard'}</td>
                            <td className="py-4 px-6 text-xs text-neutral-500">
                              {row.club_name || 'Club'} • {row.nation_name || 'Nation'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-black/5 flex items-center justify-between text-xs font-medium text-neutral-500 bg-white/20">
              <span>Showing {data.length} of {total.toLocaleString()} total entries</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-xl bg-white/80 border border-white disabled:opacity-30 hover:bg-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page {page} of {totalPages || 1}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-xl bg-white/80 border border-white disabled:opacity-30 hover:bg-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

