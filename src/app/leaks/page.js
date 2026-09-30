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
  Calendar 
} from 'lucide-react';

export default function LeaksDraftsPage() {
  const [category, setCategory] = useState('all'); // 'all' | 'icons' | 'heroes' | 'live' | '120plus'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [scrapedAt, setScrapedAt] = useState('');

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
      const res = await fetch(`/api/leaks?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list = data.cards || [];
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          list = list.filter(c => 
            (c.cardName || '').toLowerCase().includes(q) ||
            (c.lastName || '').toLowerCase().includes(q) ||
            (c.program?.name || '').toLowerCase().includes(q)
          );
        }
        setCards(list);
        setHasMore(data.hasMore);
        if (data.scrapedAt) setScrapedAt(data.scrapedAt);
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

    // Grid lines / High-tech aesthetic
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
    ctx.fillText('⚡ DESTIFC OFFICIAL LEAKS', 120, 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('FC MOBILE UPCOMING CONTENT & DRAFT MINING', 120, 155);

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
        img.onerror = () => resolve(null);
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
    ctx.fillStyle = card.isUnreleased ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = card.isUnreleased ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(infoX, 240, 320, 50, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = card.isUnreleased ? '#f87171' : '#34d399';
    ctx.font = '800 20px sans-serif';
    ctx.fillText(card.isUnreleased ? '🔒 UNRELEASED / LEAKED' : '🟢 LAUNCHED IN GAME', infoX + 25, 272);

    // Player Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px sans-serif';
    ctx.fillText((card.cardName || card.lastName || 'PLAYER').toUpperCase(), infoX, 390);

    // Promo Event
    ctx.fillStyle = '#60a5fa';
    ctx.font = '800 36px sans-serif';
    ctx.fillText((card.program?.name || 'SPECIAL PROMO EVENT').toUpperCase(), infoX, 450);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(infoX, 490);
    ctx.lineTo(W - 140, 490);
    ctx.stroke();

    // Club & Nation
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 28px sans-serif';
    ctx.fillText(`🛡️ Club: ${card.club?.name || 'Official Team'}`, infoX, 550);
    ctx.fillText(`🌍 Nation: ${card.nation?.name || 'World'}`, infoX, 600);

    // Release Date Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(infoX, 660, W - infoX - 140, 140, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 24px sans-serif';
    ctx.fillText('📅 SCHEDULED LAUNCH & REVEAL DATE', infoX + 35, 710);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px sans-serif';
    ctx.fillText(card.revealFormatted || 'Available Soon in EA FC Mobile', infoX + 35, 760);

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Leaks & Upcoming Drafts</h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> DATA-MINED REVEALS
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Scraped unreleased and upcoming cards directly from EA game files & RenderZ before they go live in-game. Generate high-res 16:9 leak announcement banners.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leaked player or event..."
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

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass-card w-fit border border-white/60">
            {[
              { id: 'all', label: 'All Mined Cards', icon: Sparkles },
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
                    isActive ? 'bg-neutral-900 text-amber-400 shadow-md' : 'text-neutral-600 hover:text-neutral-900'
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
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
              <span>{loading ? 'Data-mining RenderZ releases...' : `Showing ${cards.length} leaked cards`}</span>
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
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">No Leaks Found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try switching categories or clearing search filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                  const ovr = card.rating || card.ovr;
                  const isMaster = ovr >= 120;
                  const isUnreleased = card.isUnreleased;

                  return (
                    <div
                      key={card.id || card.assetId}
                      className="glass-card p-5 flex flex-col justify-between rounded-3xl hover:shadow-2xl transition-all duration-300 border border-white/80 group relative overflow-hidden bg-gradient-to-b from-white/95 to-white/60 space-y-3"
                    >
                      {/* Top Badges & Status */}
                      <div className="flex items-start justify-between z-10">
                        <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white shadow-md">
                          <span className={`text-lg font-black leading-none ${isMaster ? 'text-amber-400' : 'text-blue-400'}`}>
                            {ovr}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-300 tracking-wider">
                            {card.position}
                          </span>
                        </div>

                        <div className="text-right space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isUnreleased ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                          }`}>
                            {isUnreleased ? <Lock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            <span>{isUnreleased ? 'Locked Leak' : 'Live in Game'}</span>
                          </span>

                          <div className="text-[10px] text-neutral-500 font-medium truncate max-w-[120px]">
                            🛡️ {card.club?.name || 'Club'}
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

                      {/* Info & Schedule Banner */}
                      <div className="space-y-2.5 z-10">
                        <div className="text-center">
                          <div className="font-black text-sm text-neutral-900 uppercase tracking-wide truncate">
                            {card.cardName || card.lastName}
                          </div>
                          <div className="text-[10px] font-bold tracking-wider text-blue-600 uppercase mt-0.5 truncate">
                            {card.program?.name || 'Official Release'}
                          </div>
                        </div>

                        {/* Release Date Box */}
                        <div className="p-2.5 rounded-xl bg-white/80 border border-black/5 flex items-center gap-2 text-[11px] text-neutral-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{card.revealFormatted}</span>
                        </div>

                        {/* Action: Generate 16:9 Banner */}
                        <button
                          onClick={() => openBannerGenerator(card)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Generate 16:9 Leak Banner</span>
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

        {/* 16:9 Landscape Banner Generator Modal */}
        {bannerCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-5xl bg-neutral-900 text-white rounded-3xl p-6 shadow-2xl border border-white/20 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">16:9 Landscape Leak Banner Generator</h3>
                    <p className="text-xs text-neutral-400">1920x1080 High-definition announcement graphic with DestiFC watermark.</p>
                  </div>
                </div>

                <button
                  onClick={() => setBannerCard(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Canvas Preview */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center relative shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-neutral-400 font-medium">
                  Resolution: <span className="text-white font-mono font-bold">1920 × 1080 (Full HD 16:9)</span> • DestiFC Watermarked
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBannerCard(null)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={downloadBanner}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download 16:9 Banner (.PNG)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
