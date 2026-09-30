'use client';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { RotateCcw } from 'lucide-react';

const ALL_FORMATIONS = [
  '4-3-3 Attack',
  '4-1-2-1-2 Narrow',
  '4-4-2 Flat',
  '4-2-3-1 Wide',
  '4-2-3-1 Narrow',
  '4-3-3 Holding',
  '4-3-3 Defend',
  '4-3-3 Flat',
  '4-3-3 False 9',
  '4-1-2-1-2 Wide',
  '4-2-2-2',
  '4-5-1 Flat',
  '4-5-1 Attack',
  '4-4-1-1 Midfield',
  '4-4-1-1 Attack',
  '4-3-2-1',
  '4-3-1-2',
  '3-4-3 Flat',
  '3-4-3 Diamond',
  '3-5-2',
  '3-4-1-2',
  '3-1-4-2',
  '3-4-2-1',
  '3-5-1-1',
  '5-3-2',
  '5-2-1-2',
  '5-4-1 Flat',
  '5-4-1 Diamond',
  '5-2-2-1',
  '5-2-3'
];

const DEFAULT_LAYOUTS = {
  '4-3-3 Attack': {
    'LW': [0.12, 0.20], 'ST': [0.50, 0.14], 'RW': [0.88, 0.20],
    'CAM': [0.50, 0.40], 'CM1': [0.28, 0.54], 'CM2': [0.72, 0.54],
    'LB': [0.08, 0.78], 'CB1': [0.35, 0.82], 'CB2': [0.65, 0.82], 'RB': [0.92, 0.78],
    'GK': [0.50, 0.95]
  },
  '4-1-2-1-2 Narrow': {
    'ST1': [0.34, 0.14], 'ST2': [0.66, 0.14],
    'CAM': [0.50, 0.34],
    'CM1': [0.25, 0.52], 'CM2': [0.75, 0.52],
    'CDM': [0.50, 0.68],
    'LB': [0.08, 0.80], 'CB1': [0.34, 0.84], 'CB2': [0.66, 0.84], 'RB': [0.92, 0.80],
    'GK': [0.50, 0.96]
  },
  '4-2-2-2': {
    'ST1': [0.34, 0.14], 'ST2': [0.66, 0.14],
    'CAM1': [0.22, 0.38], 'CAM2': [0.78, 0.38],
    'CDM1': [0.34, 0.62], 'CDM2': [0.66, 0.62],
    'LB': [0.08, 0.80], 'CB1': [0.34, 0.84], 'CB2': [0.66, 0.84], 'RB': [0.92, 0.80],
    'GK': [0.50, 0.96]
  },
  '4-4-2 Flat': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'LM': [0.10, 0.46], 'CM1': [0.36, 0.52], 'CM2': [0.64, 0.52], 'RM': [0.90, 0.46],
    'LB': [0.08, 0.80], 'CB1': [0.34, 0.84], 'CB2': [0.66, 0.84], 'RB': [0.92, 0.80],
    'GK': [0.50, 0.96]
  },
  '3-5-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.36],
    'LM': [0.08, 0.52], 'CDM1': [0.34, 0.64], 'CDM2': [0.66, 0.64], 'RM': [0.92, 0.52],
    'CB1': [0.22, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.78, 0.82],
    'GK': [0.50, 0.96]
  },
  '5-3-2': {
    'ST1': [0.36, 0.14], 'ST2': [0.64, 0.14],
    'CM1': [0.25, 0.48], 'CM2': [0.50, 0.52], 'CM3': [0.75, 0.48],
    'LWB': [0.06, 0.74], 'CB1': [0.26, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.74, 0.82], 'RWB': [0.94, 0.74],
    'GK': [0.50, 0.96]
  }
};

export default function FormationsPage() {
  const [selectedFormation, setSelectedFormation] = useState('4-1-2-1-2 Narrow');
  const [positions, setPositions] = useState(DEFAULT_LAYOUTS['4-1-2-1-2 Narrow']);
  const [activeNode, setActiveNode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const pitchRef = useRef(null);

  useEffect(() => {
    fetchFormation(selectedFormation);
  }, [selectedFormation]);

  const fetchFormation = async (name) => {
    try {
      const res = await fetch('/api/formations');
      const data = await res.json();
      if (data.success) {
        const found = data.layouts.find(l => l.name === name);
        if (found && found.positions && Object.keys(found.positions).length > 0) {
          setPositions(found.positions);
          return;
        }
      }
    } catch (e) {}
    setPositions(DEFAULT_LAYOUTS[name] || DEFAULT_LAYOUTS['4-3-3 Attack']);
  };

  const handlePointerDown = (pos) => (e) => {
    e.preventDefault();
    setActiveNode(pos);
  };

  const handlePointerMove = (e) => {
    if (!activeNode || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;

    x = Math.max(0.04, Math.min(0.96, parseFloat(x.toFixed(3))));
    y = Math.max(0.08, Math.min(0.96, parseFloat(y.toFixed(3))));

    setPositions(prev => ({
      ...prev,
      [activeNode]: [x, y]
    }));
  };

  const handlePointerUp = () => {
    setActiveNode(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formationName: selectedFormation, positions }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {}
    finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPositions(DEFAULT_LAYOUTS[selectedFormation] || DEFAULT_LAYOUTS['4-3-3 Attack']);
  };

  return (
    <div className="flex min-h-screen" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <Sidebar />
      <main className="ml-64 flex-1 p-10 select-none">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">3D Formation Customizer</h1>
              <p className="text-sm text-neutral-500 mt-1">Drag player nodes on the pitch turf. Changes apply instantly to Discord <code className="bg-white/60 px-1.5 py-0.5 rounded text-neutral-700 font-mono">/squad view</code>.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/60 hover:bg-white text-xs font-semibold text-neutral-600 transition-all border border-white"
              >
                <RotateCcw className="w-4 h-4" /> Reset Default
              </button>
              <LiquidButton
                text={saving ? "Saving..." : (savedSuccess ? "Saved to Bot!" : "Save Layout")}
                onClick={handleSave}
                disabled={saving}
                width="200px"
                height="50px"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="glass-card p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Select Formation</label>
                <select
                  value={selectedFormation}
                  onChange={(e) => setSelectedFormation(e.target.value)}
                  className="apple-input font-bold"
                >
                  {ALL_FORMATIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Tactical Positions ({Object.keys(positions).length})</span>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {Object.entries(positions).map(([pos, coords]) => (
                    <div key={pos} className="flex items-center justify-between p-2 rounded-xl bg-white/40 text-xs font-mono">
                      <span className="font-bold text-neutral-800">{pos}</span>
                      <span className="text-neutral-500 font-mono">X: {coords[0]} | Y: {coords[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 glass-card p-6">
              <div
                ref={pitchRef}
                className="w-full aspect-[16/9] rounded-3xl relative overflow-hidden shadow-2xl border-4 border-white/40 cursor-crosshair bg-emerald-800"
                style={{
                  backgroundImage: 'radial-gradient(ellipse at center 40%, #1e7e34 0%, #155724 75%, #0b3414 100%)',
                }}
              >
                {/* 3D Pitch Markings */}
                <div className="absolute inset-x-12 top-6 bottom-6 border-2 border-white/40 rounded-2xl pointer-events-none">
                  <div className="absolute top-1/2 inset-x-0 h-0.5 bg-white/40 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full border-2 border-white/40 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-0 left-1/2 w-72 h-24 border-2 border-white/40 border-t-0 -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-72 h-24 border-2 border-white/40 border-b-0 -translate-x-1/2"></div>
                </div>

                {/* Tactical Nodes */}
                {Object.entries(positions).map(([pos, coords]) => {
                  const xPercent = coords[0] * 100;
                  const yPercent = coords[1] * 100;
                  const isSelected = activeNode === pos;

                  return (
                    <div
                      key={pos}
                      onPointerDown={handlePointerDown(pos)}
                      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xl scale-125 z-30 ring-4 ring-white'
                          : 'bg-neutral-900/90 hover:bg-neutral-900 text-white shadow-xl z-20 border border-white/30'
                      }`}
                    >
                      <span className="text-[11px] font-black tracking-wider leading-none">{pos}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
