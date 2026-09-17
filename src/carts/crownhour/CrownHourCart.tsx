import { useEffect, useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { ScreenFrame } from '../../screens/ScreenFrame'
import { checkoutSteps, trackingStages, watches, type Watch } from '../../content/crownhour'
import { sfx } from '../../audio/synth'
import type { CartProps } from '../index'

type View = 'case' | 'checkout' | 'tracking'

/** Real time, ticking once a second. */
function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return now
}

/** A watch face showing the actual time. Case outline varies per model. */
function WatchFace({ shape, now }: { shape: Watch['shape']; now: Date }) {
  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60
  const rx = shape === 'round' ? 46 : shape === 'square' ? 4 : 14
  const hand = (deg: number, len: number, width: number, stroke = 'currentColor') => (
    <line x1="50" y1="50" x2="50" y2={50 - len} stroke={stroke} strokeWidth={width} strokeLinecap="round" transform={`rotate(${deg} 50 50)`} />
  )
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      {/* crown */}
      <rect x="92" y="44" width="8" height="12" rx="2" fill="currentColor" />
      {/* lugs */}
      <rect x="30" y="0" width="40" height="6" fill="currentColor" />
      <rect x="30" y="94" width="40" height="6" fill="currentColor" />
      <rect x="4" y="4" width="92" height="92" rx={rx} fill="var(--lcd-mid)" stroke="currentColor" strokeWidth="4" />
      <rect x="12" y="12" width="76" height="76" rx={Math.max(0, rx - 6)} fill="var(--lcd-bg)" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="16"
          x2="50"
          y2={i % 3 === 0 ? 22 : 19}
          stroke="currentColor"
          strokeWidth={i % 3 === 0 ? 3 : 2}
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      {hand(h * 30, 20, 4)}
      {hand(m * 6, 29, 3)}
      {hand(s * 6, 31, 1.5, 'var(--lcd-accent)')}
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  )
}

/** Browse a display case, fill a cart, run checkout and tracking. */
export default function CrownHourCart({ cart }: CartProps) {
  const { unlock } = useDevice()
  const now = useClock()
  const [view, setView] = useState<View>('case')
  const [sel, setSel] = useState(0)
  const [count, setCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [orders, setOrders] = useState(0)
  const [step, setStep] = useState(0)
  const [stage, setStage] = useState(0)
  const [msg, setMsg] = useState('Left and right to browse.')
  const watch = watches[sel]
  const lastStep = checkoutSteps.length - 1
  const lastStage = trackingStages.length - 1

  useAnnounce(
    view === 'case'
      ? `Display case. ${watch.name}, ${watch.line}, ${watch.price}. ${count} in cart. ${msg}`
      : view === 'checkout'
        ? `Checkout step ${step + 1} of ${checkoutSteps.length}: ${checkoutSteps[step]}.`
        : `Order tracking: ${trackingStages[stage]}.`,
  )

  useCartInput((b) => {
    switch (view) {
      case 'case':
        if (b === 'left' || b === 'right') {
          setSel((i) => (i + (b === 'left' ? -1 : 1) + watches.length) % watches.length)
          sfx.tick()
          return true
        }
        if (b === 'a') {
          setCount((c) => c + 1)
          setMsg(`${watch.name} added to cart.`)
          sfx.confirm()
          return true
        }
        if (b === 'start') {
          if (count === 0) {
            setMsg('Cart is empty. Press A on a model.')
            sfx.error()
            return true
          }
          setStep(0)
          setView('checkout')
          sfx.click()
          return true
        }
        return false
      case 'checkout':
        if (b === 'a') {
          if (step < lastStep) {
            setStep(step + 1)
            sfx.confirm()
          } else {
            setOrderCount(count)
            setOrders((n) => n + 1)
            setCount(0)
            setStage(0)
            setView('tracking')
            sfx.jingle([60, 67, 72])
            unlock('order')
          }
          return true
        }
        if (b === 'b') {
          if (step > 0) setStep(step - 1)
          else setView('case')
          sfx.back()
          return true
        }
        return true
      case 'tracking':
        if (b === 'a') {
          if (stage < lastStage) {
            setStage(stage + 1)
            sfx.confirm()
          } else {
            setMsg('Delivered. Browse again.')
            setView('case')
            sfx.back()
          }
          return true
        }
        if (b === 'b' || b === 'start') {
          setMsg('Order on its way.')
          setView('case')
          sfx.back()
          return true
        }
        return true
    }
  })

  if (view === 'checkout') {
    return (
      <ScreenFrame title="Checkout" right={`${step + 1}/${checkoutSteps.length}`} hint="A: next · B: back">
        <p className="t-xs mb-[2cqw] uppercase opacity-80">
          {count} item{count === 1 ? '' : 's'} in cart
        </p>
        <ol className="flex flex-col gap-[1cqw]">
          {checkoutSteps.map((s, i) => (
            <li key={s} className="flex items-center gap-[2cqw] uppercase" style={{ opacity: i <= step ? 1 : 0.5 }}>
              <span className="font-mono">{i < step ? '[x]' : i === step ? '[▶]' : '[ ]'}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-[3cqw] flex gap-[1cqw]" aria-hidden="true">
          {checkoutSteps.map((_, i) => (
            <span key={i} className="h-[2.5cqw] flex-1 border border-current" style={{ background: i <= step ? 'var(--lcd-fg)' : 'transparent' }} />
          ))}
        </div>
        <p className="t-xs mt-[3cqw] opacity-70">Generic steps. The real checkout is in the product.</p>
      </ScreenFrame>
    )
  }

  if (view === 'tracking') {
    return (
      <ScreenFrame title="Order tracking" right={`${orderCount} item${orderCount === 1 ? '' : 's'}`} hint={stage < lastStage ? 'A: advance · B: shop' : 'A: shop'}>
        <div className="t-xs mb-[2cqw] border-2 border-current p-[2cqw] text-center uppercase">Order {String(orders).padStart(4, '0')}</div>
        <ol className="flex flex-col gap-[1cqw]">
          {trackingStages.map((s, i) => (
            <li key={s} className="flex items-center gap-[2cqw] uppercase" style={{ opacity: i <= stage ? 1 : 0.5 }}>
              <span className="font-mono">{i < stage ? '[x]' : i === stage ? '[▶]' : '[ ]'}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-[3cqw] flex gap-[1cqw]" aria-hidden="true">
          {trackingStages.map((_, i) => (
            <span key={i} className="h-[2.5cqw] flex-1 border border-current" style={{ background: i <= stage ? 'var(--lcd-fg)' : 'transparent' }} />
          ))}
        </div>
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame title="CrownHour" right={`Cart ${count}`} hint={cart.controls} scroll={false}>
      <div className="flex h-full flex-col">
        <div className="t-xs flex items-center justify-between uppercase opacity-80">
          <span>Display case</span>
          <span>
            {sel + 1}/{watches.length}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-[3cqw]" role="group" aria-label="Models">
          <button
            type="button"
            onClick={() => {
              setSel((i) => (i - 1 + watches.length) % watches.length)
              sfx.tick()
            }}
            aria-label="Previous model"
            className="t-md px-[1cqw] focus-visible:outline-2 focus-visible:outline-current"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => {
              setCount((c) => c + 1)
              setMsg(`${watch.name} added to cart.`)
              sfx.confirm()
            }}
            aria-label={`${watch.name}. Add to cart.`}
            className="h-[36cqw] w-[36cqw] focus-visible:outline-2 focus-visible:outline-current"
          >
            <WatchFace shape={watch.shape} now={now} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSel((i) => (i + 1) % watches.length)
              sfx.tick()
            }}
            aria-label="Next model"
            className="t-md px-[1cqw] focus-visible:outline-2 focus-visible:outline-current"
          >
            ▶
          </button>
        </div>
        <div className="text-center uppercase">
          <div className="t-md">{watch.name}</div>
          <div className="t-xs opacity-80">
            {watch.line} · {watch.price}
          </div>
        </div>
        <p className="t-xs mt-[2cqw] border-t-2 border-dotted border-current pt-[1.5cqw] uppercase" aria-hidden="true">
          {msg}
        </p>
      </div>
    </ScreenFrame>
  )
}
