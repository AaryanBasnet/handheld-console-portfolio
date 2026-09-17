import { useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { ScreenFrame } from '../../screens/ScreenFrame'
import { cakeOptions } from '../../content/sweetnest'
import { sfx } from '../../audio/synth'
import type { CartProps } from '../index'

type Choice = Record<(typeof cakeOptions)[number]['id'], string>

const defaults = (): number[] => cakeOptions.map(() => 0)

const pick = (choice: number[]): Choice =>
  Object.fromEntries(cakeOptions.map((o, i) => [o.id, o.values[choice[i]]])) as Choice

/** Palette slots, so the drawing works on every screen palette. */
const flavourFill: Record<string, string> = {
  Vanilla: 'var(--lcd-bg)',
  Chocolate: 'var(--lcd-fg)',
  Strawberry: 'var(--lcd-mid)',
  Lemon: 'var(--lcd-accent)',
}
const icingFill: Record<string, string> = {
  Pink: 'var(--lcd-mid)',
  Mint: 'var(--lcd-accent)',
  White: 'var(--lcd-bg)',
}

const TIER_W = [100, 72, 48]
const TIER_H = 17

/** The cake, redrawn from the choices. Pixel stand-in for the 3D view. */
function Cake({ c }: { c: Choice }) {
  const tiers = Number(c.tiers)
  const rx = c.shape === 'Square' ? 0 : 7
  const topW = TIER_W[tiers - 1]
  const topY = 76 - TIER_H * tiers
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden="true">
      {/* plate */}
      <ellipse cx="60" cy="76" rx="56" ry="4" fill="var(--lcd-mid)" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: tiers }).map((_, i) => {
        const w = TIER_W[i]
        const x = 60 - w / 2
        const y = 76 - TIER_H * (i + 1)
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={TIER_H} rx={rx} fill={flavourFill[c.flavour]} stroke="currentColor" strokeWidth="2" />
            {/* icing band with drips */}
            <rect x={x} y={y} width={w} height="6" rx={rx} fill={icingFill[c.icing]} stroke="currentColor" strokeWidth="2" />
            {Array.from({ length: Math.floor(w / 12) }).map((_, k) => (
              <circle key={k} cx={x + 8 + k * 12} cy={y + 7} r="2" fill={icingFill[c.icing]} stroke="currentColor" strokeWidth="1.5" />
            ))}
            {c.shape === 'Round' && <ellipse cx="60" cy={y} rx={w / 2} ry="3" fill={icingFill[c.icing]} stroke="currentColor" strokeWidth="2" />}
          </g>
        )
      })}
      {c.shape === 'Heart' && (
        <path
          d="M60 70 L48 60 C44 56 46 50 52 50 C56 50 58 52 60 55 C62 52 64 50 68 50 C74 50 76 56 72 60 Z"
          fill="var(--lcd-accent)"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {c.topping === 'Cherries' &&
        [-12, 0, 12].map((dx) => (
          <g key={dx}>
            <line x1={60 + dx} y1={topY - 7} x2={60 + dx + 3} y2={topY - 12} stroke="currentColor" strokeWidth="1.5" />
            <circle cx={60 + dx} cy={topY - 4} r="3.5" fill="var(--lcd-accent)" stroke="currentColor" strokeWidth="1.5" />
          </g>
        ))}
      {c.topping === 'Candles' &&
        [-12, 0, 12].map((dx) => (
          <g key={dx}>
            <rect x={60 + dx - 1.5} y={topY - 12} width="3" height="12" fill="var(--lcd-bg)" stroke="currentColor" strokeWidth="1.5" />
            <circle cx={60 + dx} cy={topY - 15} r="2" fill="var(--lcd-accent)" />
          </g>
        ))}
      {c.topping === 'Sprinkles' &&
        Array.from({ length: Math.floor(topW / 8) }).map((_, k) => (
          <line
            key={k}
            x1={60 - topW / 2 + 6 + k * 8}
            y1={topY - 2}
            x2={60 - topW / 2 + 9 + k * 8}
            y2={topY - 5}
            stroke={k % 2 ? 'var(--lcd-accent)' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
    </svg>
  )
}

/** Cake configurator: five options, live preview, A bakes. */
export default function SweetNestCart({ cart }: CartProps) {
  const { unlock } = useDevice()
  const [choice, setChoice] = useState<number[]>(defaults)
  const [row, setRow] = useState(0)
  const [done, setDone] = useState(false)
  const c = pick(choice)

  useAnnounce(
    done
      ? `Order sheet: ${cakeOptions.map((o) => `${o.label} ${c[o.id]}`).join(', ')}.`
      : `${cakeOptions[row].label}: ${c[cakeOptions[row].id]}. Left and right to change, A to bake.`,
  )

  const change = (i: number, delta: number) => {
    const n = cakeOptions[i].values.length
    setChoice((ch) => ch.map((v, k) => (k === i ? (v + delta + n) % n : v)))
    sfx.tick()
  }

  useCartInput((b) => {
    if (done) {
      if (b === 'a' || b === 'b' || b === 'start') {
        setDone(false)
        sfx.back()
      }
      return true
    }
    if (b === 'up' || b === 'down') {
      setRow((r) => (r + (b === 'up' ? -1 : 1) + cakeOptions.length) % cakeOptions.length)
      sfx.tick()
      return true
    }
    if (b === 'left' || b === 'right') {
      change(row, b === 'left' ? -1 : 1)
      return true
    }
    if (b === 'a') {
      setDone(true)
      sfx.jingle([72, 76, 79])
      unlock('baked')
      return true
    }
    if (b === 'start') {
      setChoice(defaults())
      sfx.click()
      return true
    }
    return false
  })

  if (done) {
    return (
      <ScreenFrame title="Order sheet" right="✓" hint="A: build again">
        <div className="mx-auto h-[30cqw] w-[45cqw]">
          <Cake c={c} />
        </div>
        <dl className="t-xs mt-[2cqw] grid grid-cols-[auto_1fr] gap-x-[3cqw] gap-y-[0.5cqw] uppercase">
          {cakeOptions.map((o) => (
            <div key={o.id} className="contents">
              <dt className="opacity-70">{o.label}</dt>
              <dd>{c[o.id]}</dd>
            </div>
          ))}
        </dl>
        <p className="t-xs mt-[2cqw] uppercase opacity-70">Pixel stand-in for the real 3D customizer.</p>
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame title="SweetNest" right="Custom cakes" hint={cart.controls} scroll={false}>
      <div className="flex h-full flex-col">
        <div className="mx-auto h-[30cqw] w-[45cqw] shrink-0">
          <Cake c={c} />
        </div>
        <ul className="mt-[1cqw] flex flex-col gap-[0.5cqw]" aria-label="Options">
          {cakeOptions.map((o, i) => {
            const selected = i === row
            return (
              <li key={o.id}>
                <div
                  className="t-xs flex items-center gap-[1cqw] px-[1.5cqw] py-[0.6cqw] uppercase"
                  style={selected ? { background: 'var(--lcd-fg)', color: 'var(--lcd-bg)' } : undefined}
                >
                  <span className="w-[3.5cqw] shrink-0">{selected ? '▶' : ''}</span>
                  <button type="button" onClick={() => setRow(i)} className="w-[22cqw] shrink-0 text-left focus-visible:outline-2 focus-visible:outline-current">
                    {o.label}
                  </button>
                  <button type="button" onClick={() => { setRow(i); change(i, -1) }} aria-label={`${o.label}: previous`} className="px-[1cqw] focus-visible:outline-2 focus-visible:outline-current">
                    ◀
                  </button>
                  <span className="flex-1 text-center">{o.values[choice[i]]}</span>
                  <button type="button" onClick={() => { setRow(i); change(i, 1) }} aria-label={`${o.label}: next`} className="px-[1cqw] focus-visible:outline-2 focus-visible:outline-current">
                    ▶
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </ScreenFrame>
  )
}
