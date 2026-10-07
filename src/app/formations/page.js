'use client';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { RotateCcw, Image as ImageIcon, Upload, Trash2, CheckCircle2, Sparkles, Layers } from 'lucide-react';

const ALL_FORMATIONS = [
  '4-3-3 Attack',
  '4-3-3 Flat',
  '4-3-3 Holding',
  '4-3-3 Defend',
  '4-3-3 False 9',
  '4-1-2-1-2 Narrow',
  '4-1-2-1-2 Wide',
  '4-2-2-2',
  '4-2-3-1 Narrow',
  '4-2-3-1 Wide',
  '4-2-1-3',
  '4-3-1-2',
  '4-3-2-1',
  '4-4-2 Flat',
  '4-4-2 Holding',
  '4-4-1-1 Flat',
  '4-4-1-1 Attack',
  '4-1-3-2',
  '4-1-4-1',
  '4-5-1 Flat',
  '4-5-1 Attack',
  '4-2-4',
  '3-5-2',
  '3-1-4-2',
  '3-4-1-2',
  '3-4-2-1',
  '3-4-3 Flat',
  '3-4-3 Diamond',
  '3-5-1-1',
  '5-2-1-2',
  '5-2-2-1',
  '5-3-2',
  '5-4-1 Flat',
  '5-4-1 Defend'
];

const THEMES = [
  { id: 'default', name: 'Default Stadium', image: '/pitches/pitch_bg.jpg', glow: '#00f0ff' },
  { id: 'bernabeu', name: 'Santiago Bernabéu', image: '/pitches/pitch_bernabeu.jpg', glow: '#ffffff' },
  { id: 'campnou', name: 'Camp Nou', image: '/pitches/pitch_campnou.jpg', glow: '#004d98' },
  { id: 'oldtrafford', name: 'Old Trafford', image: '/pitches/pitch_oldtrafford.jpg', glow: '#da291c' },
  { id: 'anfield', name: 'Anfield', image: '/pitches/pitch_anfield.jpg', glow: '#c8102e' },
  { id: 'sansiro', name: 'San Siro', image: '/pitches/pitch_sansiro.jpg', glow: '#ff1e1e' },
  { id: 'allianz', name: 'Allianz Arena', image: '/pitches/pitch_allianz.jpg', glow: '#dc052d' },
  { id: 'maracana', name: 'Maracanã', image: '/pitches/pitch_maracana.jpg', glow: '#009c3b' },
  { id: 'wembley', name: 'Wembley Stadium', image: '/pitches/pitch_wembley.jpg', glow: '#c8e1ff' },
  { id: 'gold', name: 'Roman Colosseum Gold', image: '/pitches/pitch_gold.jpg', glow: '#ffd700' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', image: '/pitches/pitch_cyber.jpg', glow: '#ff00b4' },
  { id: 'lava', name: 'Volcano Caldera', image: '/pitches/pitch_lava.jpg', glow: '#ff5a0a' },
  { id: 'snow', name: 'Frostbite Arena', image: '/pitches/pitch_snow.jpg', glow: '#a0ebff' },
  { id: 'desert', name: 'Oasis Coliseum', image: '/pitches/pitch_desert.jpg', glow: '#ffaf2d' },
  { id: 'galaxy', name: 'Cosmic Orbit', image: '/pitches/pitch_galaxy.jpg', glow: '#be64ff' },
];

const DEFAULT_LAYOUTS = {
  "4-3-3 Attack": {
    "ST": [
      0.5,
      0.08
    ],
    "LW": [
      0.14,
      0.16
    ],
    "RW": [
      0.86,
      0.16
    ],
    "CAM": [
      0.5,
      0.32
    ],
    "CM1": [
      0.26,
      0.48
    ],
    "CM2": [
      0.74,
      0.48
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-3-3 Flat": {
    "ST": [
      0.5,
      0.08
    ],
    "LW": [
      0.14,
      0.16
    ],
    "RW": [
      0.86,
      0.16
    ],
    "CM1": [
      0.22,
      0.46
    ],
    "CM2": [
      0.5,
      0.44
    ],
    "CM3": [
      0.78,
      0.46
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-3-3 Holding": {
    "ST": [
      0.5,
      0.08
    ],
    "LW": [
      0.14,
      0.16
    ],
    "RW": [
      0.86,
      0.16
    ],
    "CM1": [
      0.26,
      0.4
    ],
    "CM2": [
      0.74,
      0.4
    ],
    "CDM": [
      0.5,
      0.58
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-3-3 Defend": {
    "ST": [
      0.5,
      0.08
    ],
    "LW": [
      0.14,
      0.16
    ],
    "RW": [
      0.86,
      0.16
    ],
    "CM": [
      0.5,
      0.36
    ],
    "CDM1": [
      0.3,
      0.54
    ],
    "CDM2": [
      0.7,
      0.54
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-3-3 False 9": {
    "CF": [
      0.5,
      0.2
    ],
    "LW": [
      0.14,
      0.1
    ],
    "RW": [
      0.86,
      0.1
    ],
    "CM1": [
      0.25,
      0.44
    ],
    "CM2": [
      0.75,
      0.44
    ],
    "CDM": [
      0.5,
      0.6
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-4-2 Flat": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "LM": [
      0.08,
      0.42
    ],
    "CM1": [
      0.35,
      0.46
    ],
    "CM2": [
      0.65,
      0.46
    ],
    "RM": [
      0.92,
      0.42
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-4-2 Holding": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "LM": [
      0.08,
      0.38
    ],
    "RM": [
      0.92,
      0.38
    ],
    "CDM1": [
      0.38,
      0.48
    ],
    "CDM2": [
      0.62,
      0.48
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.32,
      0.77
    ],
    "CB2": [
      0.68,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-4-1-1 Flat": {
    "ST": [
      0.5,
      0.08
    ],
    "CF": [
      0.5,
      0.26
    ],
    "LM": [
      0.08,
      0.46
    ],
    "CM1": [
      0.34,
      0.49
    ],
    "CM2": [
      0.66,
      0.49
    ],
    "RM": [
      0.92,
      0.46
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-4-1-1 Attack": {
    "ST": [
      0.5,
      0.08
    ],
    "CAM": [
      0.5,
      0.26
    ],
    "LM": [
      0.08,
      0.46
    ],
    "CM1": [
      0.34,
      0.49
    ],
    "CM2": [
      0.66,
      0.49
    ],
    "RM": [
      0.92,
      0.46
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-2-3-1 Narrow": {
    "ST": [
      0.5,
      0.08
    ],
    "CAM1": [
      0.22,
      0.28
    ],
    "CAM2": [
      0.5,
      0.3
    ],
    "CAM3": [
      0.78,
      0.28
    ],
    "CDM1": [
      0.38,
      0.49
    ],
    "CDM2": [
      0.62,
      0.49
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.32,
      0.77
    ],
    "CB2": [
      0.68,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-2-3-1 Wide": {
    "ST": [
      0.5,
      0.08
    ],
    "LM": [
      0.08,
      0.3
    ],
    "CAM": [
      0.5,
      0.3
    ],
    "RM": [
      0.92,
      0.3
    ],
    "CDM1": [
      0.38,
      0.49
    ],
    "CDM2": [
      0.62,
      0.49
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.32,
      0.77
    ],
    "CB2": [
      0.68,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-2-2-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM1": [
      0.18,
      0.3
    ],
    "CAM2": [
      0.82,
      0.3
    ],
    "CDM1": [
      0.38,
      0.49
    ],
    "CDM2": [
      0.62,
      0.49
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.32,
      0.77
    ],
    "CB2": [
      0.68,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-2-4": {
    "LW": [
      0.08,
      0.12
    ],
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "RW": [
      0.92,
      0.12
    ],
    "CM1": [
      0.35,
      0.46
    ],
    "CM2": [
      0.65,
      0.46
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-1-2-1-2 Narrow": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM": [
      0.5,
      0.26
    ],
    "CM1": [
      0.24,
      0.44
    ],
    "CM2": [
      0.76,
      0.44
    ],
    "CDM": [
      0.5,
      0.6
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-1-2-1-2 Wide": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM": [
      0.5,
      0.26
    ],
    "LM": [
      0.08,
      0.44
    ],
    "RM": [
      0.92,
      0.44
    ],
    "CDM": [
      0.5,
      0.6
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-1-3-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "LM": [
      0.08,
      0.38
    ],
    "CM": [
      0.5,
      0.38
    ],
    "RM": [
      0.92,
      0.38
    ],
    "CDM": [
      0.5,
      0.58
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-1-4-1": {
    "ST": [
      0.5,
      0.08
    ],
    "LM": [
      0.08,
      0.38
    ],
    "CM1": [
      0.34,
      0.4
    ],
    "CM2": [
      0.66,
      0.4
    ],
    "RM": [
      0.92,
      0.38
    ],
    "CDM": [
      0.5,
      0.58
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-2-1-3": {
    "LW": [
      0.14,
      0.14
    ],
    "ST": [
      0.5,
      0.08
    ],
    "RW": [
      0.86,
      0.14
    ],
    "CAM": [
      0.5,
      0.3
    ],
    "CDM1": [
      0.38,
      0.49
    ],
    "CDM2": [
      0.62,
      0.49
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.32,
      0.77
    ],
    "CB2": [
      0.68,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-3-1-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM": [
      0.5,
      0.28
    ],
    "CM1": [
      0.22,
      0.48
    ],
    "CM2": [
      0.5,
      0.5
    ],
    "CM3": [
      0.78,
      0.48
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-3-2-1": {
    "ST": [
      0.5,
      0.08
    ],
    "LF": [
      0.28,
      0.24
    ],
    "RF": [
      0.72,
      0.24
    ],
    "CM1": [
      0.22,
      0.48
    ],
    "CM2": [
      0.5,
      0.5
    ],
    "CM3": [
      0.78,
      0.48
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-5-1 Flat": {
    "ST": [
      0.5,
      0.08
    ],
    "LM": [
      0.08,
      0.42
    ],
    "CM1": [
      0.3,
      0.46
    ],
    "CM2": [
      0.5,
      0.48
    ],
    "CM3": [
      0.7,
      0.46
    ],
    "RM": [
      0.92,
      0.42
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "4-5-1 Attack": {
    "ST": [
      0.5,
      0.08
    ],
    "CAM1": [
      0.3,
      0.28
    ],
    "CAM2": [
      0.7,
      0.28
    ],
    "LM": [
      0.08,
      0.44
    ],
    "CM": [
      0.5,
      0.48
    ],
    "RM": [
      0.92,
      0.44
    ],
    "LB": [
      0.08,
      0.74
    ],
    "CB1": [
      0.35,
      0.77
    ],
    "CB2": [
      0.65,
      0.77
    ],
    "RB": [
      0.92,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-1-4-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "LM": [
      0.06,
      0.3
    ],
    "CM1": [
      0.34,
      0.32
    ],
    "CM2": [
      0.66,
      0.32
    ],
    "RM": [
      0.94,
      0.3
    ],
    "CDM": [
      0.5,
      0.46
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.62
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-4-1-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM": [
      0.5,
      0.26
    ],
    "LM": [
      0.08,
      0.44
    ],
    "CM1": [
      0.34,
      0.46
    ],
    "CM2": [
      0.66,
      0.46
    ],
    "RM": [
      0.92,
      0.44
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-4-2-1": {
    "ST": [
      0.5,
      0.08
    ],
    "LF": [
      0.28,
      0.24
    ],
    "RF": [
      0.72,
      0.24
    ],
    "LM": [
      0.08,
      0.44
    ],
    "CM1": [
      0.34,
      0.46
    ],
    "CM2": [
      0.66,
      0.46
    ],
    "RM": [
      0.92,
      0.44
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-4-3 Flat": {
    "LW": [
      0.14,
      0.14
    ],
    "ST": [
      0.5,
      0.08
    ],
    "RW": [
      0.86,
      0.14
    ],
    "LM": [
      0.08,
      0.44
    ],
    "CM1": [
      0.34,
      0.46
    ],
    "CM2": [
      0.66,
      0.46
    ],
    "RM": [
      0.92,
      0.44
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-4-3 Diamond": {
    "LW": [
      0.14,
      0.14
    ],
    "ST": [
      0.5,
      0.08
    ],
    "RW": [
      0.86,
      0.14
    ],
    "CAM": [
      0.5,
      0.25
    ],
    "LM": [
      0.08,
      0.35
    ],
    "RM": [
      0.92,
      0.35
    ],
    "CDM": [
      0.5,
      0.46
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.62
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-5-1-1": {
    "ST": [
      0.5,
      0.08
    ],
    "CF": [
      0.5,
      0.22
    ],
    "LM": [
      0.08,
      0.34
    ],
    "CM1": [
      0.3,
      0.36
    ],
    "CDM": [
      0.5,
      0.48
    ],
    "CM2": [
      0.7,
      0.36
    ],
    "RM": [
      0.92,
      0.34
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.62
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "3-5-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM": [
      0.5,
      0.24
    ],
    "LM": [
      0.08,
      0.44
    ],
    "CDM1": [
      0.28,
      0.46
    ],
    "CDM2": [
      0.72,
      0.46
    ],
    "RM": [
      0.92,
      0.44
    ],
    "CB1": [
      0.22,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.78,
      0.74
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "5-2-1-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CAM": [
      0.5,
      0.26
    ],
    "CM1": [
      0.32,
      0.46
    ],
    "CM2": [
      0.68,
      0.46
    ],
    "LWB": [
      0.06,
      0.66
    ],
    "CB1": [
      0.24,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.76,
      0.74
    ],
    "RWB": [
      0.94,
      0.66
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "5-2-2-1": {
    "LW": [
      0.14,
      0.14
    ],
    "ST": [
      0.5,
      0.08
    ],
    "RW": [
      0.86,
      0.14
    ],
    "CM1": [
      0.32,
      0.46
    ],
    "CM2": [
      0.68,
      0.46
    ],
    "LWB": [
      0.06,
      0.66
    ],
    "CB1": [
      0.24,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.76,
      0.74
    ],
    "RWB": [
      0.94,
      0.66
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "5-3-2": {
    "ST1": [
      0.35,
      0.08
    ],
    "ST2": [
      0.65,
      0.08
    ],
    "CM1": [
      0.22,
      0.38
    ],
    "CM2": [
      0.5,
      0.38
    ],
    "CM3": [
      0.78,
      0.38
    ],
    "LWB": [
      0.06,
      0.66
    ],
    "CB1": [
      0.24,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.76,
      0.74
    ],
    "RWB": [
      0.94,
      0.66
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "5-4-1 Flat": {
    "ST": [
      0.5,
      0.08
    ],
    "LM": [
      0.08,
      0.42
    ],
    "CM1": [
      0.35,
      0.46
    ],
    "CM2": [
      0.65,
      0.46
    ],
    "RM": [
      0.92,
      0.42
    ],
    "LWB": [
      0.06,
      0.66
    ],
    "CB1": [
      0.24,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.76,
      0.74
    ],
    "RWB": [
      0.94,
      0.66
    ],
    "GK": [
      0.5,
      0.95
    ]
  },
  "5-4-1 Defend": {
    "ST": [
      0.5,
      0.08
    ],
    "LM": [
      0.08,
      0.38
    ],
    "RM": [
      0.92,
      0.38
    ],
    "CDM1": [
      0.38,
      0.48
    ],
    "CDM2": [
      0.62,
      0.48
    ],
    "LWB": [
      0.06,
      0.66
    ],
    "CB1": [
      0.24,
      0.74
    ],
    "CB2": [
      0.5,
      0.6
    ],
    "CB3": [
      0.76,
      0.74
    ],
    "RWB": [
      0.94,
      0.66
    ],
    "GK": [
      0.5,
      0.95
    ]
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
  
  // Professional Studio Tools State
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(0.02); // 2% grid interval
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToGuides, setSnapToGuides] = useState(true);
  const [autoSymmetry, setAutoSymmetry] = useState(false);
  const [showCardOutlines, setShowCardOutlines] = useState(true);
  const [activeGuideLines, setActiveGuideLines] = useState([]);
  const [overlapWarnings, setOverlapWarnings] = useState([]);
  
  const pitchRef = useRef(null);

  // Exact 3D Perspective Projection (identical to lineup_generator.py in Discord bot)
  // Maps tactical coordinate [tx, ty] -> Screen Percentage [px, py]
  const project3D = (tx, ty) => {
    const yFactor = Math.pow(Math.max(0.0, Math.min(1.0, ty)), 0.88);
    const screenY = 0.28 + (0.82 - 0.28) * yFactor;
    const tyPow = Math.pow(ty, 0.90);
    const leftX = 0.32 - (0.32 - 0.06) * tyPow;
    const rightX = 0.68 + (0.94 - 0.68) * tyPow;
    const screenX = leftX + Math.max(0.0, Math.min(1.0, tx)) * (rightX - leftX);
    const cardSize = 96 + 46 * Math.pow(ty, 0.85);
    return {
      xPercent: screenX * 100,
      yPercent: screenY * 100,
      cardSize: Math.round(cardSize),
    };
  };

  // Inverse 3D Projection: Converts screen click/drag [sx, sy] back to tactical [tx, ty]
  const unproject3D = (sx, sy) => {
    const yFactor = Math.max(0.0, Math.min(1.0, (sy - 0.28) / (0.82 - 0.28)));
    const ty = Math.pow(yFactor, 1.0 / 0.88);
    const tyPow = Math.pow(Math.max(0.001, ty), 0.90);
    const leftX = 0.32 - (0.32 - 0.06) * tyPow;
    const rightX = 0.68 + (0.94 - 0.68) * tyPow;
    const tx = (sx - leftX) / Math.max(0.01, (rightX - leftX));
    return {
      tx: Math.max(0.05, Math.min(0.95, tx)),
      ty: Math.max(0.06, Math.min(0.96, ty)),
    };
  };

  useEffect(() => {
    fetchFormation(selectedFormation);
  }, [selectedFormation]);

  useEffect(() => {
    checkCollisions(positions);
  }, [positions]);

  const checkCollisions = (posObj) => {
    const warnings = [];
    const entries = Object.entries(posObj);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [p1, [x1, y1]] = entries[i];
        const [p2, [x2, y2]] = entries[j];
        
        // Check true 3D screen pixel distance
        const proj1 = project3D(x1, y1);
        const proj2 = project3D(x2, y2);
        const dx = Math.abs(proj1.xPercent - proj2.xPercent);
        const dy = Math.abs(proj1.yPercent - proj2.yPercent);
        
        // If cards overlap on screen
        if (dx < 5.5 && dy < 8.0) {
          warnings.push({ p1, p2, dx, dy });
        }
      }
    }
    setOverlapWarnings(warnings);
  };

  const fetchFormation = async (name) => {
    try {
      const res = await fetch('/api/formations');
      const data = await res.json();
      if (data.success && data.layouts) {
        const found = data.layouts.find(l => l.name === name);
        if (found && found.positions) {
          let posObj = {};
          if (Array.isArray(found.positions)) {
            found.positions.forEach(item => {
              if (item && item.id) {
                const xVal = item.x > 1 ? item.x / 100 : item.x;
                const yVal = item.y > 1 ? item.y / 100 : item.y;
                posObj[item.id] = [parseFloat(Number(xVal).toFixed(3)), parseFloat(Number(yVal).toFixed(3))];
              }
            });
          } else if (typeof found.positions === 'object') {
            Object.entries(found.positions).forEach(([k, v]) => {
              if (Array.isArray(v) && v.length >= 2) {
                const xVal = v[0] > 1 ? v[0] / 100 : v[0];
                const yVal = v[1] > 1 ? v[1] / 100 : v[1];
                posObj[k] = [parseFloat(Number(xVal).toFixed(3)), parseFloat(Number(yVal).toFixed(3))];
              } else if (typeof v === 'object' && v !== null) {
                const xVal = v.x > 1 ? v.x / 100 : v.x;
                const yVal = v.y > 1 ? v.y / 100 : v.y;
                posObj[k] = [parseFloat(Number(xVal).toFixed(3)), parseFloat(Number(yVal).toFixed(3))];
              }
            });
          }
          if (Object.keys(posObj).length >= 5) {
            setPositions(posObj);
            return;
          }
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
    const screenXFrac = (e.clientX - rect.left) / rect.width;
    const screenYFrac = (e.clientY - rect.top) / rect.height;

    // Convert screen coordinates to tactical coordinates via inverse 3D projection
    const { tx: rawTx, ty: rawTy } = unproject3D(screenXFrac, screenYFrac);

    let finalTx = rawTx;
    let finalTy = rawTy;
    const activeGuides = [];

    // 1. Magnetic Snapping in Tactical Space
    if (snapToGuides) {
      const snapThresholdX = 0.015;
      const snapThresholdY = 0.015;

      if (Math.abs(finalTx - 0.50) < snapThresholdX) {
        finalTx = 0.50;
        const projCenter = project3D(0.50, finalTy);
        activeGuides.push({ type: 'x', pos: projCenter.xPercent / 100, label: 'Center Axis (50%)' });
      }

      Object.entries(positions).forEach(([otherNode, [ox, oy]]) => {
        if (otherNode === activeNode) return;

        if (Math.abs(finalTy - oy) < snapThresholdY) {
          finalTy = oy;
          const projLine = project3D(finalTx, oy);
          activeGuides.push({ type: 'y', pos: projLine.yPercent / 100, label: `${otherNode} Depth` });
        }

        if (Math.abs(finalTx - ox) < snapThresholdX) {
          finalTx = ox;
          const projCol = project3D(ox, finalTy);
          activeGuides.push({ type: 'x', pos: projCol.xPercent / 100, label: `${otherNode} Channel` });
        }
      });
    }

    // 2. Grid Snapping
    if (snapToGrid) {
      finalTx = Math.round(finalTx / gridSize) * gridSize;
      finalTy = Math.round(finalTy / gridSize) * gridSize;
    }

    finalTx = parseFloat(Math.max(0.05, Math.min(0.95, finalTx)).toFixed(3));
    finalTy = parseFloat(Math.max(0.06, Math.min(0.96, finalTy)).toFixed(3));

    setActiveGuideLines(activeGuides);

    setPositions(prev => {
      const updated = { ...prev, [activeNode]: [finalTx, finalTy] };

      // 3. Auto-Symmetry (mirror horizontal wing partner across tactical center 0.50)
      if (autoSymmetry) {
        const partnerMap = {
          'LW': 'RW', 'RW': 'LW',
          'LM': 'RM', 'RM': 'LM',
          'LB': 'RB', 'RB': 'LB',
          'LWB': 'RWB', 'RWB': 'LWB',
          'LF': 'RF', 'RF': 'LF',
          'ST1': 'ST2', 'ST2': 'ST1',
          'CM1': 'CM2', 'CM2': 'CM1',
          'CDM1': 'CDM2', 'CDM2': 'CDM1',
          'CAM1': 'CAM2', 'CAM2': 'CAM1',
          'CB1': 'CB3', 'CB3': 'CB1',
        };
        const partner = partnerMap[activeNode];
        if (partner && updated[partner]) {
          const mirroredX = parseFloat((1.0 - finalTx).toFixed(3));
          updated[partner] = [mirroredX, finalTy];
        }
      }

      return updated;
    });
  };

  const handlePointerUp = () => {
    setActiveNode(null);
    setActiveGuideLines([]);
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

  // Keyboard Nudge Controls
  const nudgeActiveNode = (dx, dy) => {
    if (!activeNode) return;
    setPositions(prev => {
      const current = prev[activeNode] || [0.5, 0.5];
      const newX = parseFloat(Math.max(0.05, Math.min(0.95, current[0] + dx)).toFixed(3));
      const newY = parseFloat(Math.max(0.06, Math.min(0.96, current[1] + dy)).toFixed(3));
      return { ...prev, [activeNode]: [newX, newY] };
    });
  };

  const currentPitchImage = customPitchUrl || selectedTheme.image;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl select-none">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight text-[var(--text-main)]">3D Tactical Studio</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-[var(--border-glass)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 1:1 Discord WYSIWYG
                </span>
              </div>
              <p className="text-sm text-[var(--text-main)] opacity-60 mt-1">
                True 3D pitch perspective matching Discord <code className="bg-[var(--card-bg)]/80 px-1.5 py-0.5 rounded text-[var(--text-main)] opacity-90 font-mono font-bold">/squad view</code> exactly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--card-bg)]/80 hover:bg-[var(--card-bg)] text-xs font-bold text-[var(--text-main)] opacity-90 transition-all border border-[var(--border-glass)] shadow-sm cursor-pointer"
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

          {/* Professional Studio Toolbar */}
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider opacity-60 mr-1">Studio Tools:</span>
              
              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  showGrid
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm'
                    : 'bg-[var(--card-bg)] opacity-60 border-[var(--border-glass)]'
                }`}
              >
                <span>📐 Grid</span>
                <span className="text-[10px] opacity-75">{showGrid ? 'ON' : 'OFF'}</span>
              </button>

              {/* Snap to Grid */}
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  snapToGrid
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-[var(--card-bg)] opacity-60 border-[var(--border-glass)]'
                }`}
              >
                <span>🧲 Snap to Grid</span>
                <span className="text-[10px] opacity-75">{snapToGrid ? 'ON' : 'OFF'}</span>
              </button>

              {/* Magnetic Guides */}
              <button
                onClick={() => setSnapToGuides(!snapToGuides)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  snapToGuides
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-sm'
                    : 'bg-[var(--card-bg)] opacity-60 border-[var(--border-glass)]'
                }`}
              >
                <span>✨ Magnetic Rails</span>
                <span className="text-[10px] opacity-75">{snapToGuides ? 'ON' : 'OFF'}</span>
              </button>

              {/* Auto-Symmetry */}
              <button
                onClick={() => setAutoSymmetry(!autoSymmetry)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  autoSymmetry
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                    : 'bg-[var(--card-bg)] opacity-60 border-[var(--border-glass)]'
                }`}
              >
                <span>🪞 Auto-Mirror</span>
                <span className="text-[10px] opacity-75">{autoSymmetry ? 'ON' : 'OFF'}</span>
              </button>

              {/* Card Footprints */}
              <button
                onClick={() => setShowCardOutlines(!showCardOutlines)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  showCardOutlines
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'bg-[var(--card-bg)] opacity-60 border-[var(--border-glass)]'
                }`}
              >
                <span>🃏 3D Cards</span>
                <span className="text-[10px] opacity-75">{showCardOutlines ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Overlap Status Badge */}
            <div className="flex items-center gap-2">
              {overlapWarnings.length === 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 Collisions (All 11 Clean)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 animate-pulse">
                  ⚠️ {overlapWarnings.length} Card Collisions Detected
                </span>
              )}
            </div>
          </div>

          {/* Theme Selector & Custom Stadium Manager Bar */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--text-main)] opacity-50" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-50">Stadium Themes (15 Total):</span>
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
                <label className="px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--card-bg)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Pitch PNG</span>
                  <input type="file" accept="image/*" onChange={handlePitchUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Stadium Theme Pills */}
            <div className="flex flex-wrap items-center gap-1.5 max-h-[85px] overflow-y-auto pr-1">
              {THEMES.map((theme) => {
                const isActive = !customPitchUrl && selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setCustomPitchUrl(null);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-md border-neutral-900 ring-1 ring-white/30'
                        : 'bg-[var(--card-bg)]/60 hover:bg-[var(--card-bg)] text-[var(--text-main)] opacity-70 border-[var(--border-glass)]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.glow }}></span>
                    <span>{theme.name}</span>
                  </button>
                );
              })}
              {customPitchUrl && (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Custom Upload Active
                </span>
              )}
            </div>
          </div>

          {/* Main Grid: Sidebar Controls & Stadium Pitch Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Formation & Position Node Inspector */}
            <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-50 mb-2">Select Formation ({ALL_FORMATIONS.length} Available)</label>
                  <select
                    value={selectedFormation}
                    onChange={(e) => setSelectedFormation(e.target.value)}
                    className="apple-input font-black text-sm bg-[var(--card-bg)] cursor-pointer"
                  >
                    {ALL_FORMATIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Selected Node Inspector & Precision Micro-Nudge */}
                {activeNode && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-amber-400/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">Selected: {activeNode}</span>
                      <span className="text-[11px] font-mono opacity-80">
                        Tactical X: {positions[activeNode]?.[0]} | Y: {positions[activeNode]?.[1]}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div></div>
                      <button onClick={() => nudgeActiveNode(0, -0.01)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold cursor-pointer">▲</button>
                      <div></div>
                      <button onClick={() => nudgeActiveNode(-0.01, 0)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold cursor-pointer">◀</button>
                      <button onClick={() => nudgeActiveNode(0, 0.01)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold cursor-pointer">▼</button>
                      <button onClick={() => nudgeActiveNode(0.01, 0)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold cursor-pointer">▶</button>
                    </div>
                  </div>
                )}

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-50 mb-2">Tactical Positions ({Object.keys(positions).length})</span>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                    {Object.entries(positions).map(([pos, coords]) => {
                      const isColliding = overlapWarnings.some(w => w.p1 === pos || w.p2 === pos);
                      return (
                        <div
                          key={pos}
                          onClick={() => setActiveNode(pos)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                            activeNode === pos
                              ? 'bg-[var(--card-bg)] text-amber-400 font-bold shadow-md ring-1 ring-amber-400/50'
                              : isColliding
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-[var(--card-bg)]/50 hover:bg-[var(--card-bg)] text-[var(--text-main)] opacity-90 border border-[var(--border-glass)]'
                          }`}
                        >
                          <span className="font-bold flex items-center gap-1.5">
                            {isColliding && <span>⚠️</span>}
                            <span>{pos}</span>
                          </span>
                          <span className="text-[11px] opacity-80">X: {coords[0]} | Y: {coords[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--card-bg)]/5 border border-[var(--border-glass)] text-[11px] text-[var(--text-main)] opacity-60 space-y-1">
                <p className="font-bold text-neutral-800">💡 1:1 Perspective Match:</p>
                <p>Nodes now display at their <strong>exact 3D screen positions</strong> as rendered in Discord! Move any node to live-reposition it on the stadium turf.</p>
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

                {/* Perspective Trapezoid Pitch Turf Visualizer */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Perspective Depth Rails */}
                    {[0.0, 0.25, 0.5, 0.75, 1.0].map((tX, idx) => {
                      const topPt = project3D(tX, 0.06);
                      const botPt = project3D(tX, 0.96);
                      return (
                        <svg key={`rail-${idx}`} className="absolute inset-0 w-full h-full pointer-events-none">
                          <line
                            x1={`${topPt.xPercent}%`}
                            y1={`${topPt.yPercent}%`}
                            x2={`${botPt.xPercent}%`}
                            y2={`${botPt.yPercent}%`}
                            stroke="rgba(0, 240, 255, 0.15)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        </svg>
                      );
                    })}
                    {/* Perspective Horizontal Depth Lines */}
                    {[0.08, 0.25, 0.45, 0.65, 0.77, 0.95].map((tY, idx) => {
                      const leftPt = project3D(0.05, tY);
                      const rightPt = project3D(0.95, tY);
                      return (
                        <svg key={`depth-${idx}`} className="absolute inset-0 w-full h-full pointer-events-none">
                          <line
                            x1={`${leftPt.xPercent}%`}
                            y1={`${leftPt.yPercent}%`}
                            x2={`${rightPt.xPercent}%`}
                            y2={`${rightPt.yPercent}%`}
                            stroke="rgba(0, 240, 255, 0.15)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        </svg>
                      );
                    })}
                  </div>
                )}

                {/* Stadium Center Line & Pitch Markings */}
                <div className="absolute inset-x-12 top-6 bottom-6 border-2 border-white/20 rounded-2xl pointer-events-none">
                  {/* Pitch Center Guide Axis */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-yellow-400/30 -translate-x-1/2"></div>
                  <div className="absolute top-1/2 inset-x-0 h-0.5 bg-[var(--card-bg)]/20 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-44 h-44 rounded-full border-2 border-white/20 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Dynamic Alignment Guide Lines (when dragging / snapping) */}
                {activeGuideLines.map((guide, idx) => {
                  if (guide.type === 'x') {
                    return (
                      <div
                        key={`guide-x-${idx}`}
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_8px_#fbbf24] z-10 pointer-events-none flex flex-col justify-start"
                        style={{ left: `${guide.pos * 100}%` }}
                      >
                        <span className="bg-amber-400 text-black text-[9px] font-black px-1 rounded-sm ml-1 mt-2 whitespace-nowrap">
                          {guide.label}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`guide-y-${idx}`}
                      className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10 pointer-events-none flex items-center justify-end"
                      style={{ top: `${guide.pos * 100}%` }}
                    >
                      <span className="bg-cyan-400 text-black text-[9px] font-black px-1 rounded-sm mr-2 whitespace-nowrap">
                        {guide.label}
                      </span>
                    </div>
                  );
                })}

                {/* Tactical Nodes with 3D Hologram Glow & WYSIWYG Card Footprints */}
                {Object.entries(positions).map(([pos, coords]) => {
                  // Map tactical coordinates to exact 3D projected screen coordinates
                  const { xPercent, yPercent, cardSize } = project3D(coords[0], coords[1]);
                  const isSelected = activeNode === pos;
                  const glowColor = selectedTheme.glow || '#00f0ff';
                  const isColliding = overlapWarnings.some(w => w.p1 === pos || w.p2 === pos);

                  // Projected card dimensions: width = cardSize * 0.72, height = cardSize * 1.05
                  const footW = Math.round(cardSize * 0.72);
                  const footH = Math.round(cardSize * 1.05);

                  return (
                    <div
                      key={pos}
                      onPointerDown={handlePointerDown(pos)}
                      style={{
                        left: `${xPercent}%`,
                        top: `${yPercent}%`,
                        boxShadow: isColliding
                          ? '0 0 25px #ef4444, 0 0 10px #ffffff'
                          : isSelected
                          ? `0 0 25px ${glowColor}, 0 0 10px #ffffff`
                          : `0 8px 20px rgba(0,0,0,0.5), 0 0 12px ${glowColor}66`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
                        isSelected
                          ? 'bg-[var(--input-bg)] text-[var(--text-main)] scale-125 z-30 ring-2 ring-white shadow-2xl'
                          : isColliding
                          ? 'bg-red-950/90 text-red-200 z-25 border border-red-500 animate-pulse'
                          : 'bg-[var(--card-bg)]/90 hover:bg-[var(--card-bg)] text-[var(--text-main)] z-20 border border-white/30 hover:scale-110'
                      }`}
                    >
                      {/* 3D Card Projected Footprint (Stoppers & Boundary visualizer) */}
                      {showCardOutlines && (
                        <div
                          className="absolute pointer-events-none rounded-lg border border-dashed transition-all"
                          style={{
                            width: `${footW}px`,
                            height: `${footH}px`,
                            borderColor: isColliding ? '#ef4444' : `${glowColor}88`,
                            backgroundColor: isColliding ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                            transform: 'translateY(-6px)',
                          }}
                        />
                      )}

                      {/* Positional 3D Base Hologram Line */}
                      <div
                        className="absolute -bottom-2 w-10 h-1.5 rounded-full blur-[1px]"
                        style={{ backgroundColor: isColliding ? '#ef4444' : glowColor }}
                      ></div>
                      <span className="text-xs font-black tracking-wider leading-none drop-shadow">
                        {pos}
                      </span>
                      <span className="text-[8px] font-bold opacity-90 mt-0.5">
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