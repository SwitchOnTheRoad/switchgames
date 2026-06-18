import { useEffect, useRef, useState } from 'react'

interface Props {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
  as?: keyof JSX.IntrinsicElements
}

export default function SectionReveal({ children, className = '', style, delay = 0, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const Component = Tag as any

  return (
    <Component
      ref={ref as any}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Component>
  )
}
