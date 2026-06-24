import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatFn?: (n: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 0.8,
  formatFn,
  className = ''
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayValue(v)
    })

    prevValue.current = value
    return () => controls.stop()
  }, [value, duration])

  const formatted = formatFn ? formatFn(displayValue) : Math.round(displayValue).toString()

  return <span className={className}>{formatted}</span>
}
