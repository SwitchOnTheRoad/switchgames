import { useMemo } from 'react'
import {
  Gamepad2,
  Monitor,
  Mouse,
  Keyboard,
  Trophy,
  Rocket,
  Star,
  Dice5,
  Zap,
  Headphones,
  Target,
  Swords,
  Crown,
  Joystick,
  Cpu,
  Wifi,
} from 'lucide-react'

const ICONS = [
  Gamepad2,
  Monitor,
  Mouse,
  Keyboard,
  Trophy,
  Rocket,
  Star,
  Dice5,
  Zap,
  Headphones,
  Target,
  Swords,
  Crown,
  Joystick,
  Cpu,
  Wifi,
]

type Cell = {
  id: number
  left: string
  top: string
  size: number
  opacity: number
  rot: number
  delay: number
  duration: number
  iconIndex: number
}

function generateCells(count: number): Cell[] {
  const aspectRatio = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 2
  const cols = Math.ceil(Math.sqrt(count * aspectRatio))
  const rows = Math.ceil(count / cols)
  const cellW = 100 / cols
  const cellH = 100 / rows
  const cells: Cell[] = []
  let id = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (id >= count) break
      const jitterX = (Math.random() - 0.5) * cellW * 0.5
      const jitterY = (Math.random() - 0.5) * cellH * 0.5
      cells.push({
        id: id++,
        left: `${c * cellW + cellW / 2 + jitterX}%`,
        top: `${r * cellH + cellH / 2 + jitterY}%`,
        size: 20 + Math.random() * 18,
        opacity: 0.035 + Math.random() * 0.055,
        rot: (Math.random() - 0.5) * 30,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        iconIndex: Math.floor(Math.random() * ICONS.length),
      })
    }
  }

  return cells
}

export default function GamingBackground() {
  const cells = useMemo(() => generateCells(80), [])

  return (
    <div className="gaming-bg-grid" aria-hidden="true">
      {cells.map(cell => {
        const Icon = ICONS[cell.iconIndex]
        return (
          <div
            key={cell.id}
            className="icon-cell"
            style={{
              left: cell.left,
              top: cell.top,
              width: cell.size,
              height: cell.size,
              opacity: cell.opacity,
              animationDelay: `${cell.delay}s`,
              animationDuration: `${cell.duration}s`,
              transform: `rotate(${cell.rot}deg)`,
              '--rot': `${cell.rot}deg`,
            } as React.CSSProperties}
          >
            <Icon size={cell.size} strokeWidth={1.5} />
          </div>
        )
      })}
    </div>
  )
}
