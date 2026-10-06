'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { Megaphone, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Title and Message are required!' });
      return;
    }
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({ type: 'success', text: 'Announcement queued! The bot will begin sending DMs immediately.' });
        setTitle('');
        setMessage('');
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to queue announcement' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 relative overflow-hidden min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Megaphone className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Mass Announcements</h1>
              <p className="text-gray-400 mt-1">Send a direct message (DM) to all registered bot users.</p>
            </div>
          </div>

          {status.text && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
              {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {status.text}
            </div>
          )}

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🚨 Server Maintenance Update"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message Content (Supports Discord Markdown)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here... You can use **bold**, *italics*, and emoji!"
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-sm text-[var(--text-main)] focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <LiquidButton onClick={handleSend} disabled={loading} variant="primary" icon={Send}>
                  {loading ? 'Queuing...' : 'Send Mass DM'}
                </LiquidButton>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex gap-3 text-orange-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-bold">Important Notice</p>
              <p>Sending a mass DM to all users takes time due to Discord's API rate limits. The bot will automatically send the DMs slowly in the background to avoid being rate-limited or flagged as spam by Discord. Please do not send multiple announcements at the same time.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
