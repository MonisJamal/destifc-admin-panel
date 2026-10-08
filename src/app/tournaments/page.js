'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Trophy, Users, Play, RefreshCw, AlertCircle } from 'lucide-react';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState('');
  const [channelId, setChannelId] = useState('');
  const [tourneyType, setTourneyType] = useState('Knockout');
  const [tourneyFormat, setTourneyFormat] = useState('Single Legged');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [creating, setCreating] = useState(false);

  const [matchState, setMatchState] = useState({});

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tournaments');
      if (!res.ok) throw new Error('Failed to fetch tournaments');
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, channel_id: channelId })
      });
      if (!res.ok) throw new Error('Failed to create tournament');
      
      setName('');
      setChannelId('');
      fetchTournaments();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleMatchSelect = (tId, field, value) => {
    setMatchState(prev => ({
      ...prev,
      [tId]: { ...prev[tId], [field]: value }
    }));
  };

  const handleToggleRegistration = async (id) => {
    try {
      const res = await fetch('/api/tournaments/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_registration', tournament_id: id })
      });
      const data = await res.json();
      if (data.success) fetchTournaments();
    } catch (e) { console.error(e); }
  };

  const handleGenerateBracket = async (t) => {
    let parts = [...(t.participants || [])].filter(p => p !== null);
    if (parts.length < 2) return alert('Need at least 2 participants.');
    parts.sort(() => Math.random() - 0.5);
    let matches = [];
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i+1]) {
        matches.push({ a: parts[i], b: parts[i+1], simulated: false });
      } else {
        matches.push({ a: parts[i], b: null, simulated: true, note: 'BYE' });
      }
    }
    try {
      await fetch('/api/tournaments/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_brackets', tournament_id: t.id, matches_json: matches })
      });
      fetchTournaments();
    } catch (e) { console.error(e); }
  };

  const handleTriggerMatch = async (tournament) => {
    const state = matchState[tournament.id];
    if (!state?.player_a_id || !state?.player_b_id) {
      alert('Select two players first');
      return;
    }
    
    handleMatchSelect(tournament.id, 'triggering', true);
    try {
      const res = await fetch('/api/tournaments/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournament.id,
          player_a_id: state.player_a_id,
          player_b_id: state.player_b_id,
          channel_id: tournament.channel_id
        })
      });
      if (!res.ok) throw new Error('Failed to trigger match');
      alert('Match triggered successfully!');
      
      // Reset selections
      handleMatchSelect(tournament.id, 'player_a_id', '');
      handleMatchSelect(tournament.id, 'player_b_id', '');
    } catch (err) {
      alert(err.message);
    } finally {
      handleMatchSelect(tournament.id, 'triggering', false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in mt-14 lg:mt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-pink-400" />
            Tournament Organizer
          </h1>
          <p className="text-neutral-400 mt-1">Manage tournaments, participants, and trigger live matches.</p>
        </div>
        <button 
          onClick={fetchTournaments}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 border border-purple-900/40 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border border-purple-900/30 rounded-2xl bg-[#0e0a17]/50">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-fuchsia-400" />
              Create Tournament
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tournament Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Summer Cup"
                  required
                  className="w-full bg-neutral-950 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tournament Type</label>
                  <select
                    value={tourneyType}
                    onChange={(e) => setTourneyType(e.target.value)}
                    className="w-full bg-neutral-950 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  >
                    <option value="Knockout">Knockout</option>
                    <option value="Round Robin">Round Robin</option>
                    <option value="Group Stage">Group Stage + Knockout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Match Format</label>
                  <select
                    value={tourneyFormat}
                    onChange={(e) => setTourneyFormat(e.target.value)}
                    className="w-full bg-neutral-950 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  >
                    <option value="Single Legged">Single Legged</option>
                    <option value="Double Legged (Home/Away)">Double Legged (Home/Away)</option>
                    <option value="Best of 3">Best of 3</option>
                    <option value="Best of 5">Best of 5</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Max Spots</label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="w-full bg-neutral-950 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Channel ID</label>
                  <input 
                    type="text" 
                    value={channelId}
                    onChange={e => setChannelId(e.target.value)}
                    placeholder="Discord Channel ID"
                    required
                    className="w-full bg-neutral-950 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Custom Announcement (Optional)</label>
                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="e.g. Welcome to the Summer Cup! Winner gets Zizou!"
                  className="w-full bg-neutral-950 border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 transition-colors h-24 resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {creating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                {creating ? 'Creating...' : 'Create Tournament'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {loading && tournaments.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-4" />
              <p className="text-neutral-400">Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card p-12 text-center border border-purple-900/20 rounded-2xl bg-[#0e0a17]/30">
              <Trophy className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No Tournaments Found</h3>
              <p className="text-neutral-500 mt-2">Create your first tournament using the form on the left.</p>
            </div>
          ) : (
            tournaments.map(tournament => {
              const participants = tournament.participants || [];
              const validParticipants = participants.filter(p => p !== null);
              const state = matchState[tournament.id] || {};

              return (
                <div key={tournament.id} className="glass-card p-6 border border-purple-900/30 rounded-2xl bg-[#0e0a17]/50 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold uppercase">
                          {tournament.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">Channel: {tournament.channel_id}</p>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-purple-900/30">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-semibold">{validParticipants.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-900/20 mt-2">
                    <span className="text-xs text-neutral-400">Registration: {tournament.registration_open ? 'OPEN' : 'CLOSED'} ({validParticipants.length}/{tournament.max_participants || 16})</span>
                    <button onClick={() => handleToggleRegistration(tournament.id)} className="px-3 py-1 bg-neutral-900 border border-purple-900/30 rounded-lg text-xs hover:bg-neutral-800">
                      Toggle Lock
                    </button>
                  </div>
                  
                  {tournament.matches_json && tournament.matches_json.length > 0 ? (
                    <div className="mt-2 border-t border-purple-900/20 pt-4">
                      <h4 className="text-xs font-bold text-pink-400 uppercase mb-3">Generated Brackets</h4>
                      <div className="space-y-2">
                        {tournament.matches_json.map((m, idx) => (
                           <div key={idx} className="flex justify-between items-center text-xs bg-neutral-950 p-3 rounded-xl border border-purple-900/30">
                             <span className="text-white">{m.a} <span className="text-pink-500 font-bold mx-2">VS</span> {m.b || 'BYE'}</span>
                             {!m.simulated && m.b && (
                               <button 
                                 onClick={() => {
                                   setMatchState({ ...matchState, [`${tournament.id}`]: { ...matchState[tournament.id], player_a_id: m.a, player_b_id: m.b }});
                                   // Just sets the state so they can click simulate below, or we just auto-trigger:
                                   // Let's just set the dropdowns so the simulate button works.
                                 }}
                                 className="px-3 py-1 bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg hover:bg-fuchsia-600/40"
                               >
                                 Select Pair
                               </button>
                             )}
                           </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleGenerateBracket(tournament)} className="mt-2 w-full py-2 bg-amber-600/20 text-amber-500 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-600/40">
                      Generate Random Brackets
                    </button>
                  )}

                  <div className="mt-2 border-t border-purple-900/20 pt-4">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase mb-3">Simulate Match</h4>
                    <div className="flex flex-col md:flex-row gap-3">
                      <select 
                        className="flex-1 bg-neutral-950 border border-purple-900/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50"
                        value={state.player_a_id || ''}
                        onChange={(e) => handleMatchSelect(tournament.id, 'player_a_id', e.target.value)}
                      >
                        <option value="">Select Player A</option>
                        {validParticipants.map((p, i) => (
                          <option key={`a-${i}-${p}`} value={p}>{p}</option>
                        ))}
                      </select>
                      
                      <div className="flex items-center justify-center font-bold text-pink-500 md:px-2">VS</div>

                      <select 
                        className="flex-1 bg-neutral-950 border border-purple-900/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50"
                        value={state.player_b_id || ''}
                        onChange={(e) => handleMatchSelect(tournament.id, 'player_b_id', e.target.value)}
                      >
                        <option value="">Select Player B</option>
                        {validParticipants.map((p, i) => (
                          <option key={`b-${i}-${p}`} value={p}>{p}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleTriggerMatch(tournament)}
                        disabled={state.triggering || !state.player_a_id || !state.player_b_id || state.player_a_id === state.player_b_id}
                        className="px-6 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {state.triggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Simulate
                      </button>
                    </div>
                    {state.player_a_id && state.player_b_id && state.player_a_id === state.player_b_id && (
                      <p className="text-red-400 text-xs mt-2">Cannot select the same player for both sides.</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
