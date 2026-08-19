import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme !== 'light'
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="p-1 rounded-full hover:bg-white/10 transition focus-ring"
      title={isDark ? 'Switch to light accents' : 'Switch to dark accents'}
    >
      {isDark ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  )
}
