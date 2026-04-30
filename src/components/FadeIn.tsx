import { useEffect, useState } from 'react'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
  style?: React.CSSProperties
}

export function FadeIn({ children, delay = 0, duration = 800, className = '', style }: FadeInProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className={className}
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${duration}ms ease`, ...style }}
    >
      {children}
    </div>
  )
}
