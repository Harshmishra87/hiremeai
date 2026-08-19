const ITEMS = [
  { id: 1, label: 'Smart Farming AI — dashboard', h: 180, emoji: '🌾' },
  { id: 2, label: 'Hackathon finals — team photo', h: 240, emoji: '🏆' },
  { id: 3, label: 'Vera AI — chat interface', h: 150, emoji: '🤖' },
  { id: 4, label: 'ML Specialization — certificate', h: 200, emoji: '📜' },
  { id: 5, label: 'Nirnay — results screen', h: 170, emoji: '🗳️' },
  { id: 6, label: 'Campus Innovation Challenge — award', h: 220, emoji: '🥇' },
  { id: 7, label: 'Agri Calculator — mobile view', h: 190, emoji: '📱' },
  { id: 8, label: 'Whiteboarding session', h: 160, emoji: '🧠' },
]

export default function GalleryWindow() {
  return (
    <div className="p-6 h-full os-scroll overflow-y-auto">
      <h2 className="text-xl font-display font-semibold mb-1">Gallery</h2>
      <p className="text-sm text-ink-secondary mb-5">
        Screenshots, hackathon photos, and certificates.
      </p>
      <div className="columns-2 sm:columns-3 gap-3 [column-fill:_balance]">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            style={{ height: item.h }}
            className="mb-3 break-inside-avoid rounded-xl glass-surface flex flex-col items-center justify-center gap-2 p-3 text-center"
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-[11px] text-ink-secondary leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
