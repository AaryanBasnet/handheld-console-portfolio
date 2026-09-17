import { useEffect } from 'react'
import type { Button } from '../device/deviceReducer'

const keyMap: Record<string, Button> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  z: 'a',
  Z: 'a',
  x: 'b',
  X: 'b',
  Enter: 'start',
  Shift: 'select',
}

/** physical-key fallback so layouts and synthetic events still map */
const codeMap: Record<string, Button> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyZ: 'a',
  KeyX: 'b',
  Enter: 'start',
  NumpadEnter: 'start',
  ShiftLeft: 'select',
  ShiftRight: 'select',
}

const isDpad = (b: Button) => b === 'up' || b === 'down' || b === 'left' || b === 'right'

/** Arrows, Z = A, X = B, Enter = Start, Shift = Select. */
export function useKeyboard(press: (b: Button) => void, onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.key === 'Escape') {
        onEscape()
        return
      }
      const b = keyMap[e.key] ?? codeMap[e.code]
      if (!b) return
      if (e.repeat && !isDpad(b)) return
      // Enter on a keyboard-focused button or link activates that element instead.
      if (b === 'start' && target && (target.tagName === 'BUTTON' || target.tagName === 'A') && target.matches(':focus-visible')) return
      e.preventDefault()
      press(b)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press, onEscape, enabled])
}
