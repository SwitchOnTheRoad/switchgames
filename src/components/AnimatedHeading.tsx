import { useEffect, useState } from 'react'

interface Props {
  text: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  style?: React.CSSProperties
  delay?: number
  charDelay?: number
}

export default function AnimatedHeading({
  text,
  as: Tag = 'h1',
  className = '',
  style,
  delay = 200,
  charDelay = 32,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const lines = text.split('\n')
  let charCount = 0

  return (
    <Tag className={className} style={style}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {[...line].map((char, ci) => {
            const idx = charCount++
            return (
              <span
                key={ci}
                style={{
                  display: 'inline-block',
                  transition: 'all 500ms cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${delay + idx * charDelay}ms`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-18px)',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}
