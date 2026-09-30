'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, X } from 'lucide-react';

export default function DateTimePicker({
  value,
  onChange,
  label = "Select Date & Time",
  helperText = "UTC timezone",
  presets = [
    { label: "Now", hours: 0 },
    { label: "+1 Day", hours: 24 },
    { label: "+3 Days", hours: 72 },
    { label: "+7 Days", hours: 168 },
    { label: "+14 Days", hours: 336 },
    { label: "+30 Days", hours: 720 },
  ],
  allowClear = true
}) {
  const [internalValue, setInternalValue] = useState('');

  useEffect(() => {
    if (value) {
      try {
        const dt = new Date(value);
        if (!isNaN(dt.getTime())) {
          // Format as YYYY-MM-DDTHH:mm for datetime-local
          const pad = (n) => String(n).padStart(2, '0');
          const str = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
          setInternalValue(str);
          return;
        }
      } catch (e) {}
    }
    setInternalValue('');
  }, [value]);

  const handleApplyPreset = (hoursOffset) => {
    const now = new Date();
    now.setHours(now.getHours() + hoursOffset);
    onChange(now.toISOString());
  };

  const handleDateChange = (e) => {
    const v = e.target.value;
    setInternalValue(v);
    if (!v) {
      onChange(null);
      return;
    }
    try {
      const dt = new Date(v);
      if (!isNaN(dt.getTime())) {
        onChange(dt.toISOString());
      }
    } catch (err) {}
  };

  const formatDisplay = (val) => {
    if (!val) return 'No date set (Inactive / Unlimited)';
    try {
      const dt = new Date(val);
      if (isNaN(dt.getTime())) return val;
      return dt.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return val;
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          {label}
        </label>
        {helperText && (
          <span className="text-[11px] text-fuchsia-400 font-mono">
            {helperText}
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-purple-900/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="datetime-local"
              value={internalValue}
              onChange={handleDateChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-100 text-sm focus:outline-none focus:border-fuchsia-500 font-mono"
            />
          </div>

          {allowClear && value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-purple-900/30 transition-colors"
              title="Clear date"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Shortcut Presets */}
        <div className="pt-2 border-t border-purple-900/20 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mr-1">
            Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset.hours)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-fuchsia-500/20 text-neutral-300 hover:text-fuchsia-300 border border-purple-900/30 hover:border-fuchsia-500/40 transition-colors font-semibold text-[11px]"
            >
              {preset.label}
            </button>
          ))}
          {allowClear && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-purple-900/30 transition-colors font-semibold text-[11px]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Formatted Date String */}
        <div className="text-[11px] text-fuchsia-300/80 font-mono flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-fuchsia-400" />
          <span>Selected: {formatDisplay(value)}</span>
        </div>
      </div>
    </div>
  );
}
