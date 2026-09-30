'use client';

export default function LiquidButton({ text = "Submit", onClick, type = "button", disabled = false, width = "220px", height = "60px" }) {
  return (
    <div className="fx-layer inline-block">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="box start-btn border-none bg-transparent outline-none cursor-pointer"
        style={{ '--w': width, '--h': height, '--tr': '18%' }}
      >
        <span className="text">{text}</span>
        <div className="btn-icon">
          <svg viewBox="0 0 1024 1024" className="w-3.5 h-3.5 fill-white">
            <path d="M779.18 473.23L322.35 16.41c-21.41-21.41-56.12-21.41-77.53 0s-21.41 56.12 0 77.53l418.06 418.06L244.82 930.06c-21.41 21.41-21.41 56.12 0 77.53 10.71 10.71 24.76 16.06 38.77 16.06s28.06-5.35 38.77-16.06l456.82-456.82c21.41-21.41 21.41-56.12 0-77.54z" />
          </svg>
        </div>
        <div className="circle-overlay"></div>
      </button>
    </div>
  );
}
