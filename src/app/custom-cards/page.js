'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import ImageUpload from '@/components/ImageUpload';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Gift, 
  Shield, 
  Trash2, 
  Send, 
  Layers, 
  Flame, 
  RefreshCw,
  Plus,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function CustomCardsPage() {
  const [name, setName] = useState('');
  const [ovr, setOvr] = useState(120);
  const [position, setPosition] = useState('ST');
  const [imageUrl, setImageUrl] = useState('');
  const [clubName, setClubName] = useState('Real Madrid');
  const [nationName, setNationName] = useState('Argentina');
  const [programName, setProgramName] = useState('Custom Master');
  const [matchBoost, setMatchBoost] = useState(1.15);
  const [quantity, setQuantity] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [activeTab, setActiveTab] = useState('draft'); // 'draft' | 'signature'
  const [draftCards, setDraftCards] = useState([]);
  const [signatureCards, setSignatureCards] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/custom-cards');
      const data = await res.json();
      if (data.success) {
        setDraftCards(data.draftCards || data.cards || []);
        setSignatureCards(data.signatureCards || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/custom-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ovr,
          position,
          imageUrl,
          clubName,
          nationName,
          programName,
          matchBoost,
          quantity: quantity ? parseInt(quantity, 10) : null,
          targetUserId: targetUserId ? targetUserId.trim() : null
        }),
      });
      const data = await res.json();
      if (data.success) {
        const grantNote = targetUserId ? ` and granted directly to Discord ID ${targetUserId.trim()}` : '';
        setMessage({ type: 'success', text: `Successfully saved ${name} (${ovr} OVR) to Custom Catalog${grantNote}.` });
        setName('');
        setImageUrl('');
        setQuantity('');
        setTargetUserId('');
        fetchCards();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create card.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveCard = async (card) => {
    const targetUid = prompt(`Enter the Discord User ID (numerical ID) to grant ${card.cardName || card.player_name} (${card.rating || card.ovr} OVR):`);
    if (!targetUid || !targetUid.trim()) return;

    try {
      const res = await fetch('/api/admin-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'give_card',
          userId: targetUid.trim(),
          playerData: card
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully granted ${card.cardName || card.player_name} to Discord User ID ${targetUid}.`);
      } else {
        alert(`Error: ${data.error || 'Failed to grant card'}`);
      }
    } catch (e) {
      alert(`Network error: ${e.message}`);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm(`Are you sure you want to delete custom card #${cardId} from the database?`)) return;
    try {
      const res = await fetch(`/api/custom-cards?id=${cardId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCards();
      } else {
        alert(`Error: ${data.error || 'Failed to delete card'}`);
      }
    } catch (e) {
      alert(`Network error: ${e.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0914] text-neutral-100 font-sans selection:bg-fuchsia-500/30">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Custom Card Studio
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Live Server Generator
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Custom Card Creator and Management
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Design new custom player cards with custom PNG/WebP art and manage active draft cards and exclusive Signature Box cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCards}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-purple-900/40 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Cards
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            message.type === 'success' ? 'bg-fuchsia-950/40 border border-fuchsia-500/40 text-fuchsia-200' : 'bg-red-950/40 border border-red-500/40 text-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-fuchsia-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />}
            {message.text}
          </div>
        )}

        {/* Creator Form & Live Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Card Form */}
          <div className="lg:col-span-8 bg-neutral-900/50 border border-purple-900/30 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-fuchsia-400" /> Create New Custom Card
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Player Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ronaldinho Prime"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">OVR Rating (100 - 150)</label>
                  <input
                    type="number"
                    value={ovr}
                    onChange={(e) => setOvr(e.target.value)}
                    min="100"
                    max="150"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm font-bold text-fuchsia-300 font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none text-neutral-200"
                  >
                    {['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'GK'].map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Match Simulation Boost</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="2.0"
                    value={matchBoost}
                    onChange={(e) => setMatchBoost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm font-semibold text-fuchsia-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Card Supply (Optional)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none font-mono"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Club Name</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Real Madrid"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Nation Name</label>
                  <input
                    type="text"
                    value={nationName}
                    onChange={(e) => setNationName(e.target.value)}
                    placeholder="Argentina"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">Card Program</label>
                  <input
                    type="text"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="Custom Master"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* High-Res PNG / WebP File Upload */}
              <div>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Card Player Render / Art (.png or .webp)"
                  helperText="Upload transparent player cut-out or custom card PNG/WebP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Direct Grant to Discord User ID (Optional)
                </label>
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="e.g. 485160482748235827 (leave blank to add to catalog only)"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/40 focus:border-pink-500 text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <LiquidButton
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  Save and Publish Custom Card
                </LiquidButton>
              </div>
            </form>
          </div>

          {/* Live Card Preview */}
          <div className="lg:col-span-4 bg-neutral-900/50 border border-purple-900/30 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Real-Time Render Preview
            </span>

            <div className="w-60 h-96 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white p-6 flex flex-col justify-between shadow-2xl relative border border-fuchsia-500/30">
              <div className="flex items-start justify-between z-10">
                <div>
                  <div className="text-3xl font-black bg-gradient-to-r from-pink-400 to-fuchsia-300 bg-clip-text text-transparent leading-none">
                    {ovr}
                  </div>
                  <div className="text-xs font-bold text-neutral-300 mt-1">{position}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-neutral-200">{nationName}</div>
                  <div className="text-[10px] text-neutral-400 font-medium truncate max-w-[90px]">{clubName}</div>
                </div>
              </div>

              <div className="my-auto flex items-center justify-center py-2 min-h-[140px]">
                {imageUrl ? (
                  <img src={imageUrl} alt={name} className="w-36 h-36 object-contain drop-shadow-2xl" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-purple-900/40 flex items-center justify-center text-neutral-600 text-xs">
                    No Art
                  </div>
                )}
              </div>

              <div className="text-center z-10">
                <div className="text-base font-black truncate tracking-wide uppercase text-white">
                  {name || 'PLAYER NAME'}
                </div>
                <div className="text-[10px] text-fuchsia-400 font-bold tracking-widest uppercase mt-0.5">
                  {programName}
                </div>
                <div className="text-[9px] text-pink-300 font-mono mt-0.5">
                  Boost: {matchBoost}x Match Power
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separated Custom Cards Catalog Tabs */}
        <div className="bg-neutral-900/50 border border-purple-900/30 rounded-3xl p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('draft')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'draft'
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm shadow-fuchsia-500/10'
                    : 'bg-neutral-950 text-neutral-400 border border-purple-900/30 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Active Custom Draft Cards ({draftCards.length})
              </button>

              <button
                onClick={() => setActiveTab('signature')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'signature'
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm shadow-fuchsia-500/10'
                    : 'bg-neutral-950 text-neutral-400 border border-purple-900/30 hover:text-neutral-200'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-fuchsia-400" />
                Exclusive Signature Box Cards ({signatureCards.length})
              </button>
            </div>

            <span className="text-xs text-neutral-500 font-mono">
              {activeTab === 'draft' ? 'Cards appearing in custom draft pools & direct admin grants' : 'Special cards obtainable exclusively through the Signature Box'}
            </span>
          </div>

          {/* Active Custom Draft Cards Grid */}
          {activeTab === 'draft' && (
            <div>
              {draftCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftCards.map((card) => (
                    <div 
                      key={card.id} 
                      className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 flex items-center justify-between gap-3 hover:border-fuchsia-500/40 transition-all"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-black flex flex-col items-center justify-center text-xs shadow-md shrink-0 font-mono">
                          <span>{card.rating || card.ovr}</span>
                          <span className="text-[9px] font-medium text-pink-200">{card.position}</span>
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-sm text-white truncate">{card.cardName || card.player_name}</div>
                          <div className="text-xs text-neutral-400 truncate">
                            {card.club?.name || 'Club'} | {card.nation?.name || 'Nation'}
                          </div>
                          <div className="text-[10px] text-fuchsia-300 font-mono mt-0.5">
                            Boost: {card.performance_boost || 1.15}x
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleGiveCard(card)}
                          className="px-3 py-1.5 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-fuchsia-500/30"
                          title="Grant directly to user"
                        >
                          <Send className="w-3 h-3" /> Grant
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  No active custom draft cards. Create your first custom card above.
                </div>
              )}
            </div>
          )}

          {/* Signature Box Custom Cards Grid */}
          {activeTab === 'signature' && (
            <div>
              {signatureCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {signatureCards.map((card, idx) => (
                    <div 
                      key={card.id || idx} 
                      className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/20 to-purple-950/20 border border-fuchsia-500/40 flex items-center justify-between gap-3 shadow-lg shadow-fuchsia-950/30"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 text-white font-black flex flex-col items-center justify-center text-xs shadow-md shrink-0 font-mono ring-1 ring-fuchsia-400/40">
                          <span>{card.rating || card.ovr}</span>
                          <span className="text-[9px] font-bold text-fuchsia-200">{card.position}</span>
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white truncate">{card.cardName || card.player_name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                              BOX EXCLUSIVE
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 truncate">
                            {card.club?.name || 'Club'} | {card.nation?.name || 'Nation'}
                          </div>
                          <div className="text-[10px] text-fuchsia-300 font-mono mt-0.5">
                            Aura Boost: {card.performance_boost || 1.25}x (+{(((card.performance_boost || 1.25) - 1) * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleGiveCard(card)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-fuchsia-600/20"
                          title="Grant directly to user"
                        >
                          <Send className="w-3 h-3" /> Grant
                        </button>
                        <Link
                          href="/signature-box"
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-300 hover:text-white text-xs font-semibold"
                        >
                          Edit Box
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  No signature box custom cards found. Configure the Signature Box under <Link href="/signature-box" className="text-fuchsia-400 underline">Signature Box Manager</Link>.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
