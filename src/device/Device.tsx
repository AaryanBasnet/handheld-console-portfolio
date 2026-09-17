import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useDevice } from './DeviceProvider'
import { useHandheldLayout } from '../hooks/useMediaQuery'
import { Front } from './Front'
import { Back } from './Back'
import { Shelf } from './Shelf'
import { Manual } from './Manual'
import { GameCases, Mug, Pencil, QuickStartCard, StickyNote } from './DeskProps'

/** Loaded only when the 3D toggle is switched on. */
const View3D = lazy(() => import('./View3D'))

/**
 * Scale the desk down so the whole mat fits the window height. Uses CSS zoom,
 * not a transform, so hit-testing, the 3D view and the booklet keep working.
 * Only ever shrinks, and never below MIN_ZOOM so the screen stays readable.
 */
const MIN_ZOOM = 0.68
const FIT_MARGIN = 48
function useFitZoom(ref: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let current = 1
    const fit = () => {
      const natural = el.getBoundingClientRect().height / current
      const next = Math.max(MIN_ZOOM, Math.min(1, (window.innerHeight - FIT_MARGIN) / natural))
      const rounded = Math.round(next * 1000) / 1000
      if (rounded !== current) {
        current = rounded
        setZoom(rounded)
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [ref, enabled])
  return zoom
}

/**
 * Phones: the console and shelf are the desktop pieces, scaled with CSS zoom
 * to the width available inside the mat. Never scaled up past 1.
 */
function useWidthZoom(designWidth: number, enabled: boolean) {
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    if (!enabled) return
    const fit = () => setZoom(Math.round(Math.min(1, (window.innerWidth - 56) / designWidth) * 1000) / 1000)
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [designWidth, enabled])
  return zoom
}

function useJolt(trigger: string | null, enabled: boolean) {
  const [jolt, setJolt] = useState(false)
  useEffect(() => {
    if (!trigger || !enabled) return
    setJolt(true)
    const t = window.setTimeout(() => setJolt(false), 180)
    return () => window.clearTimeout(t)
  }, [trigger, enabled])
  return jolt
}

/** Desk + device + shelf on desktop; the phone becomes the device on mobile. */
export function Device() {
  const handheld = useHandheldLayout()
  const { state, reducedMotion, announcement } = useDevice()
  const flipped = state.page.kind === 'colophon'
  const tiltRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLDivElement>(null)
  const jolt = useJolt(state.cart.inserted, !reducedMotion)
  const [view3d, setView3d] = useState(false)
  const matRef = useRef<HTMLDivElement>(null)
  const zoom = useFitZoom(matRef, !handheld)
  // the device is 380 wide plus the wheels and link port that stick out of it
  const phoneZoom = useWidthZoom(410, handheld)

  // the toggle only shows while powered on; exiting power also exits 3D mode
  // so there's never a hidden control with no way to turn it back off
  useEffect(() => {
    if (state.power === 'off') setView3d(false)
  }, [state.power])

  // Tilt toward the pointer. Written straight to CSS variables, no re-render.
  useEffect(() => {
    const el = tiltRef.current
    if (!el || handheld || reducedMotion || view3d) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        el.style.setProperty('--ty', `${((e.clientX - cx) / cx) * 5}deg`)
        el.style.setProperty('--tx', `${(-(e.clientY - cy) / cy) * 5}deg`)
      })
    }
    const reset = () => {
      el.style.setProperty('--tx', '0deg')
      el.style.setProperty('--ty', '0deg')
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', reset)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', reset)
    }
  }, [handheld, reducedMotion, view3d])

  const flipStyle = { transform: `rotateY(${flipped ? 180 : 0}deg)` }

  if (handheld) {
    return (
      <div className="desk desk-lit min-h-dvh px-3 pb-6 pt-4">
        <div className="desk-mat mx-auto flex max-w-[560px] flex-col items-center gap-6 px-3 pb-6 pt-3">
          <div className="relative z-10" style={{ zoom: phoneZoom, paddingTop: 80 }}>
            <div className="desk-shadow" aria-hidden="true" />
            <div style={{ perspective: 1200 }}>
              <div className="device-3d relative transition-transform duration-700" style={flipStyle}>
                <div className={`device-face ${jolt ? 'jolt' : ''}`} inert={flipped}>
                  <Front />
                </div>
                <div className="device-face absolute inset-0" style={{ transform: 'rotateY(180deg)' }}>
                  <Back />
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex w-[300px] shrink-0 flex-col gap-5">
            <div className="desk-shadow" aria-hidden="true" />
            <Shelf />
            <GameCases />
          </div>
          <Link to="/plain" className="focus-ring font-mono text-[12px] underline decoration-2 underline-offset-2">
            Just show me the work →
          </Link>
        </div>
        <Manual handheld />
        <div className="sr-only-live" role="status" aria-live="polite">
          {announcement}
        </div>
      </div>
    )
  }

  return (
    <div className="desk desk-lit relative min-h-dvh">
      <Link to="/plain" className="focus-ring absolute left-5 top-4 z-30 font-mono text-xs underline decoration-2 underline-offset-2">
        Just show me the work →
      </Link>

      <div className="flex min-h-dvh items-center justify-center px-6 py-6">
        <div ref={matRef} className="desk-mat relative flex items-start gap-14 pb-10 pl-12 pr-12 pt-12 xl:pr-28" style={{ zoom }}>
          {/* props live in the mat's margins and only on desks wide enough for them */}
          <StickyNote className="absolute -top-7 left-10 z-20 hidden xl:block" />
          <Mug className="absolute right-5 top-8 z-20 hidden xl:block" />
          <Pencil className="absolute bottom-4 right-24 z-20 hidden -rotate-6 xl:block" />

        {/* pinned to the device's own width: the 3D side faces and the manual
            booklet measure this box, and the quick-start card sits beneath it */}
        <div className="relative z-10" style={{ width: 380 }}>
          <div className="desk-shadow" aria-hidden="true" />
          <div ref={tiltRef} style={{ perspective: 1400 }}>
            <div
              className={`device-3d ${view3d ? '' : 'transition-transform duration-150 ease-out'}`}
              style={{ transform: 'rotateX(var(--tx, 0deg)) rotateY(var(--ty, 0deg))' }}
            >
              <div className={`device-3d ${jolt ? 'jolt' : ''}`}>
                <div ref={faceRef} className="device-3d relative transition-transform duration-700" style={flipStyle}>
                  <div className="device-face" style={{ transform: 'translateZ(calc(var(--depth, 0px) / 2))' }} inert={flipped}>
                    <Front />
                  </div>
                  <div className="device-face absolute inset-0" style={{ transform: 'rotateY(180deg) translateZ(calc(var(--depth, 0px) / 2))' }}>
                    <Back />
                  </div>
                  {view3d && (
                    <Suspense fallback={null}>
                      <View3D tiltRef={tiltRef} faceRef={faceRef} />
                    </Suspense>
                  )}
                </div>
              </div>
            </div>
          </div>
          <QuickStartCard>
            {state.power === 'on' && (
              <button
                type="button"
                role="switch"
                aria-checked={view3d}
                onClick={() => setView3d((v) => !v)}
                className="focus-ring flex items-center gap-2 border-2 border-ink bg-paper px-2 py-1 font-mono text-[11px] shadow-hard-sm active:translate-y-[2px] active:shadow-none"
              >
                <span className="relative h-[12px] w-[22px] rounded-sm border-2 border-ink bg-[#3a3a3a]">
                  <span className="absolute top-0 h-full w-[8px] border-r-2 border-ink transition-[left] duration-100" style={{ left: view3d ? 9 : 0, background: view3d ? 'var(--color-leaf)' : '#8a8a8a' }} />
                </span>
                3D view{view3d ? ': drag to rotate · 0 resets' : ''}
              </button>
            )}
          </QuickStartCard>
          <Manual handheld={false} />
        </div>
        <div className="relative flex w-[300px] shrink-0 flex-col gap-5">
          <div className="desk-shadow" aria-hidden="true" />
          <Shelf />
          <GameCases />
        </div>
        </div>
      </div>

      <div className="sr-only-live" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  )
}
