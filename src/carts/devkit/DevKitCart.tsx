import { useEffect, useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { ScreenFrame, Row } from '../../screens/ScreenFrame'
import { cartridges, devicePalettes } from '../../content/cartridges'
import { achievements } from '../../content/achievements'
import { audioReady, sfx } from '../../audio/synth'
import { hapticsSupported } from '../../input/haptics'
import type { Button } from '../../device/deviceReducer'
import type { CartProps } from '../index'

const pages = ['Sound', 'Palette', 'Input', 'Info'] as const
const sounds: [string, () => void][] = [
  ['tick', () => sfx.tick()],
  ['confirm', () => sfx.confirm()],
  ['back', () => sfx.back()],
  ['click', () => sfx.click()],
  ['error', () => sfx.error()],
  ['power', () => sfx.power()],
  ['cart in', () => sfx.cartIn()],
  ['cart out', () => sfx.cartOut()],
  ['achieve', () => sfx.achieve()],
  ['hit', () => sfx.hit()],
  ['water', () => sfx.water()],
  ...cartridges.map((c): [string, () => void] => [`jingle: ${c.title}`, () => sfx.jingle(c.jingle)]),
]

/** Hidden system cartridge. Sound test, palette test, input monitor. */
export default function DevKitCart({ cart }: CartProps) {
  const { cyclePalette, unlocked, reducedMotion, palette } = useDevice()
  const [page, setPage] = useState(0)
  const [sel, setSel] = useState(0)
  const [last, setLast] = useState<Button[]>([])
  const [pads, setPads] = useState(0)

  useEffect(() => {
    const check = () => setPads(Array.from(navigator.getGamepads?.() ?? []).filter(Boolean).length)
    check()
    window.addEventListener('gamepadconnected', check)
    window.addEventListener('gamepaddisconnected', check)
    return () => {
      window.removeEventListener('gamepadconnected', check)
      window.removeEventListener('gamepaddisconnected', check)
    }
  }, [])

  useAnnounce(`Dev kit. ${pages[page]} page.`)

  useCartInput((b) => {
    setLast((l) => [...l.slice(-9), b])
    if (b === 'left' || b === 'right') {
      setPage((p) => (p + (b === 'left' ? -1 : 1) + pages.length) % pages.length)
      setSel(0)
      sfx.tick()
      return true
    }
    if (page === 0) {
      if (b === 'up' || b === 'down') {
        setSel((s) => (s + (b === 'up' ? -1 : 1) + sounds.length) % sounds.length)
        return true
      }
      if (b === 'a') {
        sounds[sel][1]()
        return true
      }
    }
    if (page === 1 && b === 'a') {
      cyclePalette()
      return true
    }
    if (b === 'b') return false
    return true
  })

  const title = `Dev kit · ${pages[page]}`
  const right = `${page + 1}/${pages.length} ◀▶`

  if (page === 0)
    return (
      <ScreenFrame title={title} right={right} hint="A: play · B: exit">
        <ul>
          {sounds.map(([name, play], i) => (
            <Row key={name} selected={i === sel} onClick={() => { setSel(i); play() }}>
              {name}
            </Row>
          ))}
        </ul>
      </ScreenFrame>
    )

  if (page === 1)
    return (
      <ScreenFrame title={title} right={right} hint="A: next contrast · B: exit">
        <p className="t-xs uppercase">Current: {palette.name}</p>
        <ul className="mt-[2cqw] grid grid-cols-2 gap-[1.5cqw]">
          {[...devicePalettes, ...cartridges.map((c) => c.palette)].map((p) => (
            <li key={p.name} className="t-xs flex items-center gap-[1.5cqw] border border-current p-[1cqw]" style={{ background: p.bg, color: p.fg }}>
              <span className="h-[3cqw] w-[3cqw]" style={{ background: p.mid }} />
              <span className="h-[3cqw] w-[3cqw]" style={{ background: p.accent }} />
              <span className="truncate uppercase">{p.name}</span>
            </li>
          ))}
        </ul>
      </ScreenFrame>
    )

  if (page === 2)
    return (
      <ScreenFrame title={title} right={right} hint="Press anything · B: exit">
        <p className="t-xs uppercase">Gamepads: {pads}</p>
        <p className="t-xs uppercase">Last inputs:</p>
        <div className="mt-[2cqw] flex flex-wrap gap-[1cqw]" aria-live="polite">
          {last.map((b, i) => (
            <span key={i} className="t-sm border-2 border-current px-[1.5cqw] uppercase">
              {b}
            </span>
          ))}
          {last.length === 0 && <span className="t-xs opacity-60">—</span>}
        </div>
      </ScreenFrame>
    )

  return (
    <ScreenFrame title={title} right={right} hint="B: exit">
      <dl className="t-xs grid grid-cols-[auto_1fr] gap-x-[3cqw] gap-y-[1cqw] uppercase">
        <dt className="opacity-70">Cart</dt>
        <dd>{cart.title}</dd>
        <dt className="opacity-70">Audio</dt>
        <dd>{audioReady() ? 'running' : 'locked'}</dd>
        <dt className="opacity-70">Haptics</dt>
        <dd>{hapticsSupported ? 'yes' : 'no'}</dd>
        <dt className="opacity-70">Motion</dt>
        <dd>{reducedMotion ? 'reduced' : 'full'}</dd>
        <dt className="opacity-70">Viewport</dt>
        <dd>
          {window.innerWidth}×{window.innerHeight}
        </dd>
        <dt className="opacity-70">Stars</dt>
        <dd>
          {unlocked.length}/{achievements.length}
        </dd>
      </dl>
    </ScreenFrame>
  )
}
