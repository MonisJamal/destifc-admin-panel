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
  Filter,
  Wrench,
  RotateCcw,
  ShieldCheck,
  LayoutGrid,
  List,
  Code
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [repairingAll, setRepairingAll] = useState(false);
  const [repairingSingle, setRepairingSingle] = useState({});
  const [repairNotification, setRepairNotification] = useState(null);

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

  const repairAllSubsystems = async () => {
    setRepairingAll(true);
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'repair_all' })
      });
      const data = await res.json();
      if (data.success) {
        setRepairNotification({
          type: 'success',
          message: data.message || 'All subsystems auto-repaired and caches refreshed!',
          logs: data.logs || []
        });
        await runFullDiagnostics();
      } else {
        setRepairNotification({
          type: 'error',
          message: data.error || 'Failed to auto-repair subsystems.'
        });
      }
    } catch (err) {
      setRepairNotification({
        type: 'error',
        message: err.message
      });
    } finally {
      setRepairingAll(false);
      setTimeout(() => setRepairNotification(null), 8000);
    }
  };

  const repairSingleSubsystem = async (testId) => {
    setRepairingSingle(prev => ({ ...prev, [testId]: true }));
    try {
      const res = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'repair_target', targetId: testId })
      });
      const data = await res.json();
      if (data.success) {
        setRepairNotification({
          type: 'success',
          message: data.message || `Subsystem "${testId}" successfully repaired!`,
          logs: data.logs || []
        });
        await testSingleCommand(testId);
      }
    } catch (err) {
      console.error(`Error repairing ${testId}:`, err);
    } finally {
      setRepairingSingle(prev => ({ ...prev, [testId]: false }));
      setTimeout(() => setRepairNotification(null), 8000);
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

  const categories = [
    'All',
    'Economy & Quests',
    'Drafts & Battles',
    'Squad & Inventory',
    'Transfer Market',
    'Store & Vouchers',
    'Exchanges & SBCs',
    'Matches & Rivals',
    'Season & Signature',
    'Trading & P2P',
    'Achievements',
    'Admin & Tools',
    'Help & Manual',
    'Core Infrastructure'
  ];

  const filteredTests = tests.filter(t => {
    const matchesCat = filterCategory === 'All' || t.category === filterCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.cog && t.cog.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-purple-900/30">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Complete Bot Command Matrix & Health Suite
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                All 16 Cogs &bull; 56+ Slash Commands
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Command Diagnostics & Status Checker
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Live status, database query latency, and operational health check for every single Discord bot command across all 16 cogs.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={repairAllSubsystems}
              disabled={repairingAll || runningAll}
              className="px-4 py-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-900 border border-fuchsia-500/40 text-fuchsia-300 hover:text-fuchsia-200 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-950/40"
            >
              {repairingAll ? (
                <RotateCcw className="w-4 h-4 animate-spin text-fuchsia-400" />
              ) : (
                <Wrench className="w-4 h-4 text-pink-400" />
              )}
              <span>{repairingAll ? 'Repairing & Flushing...' : 'Auto-Repair & Flush Caches'}</span>
            </button>

            <LiquidButton
              onClick={runFullDiagnostics}
              disabled={runningAll || loading || repairingAll}
              loading={runningAll}
            >
              <Zap className="w-4 h-4" />
              Test All Commands
            </LiquidButton>
          </div>
        </div>

        {/* Repair Notification Toast */}
        {repairNotification && (
          <div className={`p-4 rounded-2xl border mb-6 flex items-start justify-between gap-3 animate-fade-in ${
            repairNotification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-start gap-2.5">
              {repairNotification.type === 'success' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-bold">{repairNotification.message}</p>
                {repairNotification.logs && repairNotification.logs.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-neutral-400 font-mono">
                    {repairNotification.logs.map((log, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {log}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRepairNotification(null)}
              className="text-neutral-500 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

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
            <p className="text-[11px] text-neutral-500 mt-1">{summary?.operational ?? 0} of {summary?.total ?? 0} commands passing</p>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Latency</span>
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{summary?.avg_latency_ms ?? 0}</span>
              <span className="text-xs text-fuchsia-300 font-mono font-semibold">ms</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Real-time DB query & handler speed</p>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Commands</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Terminal className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{tests.length}</span>
              <span className="text-xs text-purple-300 font-semibold">Live Probes</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Spanning all 16 cogs & subcommands</p>
          </div>

          <div className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Last Check</span>
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-neutral-200">
                {lastRunTime ? lastRunTime.toLocaleTimeString() : 'Just now'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Live cloud PostgreSQL synchronization</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col gap-4 mb-6 p-4 rounded-3xl bg-neutral-900/40 border border-purple-900/30 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search command (e.g. /daily, /market, /draft, /inventory, /play)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-950 border border-purple-900/40 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>

            {/* View Mode Switcher & Count */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-semibold">
                Showing {filteredTests.length} of {tests.length} commands
              </span>

              <div className="flex items-center p-1 rounded-xl bg-neutral-950 border border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Table Matrix View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map(cat => {
              const count = cat === 'All' ? tests.length : tests.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    filterCategory === cat
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                      : 'bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-purple-900/20'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filterCategory === cat ? 'bg-white/20 text-white' : 'bg-neutral-900 text-neutral-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Command Diagnostic Matrix */}
        {loading ? (
          <div className="p-16 rounded-3xl bg-neutral-900/30 border border-purple-900/30 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-sm font-semibold">Probing all 56+ bot commands and calculating execution latencies...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 rounded-3xl bg-neutral-900/30 border border-purple-900/30 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Search className="w-8 h-8 text-neutral-600 mb-2" />
            <p className="text-sm font-bold text-neutral-300">No commands matched your search or category filter</p>
            <p className="text-xs text-neutral-500">Try resetting your search query or switching to &ldquo;All&rdquo; categories.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTests.map((test) => {
              const isRunning = runningSingle[test.id];
              return (
                <div
                  key={test.id}
                  className="p-5 rounded-3xl bg-neutral-900/50 border border-purple-900/30 hover:border-purple-700/50 transition-all backdrop-blur-xl flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-purple-900/40 font-mono text-xs font-bold text-pink-300">
                          {test.command}
                        </span>
                        {test.cog && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-[10px] font-mono text-purple-300">
                            {test.cog}
                          </span>
                        )}
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

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                        {test.name}
                      </h3>
                      {test.description && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {test.description}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-neutral-300 bg-neutral-950/70 p-3 rounded-2xl border border-purple-900/20 font-mono leading-relaxed break-words">
                      {test.details}
                    </p>
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-purple-900/20 text-xs">
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tested at {test.tested_at ? new Date(test.tested_at).toLocaleTimeString() : 'N/A'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => repairSingleSubsystem(test.id)}
                        disabled={repairingSingle[test.id] || isRunning || runningAll || repairingAll}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-fuchsia-300 hover:text-fuchsia-100 border border-fuchsia-500/30 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                        title="Auto-repair locks & refresh cache for this command"
                      >
                        {repairingSingle[test.id] ? (
                          <RotateCcw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5 text-pink-400" />
                        )}
                        <span>{repairingSingle[test.id] ? 'Fixing...' : 'Auto-Fix'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => testSingleCommand(test.id)}
                        disabled={isRunning || runningAll || repairingSingle[test.id]}
                        className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-purple-900/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-pink-400" />
                        )}
                        <span>{isRunning ? 'Testing...' : 'Test'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table Matrix View */
          <div className="overflow-x-auto rounded-3xl border border-purple-900/30 bg-neutral-900/50 backdrop-blur-xl">
            <table className="w-full text-left text-xs text-neutral-300 border-collapse">
              <thead>
                <tr className="border-b border-purple-900/40 bg-neutral-950/80 text-neutral-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4 font-bold">Command</th>
                  <th className="p-4 font-bold">Cog File</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Latency</th>
                  <th className="p-4 font-bold">Diagnostics Details</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 font-sans">
                {filteredTests.map((test) => {
                  const isRunning = runningSingle[test.id];
                  return (
                    <tr key={test.id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-pink-300 whitespace-nowrap">
                        {test.command}
                      </td>
                      <td className="p-4 font-mono text-purple-300 text-[11px] whitespace-nowrap">
                        {test.cog || 'N/A'}
                      </td>
                      <td className="p-4 text-neutral-400 font-semibold whitespace-nowrap">
                        {test.category}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          test.status === 'ok'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : test.status === 'degraded'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/15 text-red-300 border-red-500/30'
                        }`}>
                          {test.status === 'ok' ? 'Working' : test.status === 'degraded' ? 'Degraded' : 'Failed'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg border text-xs ${getLatencyColor(test.latency)}`}>
                          {test.latency}ms
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400 font-mono text-[11px] max-w-md break-words">
                        {test.details}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => repairSingleSubsystem(test.id)}
                            disabled={repairingSingle[test.id] || isRunning || runningAll || repairingAll}
                            className="px-2 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-fuchsia-300 border border-fuchsia-500/30 text-[11px] font-semibold"
                            title="Auto-Fix"
                          >
                            {repairingSingle[test.id] ? (
                              <RotateCcw className="w-3 h-3 animate-spin" />
                            ) : (
                              'Fix'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => testSingleCommand(test.id)}
                            disabled={isRunning || runningAll || repairingSingle[test.id]}
                            className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-semibold text-[11px] flex items-center gap-1"
                          >
                            {isRunning ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>{isRunning ? '...' : 'Test'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
