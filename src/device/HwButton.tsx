import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useDevice } from './DeviceProvider'
import type { Button } from './deviceReducer'

interface Props {
  button: Button
  label: string
  className?: string
  children?: ReactNode
  /** hold to repeat (d-pad) */
  repeat?: boolean
  onPressedChange?: (pressed: boolean) => void
  style?: CSSProperties
}

/** A physical button. Fires on pointer down (not click) so it feels immediate. */
export function HwButton({ button, label, className = '', children, repeat, onPressedChange, style }: Props) {
  const { press } = useDevice()
  const [pressed, setPressed] = useState(false)
  const timer = useRef<number | null>(null)
  const interval = useRef<number | null>(null)

  const stopRepeat = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    if (interval.current) window.clearInterval(interval.current)
    timer.current = null
    interval.current = null
  }, [])

  const down = useCallback(() => {
    setPressed(true)
    onPressedChange?.(true)
    press(button)
    if (repeat) {
      timer.current = window.setTimeout(() => {
        interval.current = window.setInterval(() => press(button), 140)
      }, 360)
    }
  }, [button, press, repeat, onPressedChange])

  const up = useCallback(() => {
    setPressed(false)
    onPressedChange?.(false)
    stopRepeat()
  }, [stopRepeat, onPressedChange])

  useEffect(() => stopRepeat, [stopRepeat])

  return (
    <button
      type="button"
      data-hw="true"
      aria-label={label}
      data-pressed={pressed}
      className={`btn-hw ${className}`}
      style={style}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return
        e.preventDefault()
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          /* synthetic or already-released pointer */
        }
        down()
      }}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!e.repeat) press(button)
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  )
}
