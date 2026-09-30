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
  const [inDrafts, setInDrafts] = useState(true);
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
        body: JSON.stringify({ name, ovr, position, imageUrl, inDrafts }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Successfully created ${name} (${ovr}) and synced with Supabase!` });
        setName('');
        setImageUrl('');
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Custom Card Studio</h1>
            <p className="text-sm text-neutral-500 mt-1">Design and publish custom player cards directly to Discord drafts.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Tactical Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="apple-input font-medium"
                    >
                      {['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'CB', 'RB', 'GK'].map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Card Image URL (.webp / .png)</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://renderz.app/... or CDN link"
                      className="apple-input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-white/60">
                  <input
                    type="checkbox"
                    id="inDrafts"
                    checked={inDrafts}
                    onChange={(e) => setInDrafts(e.target.checked)}
                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="inDrafts" className="text-sm font-medium text-neutral-800 cursor-pointer">
                    Enable in Global Draft Packs (Pool A / Walkouts)
                  </label>
                </div>

                <div className="pt-2">
                  <LiquidButton
                    text={loading ? "Publishing..." : "Mint & Release Card"}
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
              <div className="w-56 h-80 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white p-6 flex flex-col justify-between shadow-2xl relative border border-white/20">
                <div className="flex items-start justify-between z-10">
                  <div>
                    <div className="text-3xl font-black text-amber-400 leading-none">{ovr}</div>
                    <div className="text-sm font-bold text-neutral-300 mt-1">{position}</div>
                  </div>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>

                <div className="my-auto flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-32 h-32 object-contain drop-shadow-xl" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-neutral-400">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="text-center z-10">
                  <div className="text-base font-black truncate tracking-wide uppercase">{name || 'PLAYER NAME'}</div>
                  <div className="text-[10px] text-amber-400/80 font-bold tracking-widest uppercase mt-0.5">DestiFC Custom Edition</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Active Custom Releases ({existingCards.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingCards.map((card) => (
                <div key={card.id} className="p-4 rounded-2xl bg-white/50 border border-white/60 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 text-amber-400 font-bold flex flex-col items-center justify-center text-xs shadow-md">
                    <span>{card.rating || card.ovr}</span>
                    <span className="text-[9px] text-white/80">{card.position}</span>
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm text-neutral-900 truncate">{card.cardName || card.player_name}</div>
                    <div className="text-xs text-neutral-500">ID: #{card.id}</div>
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
