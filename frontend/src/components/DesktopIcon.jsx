export default function DesktopIcon({
  icon,
  asset,
  label,
  selected,
  onSelect,
  onOpen,
}) {
  const Icon = icon;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
    onOpen();
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl select-none touch-manipulation transition-colors focus-ring w-[84px]
        ${selected ? "bg-white/15 ring-1 ring-white/25" : "hover:bg-white/8"}`}
    >
      {asset ? (
        <svg
          width="52"
          height="52"
          viewBox="0 0 128 128"
          className="drop-shadow-lg"
          aria-hidden="true"
        >
          <use href={`/desktop-app-icons.svg#${asset}`} />
        </svg>
      ) : (
        <Icon
          size={32}
          weight="duotone"
          className="text-accent-cyan drop-shadow-lg"
          aria-hidden="true"
        />
      )}
      <span className="text-[11px] text-center text-ink-primary/90 leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
        {label}
      </span>
    </button>
  );
}
