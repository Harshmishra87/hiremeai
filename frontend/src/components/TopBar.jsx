import { useEffect, useState } from "react";
import { Wifi, BatteryFull } from "lucide-react";

export default function TopBar({ onAboutClick }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      data-window-header
      className="fixed top-0 left-0 right-0 z-50 h-9 px-4 flex items-center justify-between glass-panel border-b border-white/10 text-sm text-ink-primary select-none"
    >
      <div className="flex items-center gap-5">
        <button
          className="font-display font-semibold tracking-tight hover:opacity-80 transition focus-ring rounded"
          onClick={() => onAboutClick?.()}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg
              width="17"
              height="17"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4v12M16 4v12M4 10h5.5L16 4M9.5 10 16 16"
                stroke="url(#harshos-mark)"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="4" cy="4" r="1.2" fill="#5ce1e6" />
              <circle cx="16" cy="4" r="1.2" fill="#b28cff" />
              <circle cx="16" cy="16" r="1.2" fill="#5ce1e6" />
              <defs>
                <linearGradient id="harshos-mark" x1="4" y1="16" x2="16" y2="4">
                  <stop stopColor="#5ce1e6" />
                  <stop offset="1" stopColor="#b28cff" />
                </linearGradient>
              </defs>
            </svg>
            HarshOS
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-ink-secondary">
        <Wifi size={15} strokeWidth={2} />
        <BatteryFull size={17} strokeWidth={2} />
        <span className="font-mono text-xs whitespace-nowrap hidden xs:inline">
          {dateStr}
        </span>
        <span className="font-mono text-xs tabular-nums">{timeStr}</span>
      </div>
    </div>
  );
}
