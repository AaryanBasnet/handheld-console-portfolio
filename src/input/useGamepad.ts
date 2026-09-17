import { useEffect, useRef } from 'react'
import type { Button } from '../device/deviceReducer'

/** Standard mapping: 12-15 d-pad, 0 = A, 1 = B, 9 = Start, 8 = Select. Left stick doubles as d-pad. */
const buttonMap: Record<number, Button> = { 12: 'up', 13: 'down', 14: 'left', 15: 'right', 0: 'a', 1: 'b', 9: 'start', 8: 'select' }

export function useGamepad(press: (b: Button) => void, onFirstUse: () => void, enabled = true) {
  const prev = useRef<Set<Button>>(new Set())
  const used = useRef(false)

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('getGamepads' in navigator)) return
    let raf = 0
    let connected = 0

    const poll = () => {
      const pads = navigator.getGamepads()
      const held = new Set<Button>()
      for (const pad of pads) {
        if (!pad) continue
        pad.buttons.forEach((btn, i) => {
          const b = buttonMap[i]
          if (b && btn.pressed) held.add(b)
        })
        const [x, y] = pad.axes
        if (x < -0.5) held.add('left')
        if (x > 0.5) held.add('right')
        if (y < -0.5) held.add('up')
        if (y > 0.5) held.add('down')
      }
      for (const b of held) {
        if (!prev.current.has(b)) {
          if (!used.current) {
            used.current = true
            onFirstUse()
          }
          press(b)
        }
      }
      prev.current = held
      if (connected > 0) raf = requestAnimationFrame(poll)
    }

    const onConnect = () => {
      connected++
      if (connected === 1) raf = requestAnimationFrame(poll)
    }
    const onDisconnect = () => {
      connected = Math.max(0, connected - 1)
      if (connected === 0) cancelAnimationFrame(raf)
    }
    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)
    // a pad may already be connected before the listener was attached
    if (Array.from(navigator.getGamepads()).some(Boolean)) onConnect()
    return () => {
      window.removeEventListener('gamepadconnected', onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconnect)
      cancelAnimationFrame(raf)
    }
  }, [press, onFirstUse, enabled])
}
