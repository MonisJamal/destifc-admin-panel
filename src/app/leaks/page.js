'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Lock, 
  CheckCircle, 
  Image as ImageIcon, 
  Download, 
  X, 
  Search, 
  Globe, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Share2, 
  Calendar,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function LeaksDraftsPage() {
  const [activeTab, setActiveTab] = useState('renderz');
  const [category, setCategory] = useState('all'); // 'all' | 'icons' | 'heroes' | 'live' | '120plus'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [fetchedAt, setFetchedAt] = useState('');

  // 16:9 Banner Generator State
  const [bannerCard, setBannerCard] = useState(null);
  const canvasRef = useRef(null);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchLeaks();
  }, [category, debouncedSearch, page]);

  const fetchLeaks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        page: page.toString(),
        size: '24'
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

      const res = await fetch(`/api/leaks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCards(data.cards || []);
        setHasMore(data.hasMore);
        if (data.fetchedAt) setFetchedAt(data.fetchedAt);
      }
    } catch (e) {}
    finally {
      setLoading(false);
    }
  };

  const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // Render 16:9 Landscape Banner on HTML5 Canvas
  const openBannerGenerator = (card) => {
    setBannerCard(card);
    setIsGeneratingBanner(true);
    setTimeout(() => {
      render16x9Banner(card);
    }, 100);
  };

  const render16x9Banner = async (card) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1920;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // 1. Background: Dark Cyber Stadium Gradient
    const bgGrad = ctx.createRadialGradient(W * 0.35, H * 0.5, 50, W * 0.5, H * 0.5, W * 0.8);
    bgGrad.addColorStop(0, '#1a1f38');
    bgGrad.addColorStop(0.5, '#0d1120');
    bgGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // High-tech Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Glow accents
    const glowGrad = ctx.createRadialGradient(480, 540, 10, 480, 540, 450);
    glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. DestiFC Watermark & Header
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 32px sans-serif';
    ctx.fillText('⚡ DESTIFC DATA-MINED LEAKS', 120, 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('UNRELEASED EA GAME FILES & UPCOMING DRAFTS MINING', 120, 155);

    // 3. Load & Draw Card Images
    const bgUrl = card.images?.playerCardBackground;
    const playerUrl = card.images?.playerCardImage || card.images?.playerImage;

    const cardX = 220;
    const cardY = 220;
    const cardW = 540;
    const cardH = 700;

    const loadImage = (src) => {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          // Fallback to direct URL if proxy load ever fails
          const fallback = new Image();
          fallback.crossOrigin = 'anonymous';
          fallback.onload = () => resolve(fallback);
          fallback.onerror = () => resolve(null);
          fallback.src = src;
        };
        img.src = getProxyUrl(src);
      });
    };

    const [bgImg, pImg] = await Promise.all([loadImage(bgUrl), loadImage(playerUrl)]);

    if (bgImg) {
      ctx.drawImage(bgImg, cardX, cardY, cardW, cardH);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 32);
      ctx.fill();
    }

    if (pImg) {
      ctx.drawImage(pImg, cardX + 30, cardY + 50, cardW - 60, cardH - 100);
    }

    // 4. Card Overlay Info
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 72px sans-serif';
    ctx.fillText(String(card.rating || card.ovr), cardX + 50, cardY + 110);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 36px sans-serif';
    ctx.fillText(card.position || 'ST', cardX + 55, cardY + 155);

    // 5. Right Side: Large Typography & Release Schedule
    const infoX = 860;

    // Status Pill
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(infoX, 230, 340, 50, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = '800 20px sans-serif';
    ctx.fillText('🔒 DATA-MINED UNRELEASED', infoX + 25, 262);

    // Player Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px sans-serif';
    ctx.fillText((card.cardName || card.lastName || 'PLAYER').toUpperCase(), infoX, 370);

    // Promo Event
    ctx.fillStyle = '#60a5fa';
    ctx.font = '800 36px sans-serif';
    ctx.fillText((card.program?.name || 'SPECIAL PROMO EVENT').toUpperCase(), infoX, 430);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(infoX, 470);
    ctx.lineTo(W - 140, 470);
    ctx.stroke();

    // Club & Nation
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 28px sans-serif';
    ctx.fillText(`🛡️ Club: ${card.club?.name || 'Official Team'}`, infoX, 525);
    ctx.fillText(`🌍 Nation: ${card.nation?.name || 'World'}`, infoX, 575);

    // Release Date Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(infoX, 630, W - infoX - 140, 150, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 22px sans-serif';
    ctx.fillText('📅 SCHEDULED LAUNCH & REVEAL DATE', infoX + 35, 675);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px sans-serif';
    ctx.fillText(card.revealFormatted || 'Upcoming in FC Mobile', infoX + 35, 720);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 18px sans-serif';
    ctx.fillText(`⚡ Data-mined: ${card.addedFormatted || 'Recent Game File'}  •  Scraped: ${new Date(card.fetchedAt || Date.now()).toLocaleTimeString()}`, infoX + 35, 755);

    // Bottom Footer Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '600 18px sans-serif';
    ctx.fillText('DISCORD BOT • DESTIFC DRAFTS & H2H SYSTEM • POWERED BY RENDERZ ENGINE', infoX, 860);

    // DestiFC Stamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '900 110px sans-serif';
    ctx.fillText('DESTIFC', W - 620, H - 90);

    setIsGeneratingBanner(false);
  };

  const downloadBanner = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `DestiFC_Leak_${(bannerCard?.cardName || 'Card').replace(/\s+/g, '_')}_16x9.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-[#0d0914] text-[var(--text-main)] font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Leaks & Upcoming Drafts</h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> DATA-MINED REVEALS
                </span>
                {fetchedAt && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Fetched: {new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-main)] opacity-50 mt-1">
                Real-time data-mined leaked cards scraped from EA game files before release. Preview exclusive card art & generate 16:9 launch banners.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2 border-b border-[var(--border-glass)] pb-px">
             <button
                onClick={() => setActiveTab('renderz')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'renderz' ? 'border-[var(--accent-pink)] text-[var(--accent-pink)]' : 'border-transparent text-[var(--text-main)] opacity-50 hover:opacity-100'}`}
             >
                RenderZ Datamine
             </button>
             <button
                onClick={() => setActiveTab('twitter')}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'twitter' ? 'border-[#1DA1F2] text-[#1DA1F2]' : 'border-transparent text-[var(--text-main)] opacity-50 hover:opacity-100'}`}
             >
                Live Leaker Feeds
             </button>
          </div>

            {activeTab === 'renderz' ? (
          <>
            {/* Actions & Search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchLeaks()}
                disabled={loading}
                className="p-2.5 rounded-2xl bg-white border border-black/10 hover:bg-neutral-50 text-neutral-700 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Re-scrape latest leaks"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">Sync Leaks</span>
              </button>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[var(--text-main)] opacity-70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search leaked player or promo..."
                  className="apple-input pl-10 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-main)] opacity-70 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass-card w-fit border border-white/60">
            {[
              { id: 'all', label: 'All Mined Leaks', icon: Sparkles },
              { id: 'icons', label: '👑 Icons & Legends', icon: Flame },
              { id: 'heroes', label: '🛡️ Heroes', icon: Shield },
              { id: 'live', label: '⚡ Live Event Promos', icon: Radio },
              { id: '120plus', label: '🌟 120+ Master Leaks', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = category === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setCategory(tab.id); setPage(1); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive ? 'bg-[var(--card-bg)] text-amber-400 shadow-md' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)] opacity-50 px-1">
              <span>{loading ? 'Data-mining RenderZ releases...' : `Showing ${cards.length} unreleased leaks`}</span>
              <span>Page {page}</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="glass-card p-5 h-96 animate-pulse flex flex-col justify-between rounded-3xl">
                    <div className="w-20 h-6 bg-neutral-200/60 rounded-lg"></div>
                    <div className="w-32 h-32 bg-neutral-200/60 rounded-2xl mx-auto"></div>
                    <div className="w-3/4 h-4 bg-neutral-200/60 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="glass-card p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-[var(--text-main)] opacity-70">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">No New Leaks in this Category</h3>
                <p className="text-xs text-[var(--text-main)] opacity-50 max-w-sm mx-auto">
                  All cards in this category are already live or no unreleased cards are currently detected in EA game files.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                  const ovr = card.rating || card.ovr;
                  const isMaster = ovr >= 120;

                  return (
                    <div
                      key={card.id || card.assetId}
                      className="glass-card p-5 flex flex-col justify-between rounded-3xl hover:shadow-2xl transition-all duration-300 border border-white/80 group relative overflow-hidden bg-gradient-to-b from-white/95 to-white/60 space-y-3"
                    >
                      {/* Top Badges & Status */}
                      <div className="flex items-start justify-between z-10">
                        <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-[var(--card-bg)] text-[var(--text-main)] shadow-md">
                          <span className={`text-lg font-black leading-none ${isMaster ? 'text-amber-400' : 'text-blue-400'}`}>
                            {ovr}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--text-main)] opacity-90 tracking-wider">
                            {card.position}
                          </span>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                            <Lock className="w-3 h-3" />
                            <span>Unreleased Leak</span>
                          </span>

                          <div className="text-[10px] text-[var(--text-main)] opacity-50 font-medium truncate max-w-[120px]">
                            🛡️ {card.club?.name || 'Club'}
                          </div>
                        </div>
                      </div>

                      {/* Authentic Layered Card Canvas */}
                      <div className="my-2 flex items-center justify-center relative w-full h-44 overflow-hidden rounded-2xl bg-[var(--input-bg)]/5 border border-black/5">
                        {card.images?.playerCardBackground && (
                          <img
                            src={getProxyUrl(card.images.playerCardBackground)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-sm"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              if (card.images?.playerCardBackground) {
                                e.currentTarget.src = card.images.playerCardBackground;
                              }
                            }}
                          />
                        )}
                        {card.images?.playerCardImage || card.images?.playerImage ? (
                          <img
                            src={getProxyUrl(card.images.playerCardImage || card.images.playerImage)}
                            alt=""
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="relative z-10 w-36 h-36 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const direct = card.images?.playerCardImage || card.images?.playerImage;
                              if (direct) {
                                e.currentTarget.src = direct;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-[var(--text-main)] opacity-90">
                            <Sparkles className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Info & Schedule Banner */}
                      <div className="space-y-2.5 z-10">
                        <div className="text-center">
                          <div className="font-black text-sm text-neutral-900 uppercase tracking-wide truncate">
                            {card.cardName || card.lastName}
                          </div>
                          <div className="text-[10px] font-bold tracking-wider text-blue-600 uppercase mt-0.5 truncate">
                            {card.program?.name || 'Promo Leak'}
                          </div>
                        </div>

                        {/* Scheduled Release Timing */}
                        <div className="p-2 rounded-xl bg-[var(--card-bg)]/5 border border-black/5 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-neutral-600 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500" /> Unlock:
                            </span>
                            <span className="text-neutral-900 font-bold truncate max-w-[130px]">{card.revealFormatted}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[var(--text-main)] opacity-70 font-medium">
                            <span>Mined: {card.addedFormatted}</span>
                            <span className="text-emerald-600 font-bold">Preview Only</span>
                          </div>
                        </div>

                        {/* Generate 16:9 Banner Button */}
                        <button
                          onClick={() => openBannerGenerator(card)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-[var(--card-bg)] hover:bg-neutral-800 text-[var(--text-main)] font-bold text-xs shadow-md shadow-neutral-900/10 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Generate 16:9 Banner</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold glass-card text-neutral-700 hover:text-neutral-900 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-bold text-[var(--text-main)] opacity-50">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-4 py-2 rounded-xl text-xs font-bold glass-card text-neutral-700 hover:text-neutral-900 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 16:9 Banner Generator Modal */}
        {bannerCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="bg-[var(--input-bg)] border border-[var(--border-glass)] rounded-3xl max-w-4xl w-full p-6 text-[var(--text-main)] shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold">16:9 Leaks Announcement Banner</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    1920 x 1080 Full HD
                  </span>
                </div>
                <button
                  onClick={() => setBannerCard(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-[var(--text-main)] opacity-70 hover:text-[var(--text-main)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Canvas Preview Container */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-[var(--border-glass)] flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
                {isGeneratingBanner && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-sm font-bold text-amber-400">
                    <Sparkles className="w-5 h-5 animate-spin" /> Rendering HD Leaks Poster...
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-[var(--text-main)] opacity-70">
                  ⚡ Card Design, Player Render & Reveal Schedule mapped automatically onto 16:9 DestiFC template.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setBannerCard(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-[var(--text-main)]"
                  >
                    Close
                  </button>
                  <button
                    onClick={downloadBanner}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer font-black"
                  >
                    <Download className="w-4 h-4" /> Download 16:9 Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="glass-card p-6 h-[800px] overflow-y-auto rounded-3xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-amber-500" /> @Sappurit Leaks</h3>
                <a className="twitter-timeline" data-theme="dark" href="https://twitter.com/Sappurit?ref_src=twsrc%5Etfw">Tweets by Sappurit</a>
              </div>
              <div className="glass-card p-6 h-[800px] overflow-y-auto rounded-3xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-amber-500" /> @MadridistaAFC Leaks</h3>
                <a className="twitter-timeline" data-theme="dark" href="https://twitter.com/MadridistaAFC?ref_src=twsrc%5Etfw">Tweets by MadridistaAFC</a>
              </div>
              <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
            </div>
          )}
      </main>
    </div>
  );
}
