'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { Users, CreditCard, ShoppingBag, Sparkles, Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState({ users: 0, inventory: 0, market: 0, customCards: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setIsAuthenticated(true);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchStats();
      } else {
        setAuthError(data.error || 'Incorrect passcode');
      }
    } catch (err) {
      setAuthError('Connection error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 text-center relative overflow-hidden border border-white/60 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/10 text-blue-600 mx-auto flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">DestiFC Portal</h2>
          <p className="text-sm text-neutral-500 mb-8">Enter your team admin passcode to unlock cloud controls.</p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Team Passcode"
              className="apple-input text-center text-lg tracking-widest font-mono"
              required
            />
            <div className="pt-2 flex justify-center">
              <LiquidButton text="Unlock Portal" type="submit" width="100%" height="56px" />
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">System Overview</h1>
            <p className="text-sm text-neutral-500 mt-1">Live cloud telemetry connected to Supabase PostgreSQL.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Players</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{stats.users.toLocaleString()}</div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Card Inventory</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{stats.inventory.toLocaleString()}</div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Market Listings</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{stats.market.toLocaleString()}</div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Custom Draft Releases</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{stats.customCards.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/custom-cards" className="glass-card p-8 group hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Custom Card Studio</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Mint new custom cards, set stats & positions, and drop them into live Discord drafts.</p>
            </Link>

            <Link href="/database" className="glass-card p-8 group hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Cloud Database Explorer</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Search users, inspect inventory records, and track live market sales across Discord.</p>
            </Link>

            <Link href="/formations" className="glass-card p-8 group hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">3D Formation Visualizer</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Drag-and-drop tactical formation nodes on the 3D stadium pitch with real-time sync.</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
