'use client';

import { useState, useEffect } from 'react';

export default function CompensationConfig() {
  const [config, setConfig] = useState({
    is_active: false,
    event_id: 'season_2_welcome',
    message: 'Sorry for the downtime! Enjoy your Season 2 Welcome Pack!',
    coins: 50000000,
    vouchers: 50,
    gems: 0,
    start_timestamp: 0,
    end_timestamp: 0
  });
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/compensation-config')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setConfig(res.data);
          if (res.data.start_timestamp) {
            const sd = new Date(res.data.start_timestamp * 1000);
            setStartDateStr(sd.toISOString().slice(0, 16));
          }
          if (res.data.end_timestamp) {
            const ed = new Date(res.data.end_timestamp * 1000);
            setEndDateStr(ed.toISOString().slice(0, 16));
          }
        }
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let payload = { ...config };
    if (startDateStr) payload.start_timestamp = Math.floor(new Date(startDateStr).getTime() / 1000);
    else payload.start_timestamp = 0;
    
    if (endDateStr) payload.end_timestamp = Math.floor(new Date(endDateStr).getTime() / 1000);
    else payload.end_timestamp = 0;

    const res = await fetch('/api/compensation-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) alert('Compensation Event Saved!');
    else alert('Failed to save.');
    setSaving(false);
  };

  if (loading) return <div>Loading Compensation Config...</div>;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 flex items-center gap-2">
          <span>🎁</span> Compensation Event
        </h2>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Event'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={config.is_active} onChange={e => setConfig({...config, is_active: e.target.checked})} />
              <div className={`block w-14 h-8 rounded-full transition-colors ${config.is_active ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${config.is_active ? 'translate-x-6' : ''}`}></div>
            </div>
            <div>
              <div className="font-semibold text-gray-100">Event is {config.is_active ? 'ACTIVE' : 'INACTIVE'}</div>
              <div className="text-sm text-gray-400">Turn this on to allow users to use /compensation</div>
            </div>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Event ID (Change this to allow users to claim again!)</label>
            <input type="text" className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" value={config.event_id} onChange={e => setConfig({...config, event_id: e.target.value})} placeholder="e.g. season_2_apology" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Discord Message Text</label>
            <textarea className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none h-24" value={config.message} onChange={e => setConfig({...config, message: e.target.value})} placeholder="Sorry for the downtime!" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-4">
            <h3 className="font-semibold text-gray-200 border-b border-gray-700 pb-2">Rewards</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">🪙 Coins</label>
              <input type="number" className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-yellow-500" value={config.coins} onChange={e => setConfig({...config, coins: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">🎫 Draft Vouchers</label>
              <input type="number" className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500" value={config.vouchers} onChange={e => setConfig({...config, vouchers: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">💎 Gems</label>
              <input type="number" className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-purple-500" value={config.gems} onChange={e => setConfig({...config, gems: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-4">
            <h3 className="font-semibold text-gray-200 border-b border-gray-700 pb-2">Time Limits</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Starts At (Local Time)</label>
              <input type="datetime-local" className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700" value={startDateStr} onChange={e => setStartDateStr(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Ends At (Optional)</label>
              <input type="datetime-local" className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700" value={endDateStr} onChange={e => setEndDateStr(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
