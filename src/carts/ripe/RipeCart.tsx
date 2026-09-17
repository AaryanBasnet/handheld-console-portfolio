import { useEffect, useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { Row, ScreenFrame } from '../../screens/ScreenFrame'
import { ripeLog, ripeStatus } from '../../content/ripe-patchnotes'
import { sfx } from '../../audio/synth'
import { load, save } from '../../lib/storage'
import type { CartProps } from '../index'

type Stage = 0 | 1 | 2 | 3 // empty, seed, sprout, ripe
type Terrain = 'soil' | 'rocky'
interface Plot {
  terrain: Terrain
  stage: Stage
  watered: boolean
  timer: number
}
type View = 'farm' | 'shop' | 'notes'

const GROW_SECONDS = 3
const PLOTS = 4
/** cursor slots: the plots, then the shop sign, then the dev log sign */
const SHOP = PLOTS
const LOG = PLOTS + 1
const SLOTS = PLOTS + 2
/** game prices, not real ones */
const SEED_PRICE = 2
const TOMATO_PRICE = 3
const CAN_PRICE = 10

const soil = (): Plot => ({ terrain: 'soil', stage: 0, watered: false, timer: 0 })
const rocky = (): Plot => ({ ...soil(), terrain: 'rocky' })
const freshPlots = (): Plot[] => [soil(), soil(), rocky(), rocky()]
const stageName = ['Empty', 'Seed', 'Sprout', 'Ripe']

/** Rain about every third calendar day; waters everything for free. */
const isRainy = (d: Date) => (d.getFullYear() + d.getMonth() * 31 + d.getDate()) % 3 === 0
const isDaytime = (d: Date) => d.getHours() >= 6 && d.getHours() < 18

function Plant({ plot }: { plot: Plot }) {
  const { stage, watered, terrain } = plot
  return (
    <svg viewBox="0 0 40 60" className="h-full w-full" aria-hidden="true">
      <rect x="2" y="46" width="36" height="12" fill={watered ? 'var(--lcd-fg)' : 'var(--lcd-mid)'} stroke="currentColor" strokeWidth="2" />
      {terrain === 'rocky' && (
        <g fill="var(--lcd-bg)" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="42" r="5" />
          <circle cx="26" cy="40" r="7" />
          <circle cx="20" cy="50" r="4" />
        </g>
      )}
      {terrain === 'soil' && stage >= 1 && <circle cx="20" cy="44" r="3" fill="currentColor" />}
      {stage >= 2 && (
        <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M20 44 V26" />
          <path d="M20 36 Q12 34 10 28" />
          <path d="M20 32 Q28 30 30 24" />
        </g>
      )}
      {stage >= 3 && (
        <g>
          <circle cx="13" cy="22" r="6" fill="var(--lcd-accent)" stroke="currentColor" strokeWidth="2" />
          <circle cx="27" cy="18" r="6" fill="var(--lcd-accent)" stroke="currentColor" strokeWidth="2" />
        </g>
      )}
      {terrain === 'soil' && stage === 0 && <path d="M8 50 H32" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />}
    </svg>
  )
}

function Sign({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 40 60" className="h-full w-full" aria-hidden="true">
      <rect x="18" y="28" width="4" height="30" fill="currentColor" />
      <rect x="4" y="10" width="32" height="18" fill="var(--lcd-bg)" stroke="currentColor" strokeWidth="2" />
      <text x="20" y="23" textAnchor="middle" fontSize="10" fontFamily="inherit" fill="currentColor">
        {label}
      </text>
    </svg>
  )
}

interface Saved {
  plots: Plot[]
  seeds: number
  tomatoes: number
  coins: number
  can: boolean
  at: number
}

/** Plants keep growing while the cartridge is out: apply the elapsed time on load. */
function restore(): Saved {
  const fresh: Saved = { plots: freshPlots(), seeds: 3, tomatoes: 0, coins: 0, can: false, at: Date.now() }
  const s = load<Partial<Saved> | null>('ripe', null)
  if (!s || !Array.isArray(s.plots) || s.plots.length !== PLOTS) return fresh
  const elapsed = Math.max(0, Math.floor((Date.now() - (s.at ?? Date.now())) / 1000))
  const plots = s.plots.map((p) => {
    const plot: Plot = { ...p, terrain: p.terrain ?? 'soil' }
    if (!plot.watered || plot.stage === 0 || plot.stage === 3) return plot
    if (plot.timer + elapsed >= GROW_SECONDS) return { ...plot, stage: (plot.stage + 1) as Stage, watered: false, timer: 0 }
    return { ...plot, timer: plot.timer + elapsed }
  })
  return { plots, seeds: s.seeds ?? 3, tomatoes: s.tomatoes ?? 0, coins: s.coins ?? 0, can: s.can ?? false, at: Date.now() }
}

/**
 * The systems built so far, in miniature: plant, water and harvest on four
 * plots; clear rocky terrain before planting; sell tomatoes and buy seeds or
 * a watering can at the shop; and the real clock drives day, night and rain.
 * Early access: clearly not the real game.
 */
export default function RipeCart({ cart }: CartProps) {
  const { unlock } = useDevice()
  const [saved] = useState(restore)
  const [plots, setPlots] = useState<Plot[]>(saved.plots)
  const [seeds, setSeeds] = useState(saved.seeds)
  const [tomatoes, setTomatoes] = useState(saved.tomatoes)
  const [coins, setCoins] = useState(saved.coins)
  const [can, setCan] = useState(saved.can)
  const [sel, setSel] = useState(0)
  const [ssel, setSsel] = useState(0)
  const [view, setView] = useState<View>('farm')
  const [now, setNow] = useState(() => new Date())
  const [msg, setMsg] = useState(saved.tomatoes > 0 || saved.plots.some((p) => p.stage > 0) ? 'Welcome back.' : 'Press A on a plot.')

  const rain = isRainy(now)

  useEffect(() => {
    save('ripe', { plots, seeds, tomatoes, coins, can, at: Date.now() } satisfies Saved)
  }, [plots, seeds, tomatoes, coins, can])

  // growth tick; rain or the can waters every growing plot for free
  useEffect(() => {
    const t = window.setInterval(() => {
      const d = new Date()
      setNow(d)
      const free = isRainy(d) || can
      setPlots((ps) =>
        ps.map((p) => {
          if (p.terrain === 'rocky' || p.stage === 0 || p.stage === 3) return p
          if (!p.watered && !free) return p
          if (p.timer + 1 >= GROW_SECONDS) return { ...p, stage: (p.stage + 1) as Stage, watered: false, timer: 0 }
          return { ...p, watered: true, timer: p.timer + 1 }
        }),
      )
    }, 1000)
    return () => window.clearInterval(t)
  }, [can])

  const plot = plots[sel]
  const slotName = sel === SHOP ? 'Shop sign' : sel === LOG ? 'Dev log sign' : `Plot ${sel + 1}: ${plot.terrain === 'rocky' ? 'Rocky' : stageName[plot.stage]}${plot.watered ? ', watered' : ''}`
  useAnnounce(view === 'notes' ? 'Build log.' : view === 'shop' ? `Shop. ${coins} coins.` : `${slotName}. ${msg}`)

  const act = () => {
    if (sel === SHOP) {
      setView('shop')
      sfx.click()
      return
    }
    if (sel === LOG) {
      setView('notes')
      sfx.click()
      return
    }
    const p = plots[sel]
    const update = (next: Plot) => setPlots((ps) => ps.map((x, i) => (i === sel ? next : x)))
    if (p.terrain === 'rocky') {
      update(soil())
      setMsg('Cleared the rocks. Soil now.')
      sfx.hit()
    } else if (p.stage === 0) {
      if (seeds <= 0) {
        setMsg('No seeds. Buy some at the shop.')
        sfx.error()
        return
      }
      setSeeds(seeds - 1)
      update({ ...soil(), stage: 1 })
      setMsg(rain ? 'Planted. The rain will water it.' : can ? 'Planted. The can waters it.' : 'Planted. Water it.')
      sfx.confirm()
    } else if (p.stage === 3) {
      setTomatoes(tomatoes + 1)
      setSeeds(seeds + 1)
      update(soil())
      setMsg('Harvested. +1 tomato, +1 seed.')
      sfx.jingle([62, 66, 69])
      unlock('harvest')
    } else if (!p.watered) {
      update({ ...p, watered: true, timer: 0 })
      setMsg('Watered. Wait for it.')
      sfx.water()
    } else {
      setMsg('Already watered.')
      sfx.tick()
    }
  }

  const shopRows = [
    { label: 'Seed', right: `buy · ${SEED_PRICE}c` },
    { label: 'Tomato', right: `sell · ${TOMATO_PRICE}c` },
    { label: 'Watering can', right: can ? 'owned' : `buy · ${CAN_PRICE}c` },
  ]

  const shopAct = (i: number) => {
    setSsel(i)
    if (i === 0) {
      if (coins < SEED_PRICE) {
        setMsg('Not enough coins.')
        sfx.error()
        return
      }
      setCoins(coins - SEED_PRICE)
      setSeeds(seeds + 1)
      setMsg('Bought a seed.')
      sfx.confirm()
    } else if (i === 1) {
      if (tomatoes <= 0) {
        setMsg('No tomatoes to sell.')
        sfx.error()
        return
      }
      setTomatoes(tomatoes - 1)
      setCoins(coins + TOMATO_PRICE)
      setMsg(`Sold a tomato. +${TOMATO_PRICE}c.`)
      sfx.confirm()
    } else {
      if (can) {
        setMsg('You already own the can.')
        sfx.tick()
        return
      }
      if (coins < CAN_PRICE) {
        setMsg('Not enough coins.')
        sfx.error()
        return
      }
      setCoins(coins - CAN_PRICE)
      setCan(true)
      setMsg('Bought the can. Plots water themselves.')
      sfx.jingle([62, 66, 69, 74])
    }
  }

  useCartInput((b) => {
    if (view === 'notes') {
      if (b === 'b' || b === 'start' || b === 'a') {
        setView('farm')
        sfx.back()
      }
      return true
    }
    if (view === 'shop') {
      if (b === 'up' || b === 'down') {
        setSsel((s) => (s + (b === 'up' ? -1 : 1) + shopRows.length) % shopRows.length)
        sfx.tick()
      } else if (b === 'a') shopAct(ssel)
      else if (b === 'b' || b === 'start') {
        setView('farm')
        sfx.back()
      }
      return true
    }
    if (b === 'left' || b === 'right') {
      setSel((s) => (s + (b === 'left' ? -1 : 1) + SLOTS) % SLOTS)
      sfx.tick()
      return true
    }
    if (b === 'a') {
      act()
      return true
    }
    if (b === 'start') {
      setView('shop')
      sfx.click()
      return true
    }
    return false
  })

  if (view === 'notes') {
    return (
      <ScreenFrame title="Build log" right="Godot 4" hint="B: back">
        <p className="t-xs mb-[2cqw] uppercase opacity-80">{ripeStatus}</p>
        <p className="t-xs mb-[2cqw] uppercase opacity-80">Built so far in the real project:</p>
        <ul className="flex flex-col gap-[1.5cqw]">
          {ripeLog.map((n) => (
            <li key={n.title} className="t-xs">
              <div className="uppercase" style={{ borderBottom: '1px solid currentColor' }}>
                ✓ {n.title}
              </div>
              {n.note && <div className="opacity-80">{n.note}</div>}
            </li>
          ))}
        </ul>
      </ScreenFrame>
    )
  }

  if (view === 'shop') {
    return (
      <ScreenFrame title="Shop" right={`${coins}c`} hint="A: buy/sell · B: farm">
        <p className="t-xs mb-[1cqw] uppercase opacity-80">
          Seeds {seeds} · Tomatoes {tomatoes}
        </p>
        <ul className="flex flex-col gap-[0.5cqw]" aria-label="Shop">
          {shopRows.map((r, i) => (
            <Row key={r.label} selected={i === ssel} onClick={() => shopAct(i)} right={r.right}>
              {r.label}
            </Row>
          ))}
        </ul>
        <p className="t-xs mt-[3cqw] border-t-2 border-dotted border-current pt-[1.5cqw] uppercase" aria-hidden="true">
          {msg}
        </p>
      </ScreenFrame>
    )
  }

  const hourPct = ((now.getHours() + now.getMinutes() / 60) / 24) * 100

  return (
    <ScreenFrame title="Ripe" right="Early access" hint={cart.controls} scroll={false}>
      <div className="flex h-full flex-col">
        <div className="t-xs flex items-center justify-between uppercase">
          <span>
            Seeds {seeds} · Tomatoes {tomatoes} · {coins}c
          </span>
          {can && (
            <span className="px-[1cqw]" style={{ background: 'var(--lcd-fg)', color: 'var(--lcd-bg)' }}>
              Can
            </span>
          )}
        </div>

        <div className="t-xs mt-[1cqw] flex items-center gap-[2cqw] uppercase" aria-label={`${isDaytime(now) ? 'Day' : 'Night'}${rain ? ', raining' : ''}`}>
          <div className="relative h-[4cqw] flex-1 border-2 border-current" aria-hidden="true">
            <div className="absolute inset-y-0 left-1/4 right-1/4" style={{ background: 'var(--lcd-mid)' }} />
            <span
              className="absolute top-1/2 h-[3cqw] w-[3cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-current"
              style={{ left: `${hourPct}%`, background: isDaytime(now) ? 'var(--lcd-accent)' : 'var(--lcd-bg)' }}
            />
          </div>
          <span className="shrink-0">
            {isDaytime(now) ? 'Day' : 'Night'}
            {rain ? ' · Rain' : ''}
          </span>
        </div>

        <div className="mt-[1cqw] flex flex-1 items-end justify-between gap-[1cqw]" role="group" aria-label="Farm">
          {plots.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSel(i)
                if (i === sel) act()
              }}
              aria-label={`Plot ${i + 1}: ${p.terrain === 'rocky' ? 'Rocky' : stageName[p.stage]}${p.watered ? ', watered' : ''}`}
              aria-current={i === sel ? 'true' : undefined}
              className="relative flex h-[32cqw] w-[15cqw] flex-col items-center justify-end focus-visible:outline-2 focus-visible:outline-current"
            >
              {i === sel && (
                <span className="t-xs blink absolute -top-[1cqw]" aria-hidden="true">
                  ▼
                </span>
              )}
              <div className="h-[26cqw] w-full">
                <Plant plot={p} />
              </div>
              {p.terrain === 'soil' && p.watered && p.stage > 0 && p.stage < 3 && (
                <div className="mt-[0.5cqw] flex w-full gap-[0.5cqw]" aria-hidden="true">
                  {Array.from({ length: GROW_SECONDS }).map((_, k) => (
                    <span key={k} className="h-[1.5cqw] flex-1 border border-current" style={{ background: k < p.timer ? 'currentColor' : 'transparent' }} />
                  ))}
                </div>
              )}
            </button>
          ))}
          {[
            { slot: SHOP, label: 'SHOP', aria: 'Shop' },
            { slot: LOG, label: 'LOG', aria: 'Dev log' },
          ].map((s) => (
            <button
              key={s.slot}
              type="button"
              onClick={() => {
                setSel(s.slot)
                if (s.slot === sel) act()
              }}
              aria-label={s.aria}
              aria-current={s.slot === sel ? 'true' : undefined}
              className="relative flex h-[32cqw] w-[12cqw] flex-col items-center justify-end focus-visible:outline-2 focus-visible:outline-current"
            >
              {s.slot === sel && (
                <span className="t-xs blink absolute -top-[1cqw]" aria-hidden="true">
                  ▼
                </span>
              )}
              <div className="h-[26cqw] w-full">
                <Sign label={s.label} />
              </div>
            </button>
          ))}
        </div>
        <p className="t-xs mt-[1cqw] border-t-2 border-dotted border-current pt-[1cqw] uppercase" aria-hidden="true">
          {msg}
        </p>
      </div>
    </ScreenFrame>
  )
}
