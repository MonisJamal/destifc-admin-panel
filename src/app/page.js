'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Users, CreditCard, ShoppingBag, Sparkles, Flame, ArrowUpRight, Database, Sliders, Dices, Gift, Award, Coins } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
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
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0914] text-neutral-100 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-10 pt-16 lg:pt-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
                  DestiFC Control Center
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  stats.bot_online
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-300 border-red-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${stats.bot_online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {stats.bot_online ? `Bot Online (${stats.bot_latency}ms)` : 'Bot Offline'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">Live cloud telemetry connected to Supabase PostgreSQL and Discord Bot engine.</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/hosting"
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-purple-900/40 text-xs font-bold text-fuchsia-300 hover:text-fuchsia-100 transition-all flex items-center gap-1.5"
              >
                <span>Process Controls</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Players</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white font-mono">
                {loading ? '...' : stats.users.toLocaleString()}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Card Inventory</span>
                <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white font-mono">
                {loading ? '...' : stats.inventory.toLocaleString()}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Market Listings</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white font-mono">
                {loading ? '...' : stats.market.toLocaleString()}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Custom Draft Releases</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white font-mono">
                {loading ? '...' : stats.customCards.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/luck" className="glass-card p-8 group hover:border-pink-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  <Dices className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-pink-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Drop Rates & Luck Engine</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Configure draft pool probabilities, exchange chances, and pool user caps.</p>
            </Link>

            <Link href="/signature-box" className="glass-card p-8 group hover:border-fuchsia-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                  <Gift className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-fuchsia-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Signature Box Manager</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Configure exclusive 10-reward draws, step costs, and custom signature player cards.</p>
            </Link>

            <Link href="/prices" className="glass-card p-8 group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <Coins className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-purple-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">OVR Price Matrix</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Set minimum price floors, maximum price ceilings, and quicksell values per card rating.</p>
            </Link>

            <Link href="/database" className="glass-card p-8 group hover:border-pink-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  <Database className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-pink-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Cloud Database Explorer</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Inspect card data with OVR, clubs, nations, player inventories, and market listings.</p>
            </Link>

            <Link href="/economy-config" className="glass-card p-8 group hover:border-fuchsia-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                  <Sliders className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-fuchsia-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Economy & Cooldowns</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Daily claim coins, work shift wages, voucher prices, daily buy limits, and taxes.</p>
            </Link>

            <Link href="/gameplay-config" className="glass-card p-8 group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <Flame className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-purple-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Gameplay & Ranked Arena</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">Match coin rewards, ranked fan ladders, Draft Battle jackpots, and custom card boosts.</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
