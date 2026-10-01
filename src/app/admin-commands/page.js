'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { Coins, Gift, RefreshCw, Trash2, CheckCircle2, AlertCircle, ShieldAlert, Image as ImageIcon, Search, Sparkles, X, Check } from 'lucide-react';

export default function AdminCommandsPage() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(100000000);
  const [currencyType, setCurrencyType] = useState('coins');
  const [actionType, setActionType] = useState('give'); // 'give' | 'set'

  // Card Grant
  const [cardUserId, setCardUserId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardOvr, setCardOvr] = useState(122);
  const [cardPos, setCardPos] = useState('ST');
  const [cardImage, setCardImage] = useState('');
  const [selectedOfficialCard, setSelectedOfficialCard] = useState(null);

  // RenderZ Search
  const [rzSearch, setRzSearch] = useState('');
  const [rzResults, setRzResults] = useState([]);
  const [rzLoading, setRzLoading] = useState(false);

  useEffect(() => {
    if (!rzSearch.trim() || rzSearch.length < 2) {
      setRzResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setRzLoading(true);
      try {
        const res = await fetch(`/api/renderz/cards?query=${encodeURIComponent(rzSearch.trim())}&size=6`);
        const data = await res.json();
        if (data.success) {
          setRzResults(data.cards || []);
        }
      } catch (e) {}
      finally {
        setRzLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [rzSearch]);

  const selectRzCard = (card) => {
    setSelectedOfficialCard(card);
    setCardName(card.cardName || card.lastName);
    setCardOvr(card.rating || card.ovr);
    setCardPos(card.position || 'ST');
    setCardImage(card.images?.playerCardImage || card.images?.playerImage || '');
    setRzResults([]);
    setRzSearch('');
  };

  const handleCardFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.webp, .png, or .jpg)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCardImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Wipe
  const [wipeUserId, setWipeUserId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const executeAction = async (payload) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to execute command' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network connection failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencySubmit = (e) => {
    e.preventDefault();
    executeAction({
      action: actionType === 'give' ? 'give_currency' : 'set_currency',
      userId,
      amount: parseInt(amount, 10),
      currencyType,
    });
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const baseData = selectedOfficialCard ? { ...selectedOfficialCard } : {};
    executeAction({
      action: 'give_card',
      userId: cardUserId,
      playerData: {
        ...baseData,
        id: baseData.assetId || `admin_${Date.now()}`,
        assetId: baseData.assetId,
        name: cardName,
        cardName: cardName,
        player_name: cardName,
        rating: parseInt(cardOvr, 10),
        ovr: parseInt(cardOvr, 10),
        position: cardPos,
        images: {
          ...baseData.images,
          playerImage: cardImage || baseData.images?.playerImage || 'https://renderz.app/placeholder.webp',
          playerCardImage: cardImage || baseData.images?.playerCardImage || 'https://renderz.app/placeholder.webp',
        }
      }
    });
  };

  const handleWipeSubmit = (e) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to completely wipe all inventory, squad, and coins for Discord user ID ${wipeUserId}? This cannot be undone.`)) {
      return;
    }
    executeAction({
      action: 'wipe_user',
      userId: wipeUserId,
    });
  };

  const handleRefreshStore = () => {
    executeAction({
      action: 'refresh_store',
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0d0914] text-neutral-100 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-64 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Admin Command Center
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">Execute live Discord admin commands directly from the web in real-time.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Currency Manager */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Economy Control</h3>
                  <p className="text-xs text-neutral-500">Give or set coins, vouchers & gems for any Discord user.</p>
                </div>
              </div>

              <form onSubmit={handleCurrencySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Target Discord User ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 9582739218273910"
                    className="apple-input font-mono text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Action</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="apple-input font-medium"
                    >
                      <option value="give">Add to Balance (+)</option>
                      <option value="set">Set Exact Balance (=)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Currency Type</label>
                    <select
                      value={currencyType}
                      onChange={(e) => setCurrencyType(e.target.value)}
                      className="apple-input font-medium"
                    >
                      <option value="coins">Coins 🪙</option>
                      <option value="vouchers">Draft Vouchers 🎫</option>
                      <option value="gems">Gems 💎</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="apple-input font-mono"
                    required
                  />
                </div>

                <div className="pt-2">
                  <LiquidButton
                    text={loading ? "Updating..." : "Execute Economy Command"}
                    type="submit"
                    disabled={loading}
                    width="100%"
                    height="52px"
                  />
                </div>
              </form>
            </div>

            {/* 2. Direct Card Grant */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Direct Card Grant</h3>
                  <p className="text-xs text-neutral-500">Instantly place any player card into a user's inventory.</p>
                </div>
              </div>

              <form onSubmit={handleCardSubmit} className="space-y-4">
                {/* RenderZ Search Auto-fill */}
                <div className="p-4 rounded-2xl bg-white/50 border border-purple-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-purple-900 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Pick from Official RenderZ Database
                    </label>
                    {selectedOfficialCard && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Official Linked
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rzSearch}
                      onChange={(e) => setRzSearch(e.target.value)}
                      placeholder="Search official player (e.g. Messi, R9, Vieira, Mbappé)..."
                      className="apple-input pl-9 text-xs border-purple-200 focus:border-purple-500"
                    />
                    {rzLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-500 animate-pulse">
                        Searching...
                      </div>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {rzResults.length > 0 && (
                    <div className="mt-2 p-1.5 rounded-xl bg-white shadow-xl border border-purple-100 divide-y divide-neutral-100 max-h-56 overflow-y-auto">
                      {rzResults.map((card) => (
                        <button
                          key={card.id || card.assetId}
                          type="button"
                          onClick={() => selectRzCard(card)}
                          className="w-full p-2 rounded-lg hover:bg-purple-50 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-amber-400 font-bold flex flex-col items-center justify-center text-[10px] shrink-0">
                              <span>{card.rating || card.ovr}</span>
                              <span className="text-[8px] text-white/80">{card.position}</span>
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-xs text-neutral-900 truncate">{card.cardName || card.lastName}</div>
                              <div className="text-[10px] text-neutral-500 truncate">
                                {card.club?.name || 'Club'} • {card.nation?.name || 'Nation'}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] shrink-0">
                            {card.program?.name || 'Select'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Target Discord User ID</label>
                  <input
                    type="text"
                    value={cardUserId}
                    onChange={(e) => setCardUserId(e.target.value)}
                    placeholder="e.g. 9582739218273910"
                    className="apple-input font-mono text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Player Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Messi Ballon d'Or"
                      className="apple-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">OVR</label>
                    <input
                      type="number"
                      value={cardOvr}
                      onChange={(e) => setCardOvr(e.target.value)}
                      className="apple-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Position</label>
                    <select
                      value={cardPos}
                      onChange={(e) => setCardPos(e.target.value)}
                      className="apple-input font-medium"
                    >
                      {['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'GK'].map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Upload .webp / .png</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/70 hover:bg-white border-2 border-dashed border-purple-400/60 hover:border-purple-500 text-purple-600 font-semibold text-xs transition-all cursor-pointer shadow-sm">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{cardImage ? "File Loaded ✓" : "📁 Choose .webp / .png"}</span>
                        <input
                          type="file"
                          accept="image/png, image/webp, image/jpeg, image/jpg"
                          onChange={handleCardFileUpload}
                          className="hidden"
                        />
                      </label>
                      {cardImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setCardImage('');
                            setSelectedOfficialCard(null);
                          }}
                          className="px-2.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={cardImage.startsWith('data:') ? '' : cardImage}
                    onChange={(e) => setCardImage(e.target.value)}
                    placeholder={cardImage.startsWith('data:') ? 'Using uploaded file (Data URL)' : 'Or paste image URL (Optional)'}
                    className="apple-input text-xs"
                  />
                </div>

                <div className="pt-2">
                  <LiquidButton
                    text={loading ? "Granting..." : "Grant Player Card"}
                    type="submit"
                    disabled={loading}
                    width="100%"
                    height="52px"
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 3. Global Triggers */}
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Live Bot System Triggers</h3>
                  <p className="text-xs text-neutral-500">Trigger live store rotations and refresh draft pools instantly.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/40 border border-white/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-neutral-900">Refresh Store & Draft Rotations</div>
                    <div className="text-xs text-neutral-500">Forces the Discord bot to re-roll active draft pools and player offers.</div>
                  </div>
                  <button
                    onClick={handleRefreshStore}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                  >
                    Trigger Refresh ⚡
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Danger Zone */}
            <div className="glass-card p-8 space-y-6 border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Danger Zone</h3>
                  <p className="text-xs text-neutral-500">Wipe user profiles and reset broken accounts.</p>
                </div>
              </div>

              <form onSubmit={handleWipeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-red-600 mb-1.5">User Discord ID to Wipe</label>
                  <input
                    type="text"
                    value={wipeUserId}
                    onChange={(e) => setWipeUserId(e.target.value)}
                    placeholder="Enter user ID..."
                    className="apple-input font-mono text-sm border-red-300 focus:border-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Wipe User Completely
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
