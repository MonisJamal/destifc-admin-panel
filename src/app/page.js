'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Users, CreditCard, ShoppingBag, Sparkles, Flame, ArrowUpRight, ShieldCheck, Database, Sliders } from 'lucide-react';
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">DestiFC Admin Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">Live cloud telemetry connected to Supabase PostgreSQL & Discord Bot engine.</p>
            </div>
          </div>

          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Players</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {loading ? '...' : stats.users.toLocaleString()}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Card Inventory</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {loading ? '...' : stats.inventory.toLocaleString()}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Market Listings</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {loading ? '...' : stats.market.toLocaleString()}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider">Custom Draft Releases</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {loading ? '...' : stats.customCards.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/leaks" className="glass-card p-8 group hover:bg-white/60 transition-all border border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                  <Flame className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-amber-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Leaks Drafts & 16:9 Posters</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Data-mined unreleased cards, future promo dates, and 16:9 HD leak announcement generator.</p>
            </Link>

            <Link href="/database" className="glass-card p-8 group hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Database className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Cloud Database Explorer</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Inspect cards with OVR, position, club logos, nation flags, player inventories, and market listings.</p>
            </Link>

            <Link href="/cards" className="glass-card p-8 group hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">RenderZ Card Pool & Grant</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">Search 10,000+ official cards and grant any card directly to any Discord member with 1 click.</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
