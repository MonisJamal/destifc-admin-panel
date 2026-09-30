'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Activity, 
  Gauge, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Zap, 
  Clock, 
  Database, 
  Bot, 
  Terminal, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Check, 
  XCircle,
  Cpu,
  Layers,
  Search,
  Filter
} from 'lucide-react';

export default function BotDiagnosticsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [runningSingle, setRunningSingle] = useState({});
  const [summary, setSummary] = useState(null);
  const [tests, setTests] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRunTime, setLastRunTime] = useState(null);

  useEffect(() => {
    runFullDiagnostics();
  }, []);

  const runFullDiagnostics = async () => {
    setRunningAll(true);
    try {
      const res = await fetch('/api/diagnostics');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setTests(data.tests || []);
        setLastRunTime(new Date());
      }
    } catch (err) {
      console.error('Error running diagnostics:', err);
    } finally {
      setRunningAll(false);
      setLoading(false);
    }
  };

  const testSingleCommand = async (testId) => {
    setRunningSingle(prev => ({ ...prev, [testId]: true }));
    try {
      const res = await fetch(`/api/diagnostics?target=${testId}`);
      const data = await res.json();
      if (data.success && data.test) {
        setTests(prev => prev.map(t => t.id === testId ? data.test : t));
      }
    } catch (err) {
      console.error(`Error testing ${testId}:`, err);
    } finally {
      setRunningSingle(prev => ({ ...prev, [testId]: false }));
    }
  };

  const categories = ['All', 'Bot Command', 'Game Engine', 'Core Infrastructure', 'External Services'];

  const filteredTests = tests.filter(t => {
    const matchesCat = filterCategory === 'All' || t.category === filterCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getLatencyColor = (ms) => {
    if (ms <= 0) return 'text-neutral-500 bg-neutral-900/50 border-neutral-800';
    if (ms < 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (ms < 150) return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30';
    if (ms < 300) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-[#0d0914] text-neutral-100 flex selection:bg-purple-500/30 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Bot Command Health & Latency Suite
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Live Subsystem Probes
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Command Diagnostics & Latency Tester
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Benchmark execution speeds, probe database queries, verify command readiness, and inspect response times for every Discord bot feature.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LiquidButton
              onClick={runFullDiagnostics}
              disabled={runningAll || loading}
              loading={runningAll}
            >
              <Zap className="w-4 h-4" />
              Run Full Diagnostics
            </LiquidButton>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Overall Health</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{summary?.health_score ?? 100}%</span>
              <span className="text-xs text-emerald-400 font-semibold">Operational</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">{summary?.operational ?? 0} of {summary?.total ?? 0} services passing</p>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Response Latency</span>
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{summary?.avg_latency_ms ?? 0}</span>
              <span className="text-xs text-fuchsia-300 font-mono font-semibold">ms</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Real-time query & computation speed</p>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Commands Tested</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Terminal className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{tests.length}</span>
              <span className="text-xs text-purple-300 font-semibold">Active Probes</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Covers all major Discord bot commands</p>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Last Diagnostic Run</span>
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-neutral-200">
                {lastRunTime ? lastRunTime.toLocaleTimeString() : 'Just now'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Live background ping check</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-neutral-900/40 border border-purple-900/30 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search command or subsystem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-neutral-950 border border-purple-900/40 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>

        {/* Command Diagnostic Matrix */}
        {loading ? (
          <div className="p-16 rounded-3xl bg-neutral-900/30 border border-purple-900/30 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-semibold">Probing all bot commands and calculating execution latencies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTests.map((test) => {
              const isRunning = runningSingle[test.id];
              return (
                <div
                  key={test.id}
                  className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 hover:border-purple-700/50 transition-all backdrop-blur-xl flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-purple-900/40 font-mono text-xs font-bold text-pink-300">
                          {test.command}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                          {test.category}
                        </span>
                      </div>

                      {/* Status & Latency Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1 ${getLatencyColor(test.latency)}`}>
                          <Zap className="w-3 h-3" />
                          {test.latency}ms
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          test.status === 'ok'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : test.status === 'degraded'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/15 text-red-300 border-red-500/30'
                        }`}>
                          {test.status === 'ok' ? 'Working' : test.status === 'degraded' ? 'Degraded' : 'Failed'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                      {test.name}
                    </h3>

                    <p className="text-xs text-neutral-400 bg-neutral-950/70 p-3 rounded-2xl border border-purple-900/20 font-mono leading-relaxed">
                      {test.details}
                    </p>
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-purple-900/20 text-xs">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tested at {test.tested_at ? new Date(test.tested_at).toLocaleTimeString() : 'N/A'}
                    </span>

                    <button
                      type="button"
                      onClick={() => testSingleCommand(test.id)}
                      disabled={isRunning || runningAll}
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-purple-900/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {isRunning ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-pink-400" />
                      )}
                      <span>{isRunning ? 'Testing...' : 'Test Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
