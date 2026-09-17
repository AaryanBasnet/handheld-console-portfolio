import { useEffect, useState, type RefObject } from 'react'

const DEPTH = 30
/** corner radii of the shell: three small corners and the big bottom-right one */
const R = 26
const RB = 72
/** wall segments per corner arc: enough that the curve reads as round */
const ARC_STEPS = 8
const BIG_ARC_STEPS = 14

interface Props {
  /** element whose --tx/--ty variables drive rotation */
  tiltRef: RefObject<HTMLDivElement | null>
  /** element to measure for the box size */
  faceRef: RefObject<HTMLDivElement | null>
}

interface Pt {
  x: number
  y: number
}

/** The shell outline, clockwise from the top edge, as a polyline. */
function outline(w: number, h: number): Pt[] {
  const pts: Pt[] = []
  const arc = (cx: number, cy: number, r: number, from: number, to: number, steps: number) => {
    for (let i = 1; i <= steps; i++) {
      const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
    }
  }
  pts.push({ x: R, y: 0 })
  pts.push({ x: w - R, y: 0 })
  arc(w - R, R, R, -90, 0, ARC_STEPS)
  pts.push({ x: w, y: h - RB })
  arc(w - RB, h - RB, RB, 0, 90, BIG_ARC_STEPS)
  pts.push({ x: R, y: h })
  arc(R, h - R, R, 90, 180, ARC_STEPS)
  pts.push({ x: 0, y: R })
  arc(R, R, R, 180, 270, ARC_STEPS)
  return pts
}

/**
 * 3D view. The device gets thickness from a wall of short segments that
 * follow the shell's rounded outline, so the corners stay round; pointer
 * drag rotates it. Only CSS transforms: no WebGL, no model files. The screen
 * stays live DOM.
 */
export default function View3D({ tiltRef, faceRef }: Props) {
  const [size, setSize] = useState({ w: 380, h: 622 })

  useEffect(() => {
    const el = faceRef.current
    if (!el) return
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [faceRef])

  useEffect(() => {
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty('--depth', `${DEPTH}px`)
    let rx = 0
    let ry = 0
    let dragging = false
    let lx = 0
    let ly = 0
    const apply = () => {
      el.style.setProperty('--tx', `${rx}deg`)
      el.style.setProperty('--ty', `${ry}deg`)
    }
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      // don't hijack buttons, inputs or the shelf
      if (t.closest('button, input, a, [role=dialog], aside')) return
      dragging = true
      lx = e.clientX
      ly = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      ry += (e.clientX - lx) * 0.35
      rx -= (e.clientY - ly) * 0.35
      rx = Math.max(-60, Math.min(60, rx))
      lx = e.clientX
      ly = e.clientY
      apply()
    }
    const up = () => {
      dragging = false
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
        rx = 0
        ry = 0
        apply()
      }
    }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('keydown', key)
    apply()
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('keydown', key)
      el.style.setProperty('--depth', '0px')
      el.style.setProperty('--tx', '0deg')
      el.style.setProperty('--ty', '0deg')
    }
  }, [tiltRef])

  const pts = outline(size.w, size.h)

  return (
    <>
      {pts.map((p, i) => {
        const q = pts[(i + 1) % pts.length]
        const dx = q.x - p.x
        const dy = q.y - p.y
        const len = Math.hypot(dx, dy)
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI
        // each segment stands on the outline: slide to its start, turn along
        // the edge, then fold down into depth, centred on the face plane
        return (
          <div
            key={i}
            className="absolute left-0 top-0"
            aria-hidden="true"
            style={{
              width: len + 1,
              height: DEPTH,
              transformOrigin: '0 0',
              transform: `translate(${p.x}px, ${p.y}px) rotateZ(${deg}deg) rotateX(90deg) translateY(-50%)`,
              background: 'var(--shell-dark)',
              borderTop: '3px solid #111111',
              borderBottom: '3px solid #111111',
              boxSizing: 'border-box',
            }}
          >
            {/* the first segment is the top edge: it carries the slot slit */}
            {i === 0 && <div className="absolute left-1/2 top-1/2 h-[10px] w-[196px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#1a1a1a]" />}
          </div>
        )
      })}
    </>
  )
}
