import { useEffect, useState } from "react";
import { Wifi, BatteryFull } from "lucide-react";

const MENU_ITEMS = ["About", "Projects", "Contact", "Resume"];

export default function TopBar({ onMenuClick }) {
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
    <div className="fixed top-0 left-0 right-0 z-50 h-9 px-4 flex items-center justify-between glass-panel border-b border-white/10 text-sm text-ink-primary select-none">
      <div className="flex items-center gap-5">
        <button
          className="font-display font-semibold tracking-tight hover:opacity-80 transition focus-ring rounded"
          onClick={() => onMenuClick?.("about")}
        >
          🍎 HarshOS
        </button>
        <nav className="hidden sm:flex items-center gap-4 text-ink-secondary">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => onMenuClick?.(item.toLowerCase())}
              className="hover:text-ink-primary transition focus-ring rounded px-1"
            >
              {item}
            </button>
          ))}
        </nav>
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
