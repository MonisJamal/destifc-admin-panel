'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { Search, ChevronLeft, ChevronRight, Gift, Sparkles, Filter, X, CheckCircle2, AlertCircle, Shield, Globe } from 'lucide-react';

export default function RenderZDatabasePage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [minOvr, setMinOvr] = useState('120');
  const [maxOvr, setMaxOvr] = useState('122');
  const [position, setPosition] = useState('ALL');
  const [program, setProgram] = useState('ALL');
  const [page, setPage] = useState(1);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Give Modal State
  const [selectedCard, setSelectedCard] = useState(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMessage, setGrantMessage] = useState({ type: '', text: '' });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch cards whenever filters change
  useEffect(() => {
    fetchCards();
  }, [debouncedQuery, minOvr, maxOvr, position, program, page]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: debouncedQuery,
        position: position === 'ALL' ? '' : position,
        program: program === 'ALL' ? '' : program,
        page: page.toString(),
        size: '24'
      });

      if (minOvr) params.append('minOvr', minOvr);
      if (maxOvr) params.append('maxOvr', maxOvr);

      const res = await fetch(`/api/renderz/cards?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCards(data.cards || []);
        setHasMore(data.hasMore);
      } else {
        setCards([]);
      }
    } catch (e) {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveCard = async (e) => {
    e.preventDefault();
    if (!targetUserId || !targetUserId.trim() || !selectedCard) return;

    setGrantLoading(true);
    setGrantMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'give_card',
          userId: targetUserId.trim(),
          playerData: selectedCard
        })
      });
      const data = await res.json();
      if (data.success) {
        setGrantMessage({
          type: 'success',
          text: `✅ Successfully granted ${selectedCard.rating} OVR ${selectedCard.cardName} to user ${targetUserId.trim()}!`
        });
      } else {
        setGrantMessage({ type: 'error', text: data.error || 'Failed to grant card' });
      }
    } catch (err) {
      setGrantMessage({ type: 'error', text: 'Network connection failed' });
    } finally {
      setGrantLoading(false);
    }
  };

  const openGiveModal = (card) => {
    setSelectedCard(card);
    setGrantMessage({ type: '', text: '' });
  };

  const ovrPresets = [
    { label: 'All Ratings', min: '', max: '' },
    { label: '120 - 122 (Master Walkouts)', min: '120', max: '122' },
    { label: '115 - 119 (Elite Stars)', min: '115', max: '119' },
    { label: '110 - 114 (Icons / Heroes)', min: '110', max: '114' },
    { label: '100 - 109 (Standard)', min: '100', max: '109' },
  ];

  const positions = ['ALL', 'ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'CB', 'LB', 'RB', 'GK'];

  const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
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
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">RenderZ Official Database</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  FC Mobile 25/26
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Live search and browse thousands of official FC Mobile cards. Grant any player card directly to any Discord member.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search player name (e.g. Messi, Ronaldo, Pelé)..."
                className="apple-input pl-10 text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-amber-400 shadow-sm'
                        : 'bg-white/60 hover:bg-white text-neutral-600 border border-black/5'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Position Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-black/5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-2">Position:</span>
              {positions.map((pos) => {
                const isActive = position === pos;
                return (
                  <button
                    key={pos}
                    onClick={() => {
                      setPosition(pos);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white/40 hover:bg-white text-neutral-600 border border-black/5'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
              <span>{loading ? 'Searching RenderZ live database...' : `Showing ${cards.length} cards`}</span>
              <span>Page {page}</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="glass-card p-5 h-80 animate-pulse flex flex-col justify-between rounded-3xl">
                    <div className="w-12 h-6 bg-neutral-200/60 rounded-lg"></div>
                    <div className="w-28 h-28 bg-neutral-200/60 rounded-2xl mx-auto"></div>
                    <div className="w-3/4 h-4 bg-neutral-200/60 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="glass-card p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">No Players Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your search query, OVR rating tier, or position filters to find the players you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                  const ovr = card.rating || card.ovr;
                  const isMaster = ovr >= 120;
                  const isElite = ovr >= 115 && ovr < 120;

                  return (
                    <div
                      key={card.id || card.assetId}
                      className="glass-card p-5 flex flex-col justify-between rounded-3xl hover:shadow-xl transition-all duration-300 border border-white/80 group relative overflow-hidden bg-gradient-to-b from-white/95 to-white/60"
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between z-10">
                        <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white shadow-md">
                          <span className={`text-lg font-black leading-none ${isMaster ? 'text-amber-400' : (isElite ? 'text-purple-400' : 'text-blue-400')}`}>
                            {ovr}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-300 tracking-wider">
                            {card.position}
                          </span>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="text-[11px] font-bold text-neutral-800 flex items-center justify-end gap-1">
                            <Globe className="w-3 h-3 text-neutral-400" />
                            <span className="truncate max-w-[100px]">{card.nation?.name || 'World'}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 font-medium flex items-center justify-end gap-1">
                            <Shield className="w-3 h-3 text-neutral-400" />
                            <span className="truncate max-w-[100px]">{card.club?.name || 'Club'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Authentic Layered Card Canvas */}
                      <div className="my-2 flex items-center justify-center relative w-full h-44 overflow-hidden rounded-2xl bg-neutral-950/5 border border-black/5">
                        {card.images?.playerCardBackground && (
                          <img
                            src={getProxyUrl(card.images.playerCardBackground)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-sm"
                            loading="lazy"
                          />
                        )}
                        {card.images?.playerCardImage || card.images?.playerImage ? (
                          <img
                            src={getProxyUrl(card.images.playerCardImage || card.images.playerImage)}
                            alt=""
                            loading="lazy"
                            className="relative z-10 w-36 h-36 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                            <Sparkles className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Info & Action */}
                      <div className="space-y-3 z-10 text-center">
                        <div>
                          <div className="font-black text-sm text-neutral-900 uppercase tracking-wide truncate">
                            {card.cardName || card.lastName}
                          </div>
                          <div className="text-[10px] font-bold tracking-wider text-blue-600 uppercase mt-0.5 truncate">
                            {card.program?.name || 'FC Mobile Star'}
                          </div>
                        </div>

                        <button
                          onClick={() => openGiveModal(card)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-md shadow-neutral-900/10 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5 text-amber-400" />
                          <span>Give to User</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between text-xs font-medium text-neutral-500">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 border border-white disabled:opacity-30 hover:bg-white transition-all cursor-pointer font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span>Page {page}</span>
              <button
                disabled={!hasMore || loading}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/80 border border-white disabled:opacity-30 hover:bg-white transition-all cursor-pointer font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Give Card Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/60 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Grant Player Card</h3>
                    <p className="text-xs text-neutral-500">Instantly place this card into a user's inventory.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Card Preview */}
              <div className="p-4 rounded-2xl bg-neutral-900 text-white flex items-center gap-4 shadow-inner">
                <div className="w-14 h-14 rounded-xl bg-neutral-800 flex flex-col items-center justify-center shrink-0 border border-white/10">
                  <span className="text-xl font-black text-amber-400 leading-none">{selectedCard.rating || selectedCard.ovr}</span>
                  <span className="text-[10px] font-bold text-neutral-300">{selectedCard.position}</span>
                </div>
                <div className="truncate flex-1">
                  <div className="font-bold text-base truncate">{selectedCard.cardName || selectedCard.lastName}</div>
                  <div className="text-xs text-neutral-400 font-medium truncate">
                    {selectedCard.club?.name || 'Club'} • {selectedCard.nation?.name || 'Nation'}
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase mt-0.5">
                    {selectedCard.program?.name || 'Official Release'}
                  </div>
                </div>
              </div>

              {grantMessage.text && (
                <div
                  className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-medium ${
                    grantMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-700 border border-red-500/20'
                  }`}
                >
                  {grantMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{grantMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleGiveCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Recipient Discord User ID
                  </label>
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="e.g. 9582739218273910"
                    className="apple-input font-mono text-sm"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Right-click the Discord member and click "Copy User ID".
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCard(null)}
                    className="flex-1 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex-1">
                    <LiquidButton
                      text={grantLoading ? "Granting..." : "Confirm & Give"}
                      type="submit"
                      disabled={grantLoading}
                      width="100%"
                      height="46px"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
