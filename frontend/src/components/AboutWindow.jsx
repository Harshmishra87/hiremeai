import { CANDIDATE } from '../data/constants'

export default function AboutWindow() {
  return (
    <div className="p-8 h-full flex flex-col items-center text-center justify-center gap-3">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue shadow-glow flex items-center justify-center text-2xl font-display font-bold text-white">
        {CANDIDATE.name.split(' ').map((n) => n[0]).join('')}
      </div>
      <h2 className="text-lg font-display font-semibold">{CANDIDATE.name}</h2>
      <p className="text-sm text-accent-cyan">{CANDIDATE.role}</p>
      <p className="text-sm text-ink-secondary max-w-sm leading-relaxed">{CANDIDATE.tagline}</p>
      <p className="text-xs text-ink-muted font-mono mt-2">HarshOS · Version 1.0</p>
    </div>
  )
}
