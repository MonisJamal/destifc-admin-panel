'use client';
import { Loader2 } from 'lucide-react';

export default function LiquidButton({ 
  text, 
  children,
  onClick, 
  type = "button", 
  disabled = false, 
  loading = false,
  className = "",
  size = "md", // "sm" | "md" | "lg"
  variant = "primary" // "primary" | "secondary" | "danger"
}) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-6 py-2.5 text-sm rounded-xl",
    lg: "px-8 py-3.5 text-base rounded-2xl"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 hover:from-pink-500 hover:via-fuchsia-500 hover:to-purple-500 text-[var(--text-main)] shadow-lg shadow-fuchsia-600/30 hover:shadow-fuchsia-500/40 border border-fuchsia-400/30",
    secondary: "bg-[var(--card-bg)]/80 hover:bg-[var(--card-bg)] text-[var(--text-main)] opacity-90 border border-purple-900/40 hover:border-purple-700",
    danger: "bg-red-600/80 hover:bg-red-600 text-[var(--text-main)] border border-red-500/30 shadow-lg shadow-red-600/20"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2.5 font-bold tracking-wide transition-all duration-200
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{typeof text === 'string' ? 'Processing...' : (children || 'Processing...')}</span>
        </>
      ) : (
        <>
          {children || text || "Submit"}
        </>
      )}
    </button>
  );
}
