'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { Sparkles, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function CustomCardsPage() {
  const [name, setName] = useState('');
  const [ovr, setOvr] = useState(120);
  const [position, setPosition] = useState('ST');
  const [imageUrl, setImageUrl] = useState('');
  const [clubName, setClubName] = useState('Real Madrid');
  const [nationName, setNationName] = useState('Argentina');
  const [programName, setProgramName] = useState('Custom Master');
  const [quantity, setQuantity] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [existingCards, setExistingCards] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/custom-cards');
      const data = await res.json();
      if (data.success) {
        setExistingCards(data.cards);
      }
    } catch (e) {}
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
          quantity: quantity ? parseInt(quantity, 10) : null,
          targetUserId: targetUserId ? targetUserId.trim() : null
        }),
      });
      const data = await res.json();
      if (data.success) {
        const grantNote = targetUserId ? ` and granted directly to Discord ID ${targetUserId.trim()}` : '';
        setMessage({ type: 'success', text: `Successfully saved ${name} (${ovr}) to Custom Catalog${grantNote}!` });
        setName('');
        setImageUrl('');
        setQuantity('');
        setTargetUserId('');
        fetchCards();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create card' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection error' });
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
        alert(`✅ Successfully granted ${card.cardName || card.player_name} to Discord User ID ${targetUid}!`);
      } else {
        alert(`❌ Error: ${data.error || 'Failed to grant card'}`);
      }
    } catch (e) {
      alert(`❌ Network error: ${e.message}`);
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
        alert(`❌ Error: ${data.error || 'Failed to delete card'}`);
      }
    } catch (e) {
      alert(`❌ Network error: ${e.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.webp, .png, or .jpg)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new window.Image();
      img.onload = () => {
        // Automatically optimize & scale image to 512px max to prevent large payload network errors
        const maxDim = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const optimizedDataUrl = canvas.toDataURL('image/webp', 0.92);
        setImageUrl(optimizedDataUrl);
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Custom Card Studio</h1>
            <p className="text-sm text-neutral-500 mt-1">Design, release, and grant custom player cards directly to Discord drafts & users.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Player Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ronaldinho Prime"
                      className="apple-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">OVR Rating (100 - 150)</label>
                    <input
                      type="number"
                      value={ovr}
                      onChange={(e) => setOvr(e.target.value)}
                      min="100"
                      max="150"
                      className="apple-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="apple-input font-medium"
                    >
                      {['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'GK'].map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                      Upload Card Image (.webp / .png / .jpg)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/70 hover:bg-white border-2 border-dashed border-blue-400/60 hover:border-blue-500 text-blue-600 font-semibold text-xs transition-all cursor-pointer shadow-sm">
                        <ImageIcon className="w-4 h-4" />
                        <span>{imageUrl ? "Replace Uploaded File (.webp / .png)" : "📁 Choose .webp or .png File"}</span>
                        <input
                          type="file"
                          accept="image/png, image/webp, image/jpeg, image/jpg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Club Name (for Walkout Reveal)</label>
                    <input
                      type="text"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="e.g. Real Madrid, Barcelona, Man City..."
                      className="apple-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Nation / Country (for Walkout Flag)</label>
                    <input
                      type="text"
                      value={nationName}
                      onChange={(e) => setNationName(e.target.value)}
                      placeholder="e.g. Argentina, Portugal, Brazil, France..."
                      className="apple-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Card Edition / Program Name</label>
                    <input
                      type="text"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      placeholder="e.g. Prime Icon, TOTY, Custom Master..."
                      className="apple-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Available Supply (Optional Quantity)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 10 (leave empty for unlimited)"
                      className="apple-input font-mono"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Or paste direct image URL (Optional)</label>
                  <input
                    type="text"
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={imageUrl.startsWith('data:') ? 'Using uploaded file (Data URL)' : 'https://.../player.png'}
                    className="apple-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                    Direct Grant to Discord User ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="e.g. 485160482748235827 (or leave blank to save to catalog only)"
                    className="apple-input font-mono text-sm"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Custom cards are private and granted exclusively by admins. They will never appear in standard draft packs.
                  </span>
                </div>

                <div className="pt-2">
                  <LiquidButton
                    text={loading ? "Saving..." : "Save to Custom Catalog"}
                    type="submit"
                    disabled={loading}
                    width="260px"
                    height="60px"
                  />
                </div>
              </form>
            </div>

            <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Live Card Preview</span>
              <div className="w-56 h-88 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white p-6 flex flex-col justify-between shadow-2xl relative border border-white/20">
                <div className="flex items-start justify-between z-10">
                  <div>
                    <div className="text-3xl font-black text-amber-400 leading-none">{ovr}</div>
                    <div className="text-sm font-bold text-neutral-300 mt-1">{position}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white/90">🌍 {nationName}</div>
                    <div className="text-[10px] text-neutral-400 font-medium truncate max-w-[90px]">🛡️ {clubName}</div>
                  </div>
                </div>

                <div className="my-auto flex items-center justify-center py-2 min-h-[130px]">
                  {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-32 h-32 object-contain drop-shadow-xl" />
                  ) : null}
                </div>

                <div className="text-center z-10">
                  <div className="text-base font-black truncate tracking-wide uppercase">{name || 'PLAYER NAME'}</div>
                  <div className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mt-0.5">{programName}</div>
                  {quantity && (
                    <div className="text-[9px] text-emerald-400 font-mono mt-0.5">Limited Supply: {quantity} Total</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Active Custom Releases ({existingCards.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingCards.map((card) => (
                <div key={card.id} className="p-4 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-amber-400 font-bold flex flex-col items-center justify-center text-xs shadow-md shrink-0">
                      <span>{card.rating || card.ovr}</span>
                      <span className="text-[9px] text-white/80">{card.position}</span>
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-sm text-neutral-900 truncate">{card.cardName || card.player_name}</div>
                      <div className="text-xs text-neutral-500 font-medium">
                        🛡️ {card.club?.name || 'Club'} | 🌍 {card.nation?.name || 'Nation'}
                      </div>
                      {card.supply && (
                        <div className="text-[10px] text-emerald-600 font-mono font-bold">Supply: {card.supply}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleGiveCard(card)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Grant directly to user's club"
                    >
                      🎁 Give
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 font-semibold text-xs transition-colors cursor-pointer"
                      title="Delete card"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {existingCards.length === 0 && (
                <div className="col-span-3 text-center py-8 text-neutral-400 text-sm">No custom draft cards created yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
