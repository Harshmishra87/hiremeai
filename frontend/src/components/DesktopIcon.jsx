import { useRef } from "react";

export default function DesktopIcon({
  icon,
  label,
  selected,
  onSelect,
  onOpen,
}) {
  const clickTimer = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onOpen();
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
      }, 280);
    }
  };

  return (
    <button
      data-cursor="magnetic"
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl select-none transition-colors focus-ring w-[84px]
        ${selected ? "bg-white/15 ring-1 ring-white/25" : "hover:bg-white/8"}`}
    >
      <div className="text-3xl drop-shadow-lg leading-none">{icon}</div>
      <span className="text-[11px] text-center text-ink-primary/90 leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
        {label}
      </span>
    </button>
  );
}
