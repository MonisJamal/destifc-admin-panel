'use client';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { RotateCcw, Image as ImageIcon, Upload, Trash2, CheckCircle2, Sparkles, Layers } from 'lucide-react';

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

const THEMES = [
  { id: 'default', name: 'Default Stadium', image: '/pitches/pitch_bg.jpg', glow: '#00f0ff' },
  { id: 'snow', name: 'Snow Frost Arena', image: '/pitches/pitch_snow.jpg', glow: '#a0ebff' },
  { id: 'lava', name: 'Volcano Lava Arena', image: '/pitches/pitch_lava.jpg', glow: '#ff5a0a' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', image: '/pitches/pitch_cyber.jpg', glow: '#ff00b4' },
  { id: 'galaxy', name: 'Cosmic Galaxy', image: '/pitches/pitch_galaxy.jpg', glow: '#be64ff' },
  { id: 'gold', name: 'Royal Gold Arena', image: '/pitches/pitch_gold.jpg', glow: '#ffd700' },
  { id: 'desert', name: 'Desert Dunes Arena', image: '/pitches/pitch_desert.jpg', glow: '#ffaf2d' },
];

const DEFAULT_LAYOUTS = {
  '4-3-3 Attack': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'CAM': [0.50, 0.38], 'CM1': [0.28, 0.54], 'CM2': [0.72, 0.54],
    'LB': [0.10, 0.78], 'CB1': [0.36, 0.82], 'CB2': [0.64, 0.82], 'RB': [0.90, 0.78],
    'GK': [0.50, 0.95]
  },
  '4-1-2-1-2 Narrow': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.34],
    'CM1': [0.25, 0.50], 'CM2': [0.75, 0.50],
    'CDM': [0.50, 0.66],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-4-2 Flat': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'LM': [0.12, 0.44], 'CM1': [0.36, 0.50], 'CM2': [0.64, 0.50], 'RM': [0.88, 0.44],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-2-3-1 Wide': {
    'ST': [0.50, 0.14],
    'LM': [0.14, 0.36], 'CAM': [0.50, 0.34], 'RM': [0.86, 0.36],
    'CDM1': [0.34, 0.60], 'CDM2': [0.66, 0.60],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-2-3-1 Narrow': {
    'ST': [0.50, 0.14],
    'CAM1': [0.22, 0.36], 'CAM2': [0.50, 0.34], 'CAM3': [0.78, 0.36],
    'CDM1': [0.34, 0.60], 'CDM2': [0.66, 0.60],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-3-3 Holding': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'CM1': [0.30, 0.44], 'CM2': [0.70, 0.44],
    'CDM': [0.50, 0.62],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-3-3 Defend': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'CM': [0.50, 0.44],
    'CDM1': [0.32, 0.62], 'CDM2': [0.68, 0.62],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-3-3 Flat': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'CM1': [0.24, 0.48], 'CM2': [0.50, 0.50], 'CM3': [0.76, 0.48],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-3-3 False 9': {
    'LW': [0.16, 0.22], 'CF': [0.50, 0.26], 'RW': [0.84, 0.22],
    'CM1': [0.28, 0.48], 'CM2': [0.72, 0.48],
    'CDM': [0.50, 0.64],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-1-2-1-2 Wide': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.34],
    'LM': [0.12, 0.48], 'RM': [0.88, 0.48],
    'CDM': [0.50, 0.65],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-2-2-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM1': [0.20, 0.36], 'CAM2': [0.80, 0.36],
    'CDM1': [0.34, 0.60], 'CDM2': [0.66, 0.60],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-5-1 Flat': {
    'ST': [0.50, 0.14],
    'LM': [0.10, 0.44], 'CM1': [0.30, 0.48], 'CM2': [0.50, 0.52], 'CM3': [0.70, 0.48], 'RM': [0.90, 0.44],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-5-1 Attack': {
    'ST': [0.50, 0.14],
    'LM': [0.12, 0.44], 'CAM1': [0.34, 0.36], 'CAM2': [0.66, 0.36], 'RM': [0.88, 0.44],
    'CM': [0.50, 0.58],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-4-1-1 Midfield': {
    'ST': [0.50, 0.14],
    'CF': [0.50, 0.30],
    'LM': [0.12, 0.48], 'CM1': [0.36, 0.52], 'CM2': [0.64, 0.52], 'RM': [0.88, 0.48],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-4-1-1 Attack': {
    'ST': [0.50, 0.14],
    'CAM': [0.50, 0.32],
    'LM': [0.12, 0.48], 'CM1': [0.36, 0.52], 'CM2': [0.64, 0.52], 'RM': [0.88, 0.48],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-3-2-1': {
    'ST': [0.50, 0.14],
    'LF': [0.30, 0.26], 'RF': [0.70, 0.26],
    'CM1': [0.24, 0.50], 'CM2': [0.50, 0.54], 'CM3': [0.76, 0.50],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '4-3-1-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.34],
    'CM1': [0.24, 0.52], 'CM2': [0.50, 0.56], 'CM3': [0.76, 0.52],
    'LB': [0.10, 0.80], 'CB1': [0.35, 0.84], 'CB2': [0.65, 0.84], 'RB': [0.90, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-4-3 Flat': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'LM': [0.10, 0.48], 'CM1': [0.36, 0.52], 'CM2': [0.64, 0.52], 'RM': [0.90, 0.48],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-4-3 Diamond': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'CAM': [0.50, 0.38],
    'LM': [0.10, 0.50], 'RM': [0.90, 0.50],
    'CDM': [0.50, 0.64],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-5-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.34],
    'LM': [0.10, 0.50], 'RM': [0.90, 0.50],
    'CDM1': [0.34, 0.62], 'CDM2': [0.66, 0.62],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-4-1-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.34],
    'LM': [0.10, 0.50], 'CM1': [0.36, 0.54], 'CM2': [0.64, 0.54], 'RM': [0.90, 0.50],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-1-4-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'LM': [0.10, 0.44], 'CM1': [0.34, 0.48], 'CM2': [0.66, 0.48], 'RM': [0.90, 0.44],
    'CDM': [0.50, 0.64],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-4-2-1': {
    'ST': [0.50, 0.14],
    'LF': [0.30, 0.28], 'RF': [0.70, 0.28],
    'LM': [0.10, 0.48], 'CM1': [0.36, 0.54], 'CM2': [0.64, 0.54], 'RM': [0.90, 0.48],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '3-5-1-1': {
    'ST': [0.50, 0.14],
    'CF': [0.50, 0.28],
    'LM': [0.10, 0.48], 'CM1': [0.32, 0.52], 'CM2': [0.68, 0.52], 'RM': [0.90, 0.48],
    'CDM': [0.50, 0.66],
    'CB1': [0.24, 0.80], 'CB2': [0.50, 0.84], 'CB3': [0.76, 0.80],
    'GK': [0.50, 0.95]
  },
  '5-3-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CM1': [0.26, 0.48], 'CM2': [0.50, 0.52], 'CM3': [0.74, 0.48],
    'LWB': [0.08, 0.74], 'CB1': [0.28, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.72, 0.82], 'RWB': [0.92, 0.74],
    'GK': [0.50, 0.95]
  },
  '5-2-1-2': {
    'ST1': [0.35, 0.14], 'ST2': [0.65, 0.14],
    'CAM': [0.50, 0.34],
    'CM1': [0.34, 0.52], 'CM2': [0.66, 0.52],
    'LWB': [0.08, 0.74], 'CB1': [0.28, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.72, 0.82], 'RWB': [0.92, 0.74],
    'GK': [0.50, 0.95]
  },
  '5-4-1 Flat': {
    'ST': [0.50, 0.14],
    'LM': [0.12, 0.44], 'CM1': [0.36, 0.50], 'CM2': [0.64, 0.50], 'RM': [0.88, 0.44],
    'LWB': [0.08, 0.74], 'CB1': [0.28, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.72, 0.82], 'RWB': [0.92, 0.74],
    'GK': [0.50, 0.95]
  },
  '5-4-1 Diamond': {
    'ST': [0.50, 0.14],
    'CAM': [0.50, 0.34],
    'LM': [0.12, 0.48], 'RM': [0.88, 0.48],
    'CDM': [0.50, 0.62],
    'LWB': [0.08, 0.74], 'CB1': [0.28, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.72, 0.82], 'RWB': [0.92, 0.74],
    'GK': [0.50, 0.95]
  },
  '5-2-2-1': {
    'ST': [0.50, 0.14],
    'LW': [0.18, 0.26], 'RW': [0.82, 0.26],
    'CM1': [0.35, 0.50], 'CM2': [0.65, 0.50],
    'LWB': [0.08, 0.74], 'CB1': [0.28, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.72, 0.82], 'RWB': [0.92, 0.74],
    'GK': [0.50, 0.95]
  },
  '5-2-3': {
    'LW': [0.15, 0.22], 'ST': [0.50, 0.14], 'RW': [0.85, 0.22],
    'CM1': [0.35, 0.50], 'CM2': [0.65, 0.50],
    'LWB': [0.08, 0.74], 'CB1': [0.28, 0.82], 'CB2': [0.50, 0.85], 'CB3': [0.72, 0.82], 'RWB': [0.92, 0.74],
    'GK': [0.50, 0.95]
  }
};

export default function FormationsPage() {
  const [selectedFormation, setSelectedFormation] = useState('4-1-2-1-2 Narrow');
  const [positions, setPositions] = useState(DEFAULT_LAYOUTS['4-1-2-1-2 Narrow']);
  const [activeNode, setActiveNode] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [customPitchUrl, setCustomPitchUrl] = useState(null);
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
      if (data.success && data.layouts) {
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

  const handlePitchUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (.png, .jpg, .webp)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCustomPitchUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomPitch = () => {
    setCustomPitchUrl(null);
  };

  const currentPitchImage = customPitchUrl || selectedTheme.image;

  return (
    <div className="flex min-h-screen" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <Sidebar />
      <main className="ml-64 flex-1 p-10 select-none">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">3D Formation Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Discord Sync
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Customize, drag & drop, and map player nodes for all 30 tactical formations. Changes apply instantly to Discord <code className="bg-white/80 px-1.5 py-0.5 rounded text-neutral-700 font-mono font-bold">/squad view</code>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-xs font-bold text-neutral-700 transition-all border border-black/5 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reset Default
              </button>
              <LiquidButton
                text={saving ? "Saving..." : (savedSuccess ? "✅ Saved to Bot!" : "Save Formation Layout")}
                onClick={handleSave}
                disabled={saving}
                width="220px"
                height="50px"
              />
            </div>
          </div>

          {/* Theme Selector & Custom Stadium Manager Bar */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Official Stadium Themes:</span>
              </div>

              {/* Custom Upload / Reset Button */}
              <div className="flex items-center gap-2">
                {customPitchUrl && (
                  <button
                    onClick={handleClearCustomPitch}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Custom Pitch
                  </button>
                )}
                <label className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Pitch PNG</span>
                  <input type="file" accept="image/*" onChange={handlePitchUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Stadium Theme Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {THEMES.map((theme) => {
                const isActive = !customPitchUrl && selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setCustomPitchUrl(null);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-md border-neutral-900'
                        : 'bg-white/60 hover:bg-white text-neutral-600 border-black/5'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.glow }}></span>
                    <span>{theme.name}</span>
                  </button>
                );
              })}
              {customPitchUrl && (
                <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Custom Upload Active
                </span>
              )}
            </div>
          </div>

          {/* Main Grid: Sidebar Controls & Stadium Pitch Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Formation & Position Node Inspector */}
            <div className="glass-card p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Select Formation ({ALL_FORMATIONS.length} Available)</label>
                  <select
                    value={selectedFormation}
                    onChange={(e) => setSelectedFormation(e.target.value)}
                    className="apple-input font-black text-sm bg-white cursor-pointer"
                  >
                    {ALL_FORMATIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Tactical Positions ({Object.keys(positions).length})</span>
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {Object.entries(positions).map(([pos, coords]) => (
                      <div
                        key={pos}
                        onClick={() => setActiveNode(pos)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          activeNode === pos
                            ? 'bg-neutral-900 text-amber-400 font-bold shadow-md'
                            : 'bg-white/50 hover:bg-white text-neutral-700 border border-black/5'
                        }`}
                      >
                        <span className="font-bold">{pos}</span>
                        <span className="text-[11px] opacity-80">X: {coords[0]} | Y: {coords[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/5 border border-black/5 text-[11px] text-neutral-500 space-y-1">
                <p className="font-bold text-neutral-800">💡 Pro Tip:</p>
                <p>Click and drag any node on the pitch to adjust its 3D depth and wing spacing. Hit <strong>Save Layout</strong> when done!</p>
              </div>
            </div>

            {/* Stadium Pitch Canvas */}
            <div className="lg:col-span-3 glass-card p-6">
              <div
                ref={pitchRef}
                className="w-full aspect-[16/9] rounded-3xl relative overflow-hidden shadow-2xl border-4 border-white/60 cursor-crosshair group"
                style={{
                  backgroundImage: `url(${currentPitchImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Dark Gradient Overlay for 3D depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

                {/* Stadium Floodlights & Turf Marking Guidelines */}
                <div className="absolute inset-x-12 top-6 bottom-6 border-2 border-white/20 rounded-2xl pointer-events-none">
                  <div className="absolute top-1/2 inset-x-0 h-0.5 bg-white/20 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-44 h-44 rounded-full border-2 border-white/20 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-0 left-1/2 w-80 h-28 border-2 border-white/20 border-t-0 -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-80 h-28 border-2 border-white/20 border-b-0 -translate-x-1/2"></div>
                </div>

                {/* Tactical Nodes with 3D Hologram Glow */}
                {Object.entries(positions).map(([pos, coords]) => {
                  const xPercent = coords[0] * 100;
                  const yPercent = coords[1] * 100;
                  const isSelected = activeNode === pos;
                  const glowColor = selectedTheme.glow || '#00f0ff';

                  return (
                    <div
                      key={pos}
                      onPointerDown={handlePointerDown(pos)}
                      style={{
                        left: `${xPercent}%`,
                        top: `${yPercent}%`,
                        boxShadow: isSelected
                          ? `0 0 25px ${glowColor}, 0 0 10px #ffffff`
                          : `0 8px 20px rgba(0,0,0,0.5), 0 0 12px ${glowColor}66`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
                        isSelected
                          ? 'bg-neutral-950 text-white scale-125 z-30 ring-2 ring-white'
                          : 'bg-neutral-900/90 hover:bg-neutral-900 text-white z-20 border border-white/30 hover:scale-110'
                      }`}
                    >
                      {/* Positional 3D Base Hologram Line */}
                      <div
                        className="absolute -bottom-2 w-10 h-1.5 rounded-full blur-[1px]"
                        style={{ backgroundColor: glowColor }}
                      ></div>
                      <span className="text-xs font-black tracking-wider leading-none text-white drop-shadow">
                        {pos}
                      </span>
                      <span className="text-[8px] font-bold text-neutral-300 mt-0.5">
                        {coords[0]},{coords[1]}
                      </span>
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
