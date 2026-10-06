'use client';
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';

export default function ImageUpload({ 
  value, 
  onChange, 
  label = "Upload Image", 
  helperText = "Supports high quality .png, .webp, or .jpg (transparency supported)",
  aspectRatio = "square", // "square" | "banner"
  maxDimension = 500
}) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.png, .webp, or .jpg).');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let maxD = aspectRatio === "banner" ? 700 : 450;
        let w = img.width;
        let h = img.height;
        if (w > maxD || h > maxD) {
          if (w > h) {
            h = Math.round((h * maxD) / w);
            w = maxD;
          } else {
            w = Math.round((w * maxD) / h);
            h = maxD;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, w, h);

        // Export as optimized webp with transparency preserved (<200KB per image)
        const dataUrl = canvas.toDataURL('image/webp', 0.65);
        onChange(dataUrl);
        setProcessing(false);
      };
      img.onerror = () => {
        setProcessing(false);
        alert('Failed to process image file.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isBanner = aspectRatio === 'banner';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-[var(--text-main)] opacity-90 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative rounded-2xl border border-purple-900/40 bg-[var(--input-bg)]/80 p-3 flex items-center gap-4 group">
          <div className={`relative overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] flex items-center justify-center shrink-0 ${
            isBanner ? 'w-48 h-20' : 'w-20 h-20'
          }`}>
            <img 
              src={value} 
              alt="Uploaded Preview" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-300 mb-1">
              <Check className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Image Uploaded (.png / .webp)</span>
            </div>
            <p className="text-[11px] text-[var(--text-main)] opacity-70 truncate font-mono">
              {value.startsWith('data:') ? 'High-Definition Data URI (Ready)' : value}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
              >
                Replace Image
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-5 flex flex-col items-center justify-center text-center group ${
            dragActive
              ? 'border-fuchsia-500 bg-fuchsia-500/10'
              : 'border-purple-900/40 hover:border-fuchsia-500/60 bg-[var(--input-bg)]/60 hover:bg-[var(--input-bg)]/90'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/webp, image/jpeg, image/jpg"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            {processing ? (
              <div className="w-5 h-5 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <p className="text-xs font-bold text-[var(--text-main)] opacity-90 group-hover:text-fuchsia-300 transition-colors">
            {processing ? 'Processing Image...' : 'Click to Upload or Drag & Drop'}
          </p>
          <p className="text-[11px] text-[var(--text-main)] opacity-70 mt-0.5">
            {helperText}
          </p>
        </div>
      )}
    </div>
  );
}
