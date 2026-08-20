import { FINDER_ICONS } from "../data/apps";

export default function FinderWindow({ onOpenApp }) {
  return (
    <div className="p-6 h-full">
      <h2 className="text-lg font-display font-semibold mb-1">Finder</h2>
      <p className="text-sm text-ink-secondary mb-5">
        Jump to any part of HarshOS.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {FINDER_ICONS.map((icon) => (
          <button
            key={icon.id}
            onClick={() => onOpenApp?.(icon.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl glass-surface hover:bg-white/12 transition"
          >
            <icon.icon
              size={28}
              weight="duotone"
              className="text-accent-cyan"
              aria-hidden="true"
            />
            <span className="text-xs text-ink-secondary">{icon.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
