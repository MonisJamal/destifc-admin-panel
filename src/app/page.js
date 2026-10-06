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
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans">
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
              <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-70 mt-1">Live cloud telemetry connected to Supabase PostgreSQL and Discord Bot engine.</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/hosting"
                className="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--card-bg)] border border-purple-900/40 text-xs font-bold text-fuchsia-300 hover:text-fuchsia-100 transition-all flex items-center gap-1.5"
              >
                <span>Process Controls</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Stat Tiles - Now Interactive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/database?table=users" className="glass-card p-6 flex flex-col justify-between group hover:border-pink-500/40 transition-all cursor-pointer">
              <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-pink-400 transition-colors">Registered Players</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold tracking-tight text-[var(--text-main)] font-mono">
                  {loading ? '...' : stats.users.toLocaleString()}
                </div>
                <ArrowUpRight className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </Link>

            <Link href="/database?table=inventory" className="glass-card p-6 flex flex-col justify-between group hover:border-fuchsia-500/40 transition-all cursor-pointer">
              <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-fuchsia-400 transition-colors">Total Card Inventory</span>
                <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold tracking-tight text-[var(--text-main)] font-mono">
                  {loading ? '...' : stats.inventory.toLocaleString()}
                </div>
                <ArrowUpRight className="w-4 h-4 text-fuchsia-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </Link>

            <Link href="/database?table=market" className="glass-card p-6 flex flex-col justify-between group hover:border-purple-500/40 transition-all cursor-pointer">
              <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-purple-400 transition-colors">Active Market Listings</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-[var(--border-glass)] group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold tracking-tight text-[var(--text-main)] font-mono">
                  {loading ? '...' : stats.market.toLocaleString()}
                </div>
                <ArrowUpRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </Link>

            <Link href="/custom-cards" className="glass-card p-6 flex flex-col justify-between group hover:border-pink-500/40 transition-all cursor-pointer">
              <div className="flex items-center justify-between text-[var(--text-main)] opacity-70 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-pink-400 transition-colors">Custom Draft Releases</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold tracking-tight text-[var(--text-main)] font-mono">
                  {loading ? '...' : stats.customCards.toLocaleString()}
                </div>
                <ArrowUpRight className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </Link>
          </div>

          {/* Quick Action Navigation Grid - Comprehensive Command Modules */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-60 mb-4">
              Core Control Suites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link href="/black-market" className="glass-card p-6 group hover:border-red-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--text-main)] opacity-50 group-hover:text-red-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-1">Black Market Manager</h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">Configure timed flash sales, 120+ discount percentages, multi-channel announcements, and role pings.</p>
              </Link>

              <Link href="/drops" className="glass-card p-6 group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Gift className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--text-main)] opacity-50 group-hover:text-amber-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-1">Loot Drops & Rare Gifts</h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">Automate random daily gift drops, crate rain intervals, multi-server channels, and ping mentions.</p>
              </Link>

              <Link href="/arcade" className="glass-card p-6 group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--text-main)] opacity-50 group-hover:text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-1">Arcade & Minigames</h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">Tune pack battle wagers (up to 50 vouchers), shootout dive physics, and lucky spin jackpots.</p>
              </Link>

              <Link href="/luck" className="glass-card p-6 group hover:border-pink-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-pink-500/15 text-pink-300 border border-pink-500/30">
                    <Dices className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--text-main)] opacity-50 group-hover:text-pink-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-1">Drop Rates & Luck Engine</h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">Configure draft pool probabilities, exchange chances, pity counters, and tier caps.</p>
              </Link>

              <Link href="/prices" className="glass-card p-6 group hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-300 border border-[var(--border-glass)]">
                    <Coins className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--text-main)] opacity-50 group-hover:text-purple-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-1">OVR Price Matrix</h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">Review minimum price floors, maximum market ceilings, and 70% static quicksell returns.</p>
              </Link>

              <Link href="/compensation" className="glass-card p-6 group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--text-main)] opacity-50 group-hover:text-emerald-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-1">Compensation Events</h3>
                <p className="text-xs text-[var(--text-main)] opacity-70 leading-relaxed">Launch global apology packs, coin & voucher grants, and schedule claim windows.</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
