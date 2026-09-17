import { useEffect, useState } from 'react'
import { useAnnounce, useAnyInput, useDevice } from '../device/DeviceProvider'
import { colophon, profile } from '../content/profile'
import { cartById, cartridges } from '../content/cartridges'
import { CartArt } from '../device/Cartridge'

const IDLE_MS = 18000
const SLIDE_MS = 2600

/** Attract mode: after a while idle on the title, the device demos itself. */
function Attract() {
  const shelf = cartridges.filter((c) => c.bin === 'shelf')
  const slides = shelf.length + 1
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % slides), SLIDE_MS)
    return () => window.clearInterval(t)
  }, [slides])

  if (i === shelf.length) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2cqw] p-[6cqw] text-center">
        <div className="t-md uppercase">How to play</div>
        <ul className="t-xs uppercase opacity-90">
          <li>Insert a cartridge from the shelf</li>
          <li>D-pad + A to choose</li>
          <li>Select opens the manual</li>
          <li>B goes back</li>
        </ul>
      </div>
    )
  }
  const c = shelf[i]
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2cqw] p-[6cqw] text-center">
      <div className="t-xs uppercase opacity-70">Now on the shelf</div>
      <div className="h-[22cqw] w-[22cqw]">
        <CartArt id={c.id} accent="var(--lcd-accent)" fg="var(--lcd-fg)" />
      </div>
      <div className="font-display t-lg uppercase">{c.title}</div>
      <div className="t-xs uppercase">
        {c.tag} · {c.status}
      </div>
    </div>
  )
}

export function TitleScreen() {
  const { press, reducedMotion, state } = useDevice()
  const [attract, setAttract] = useState(false)
  const [tick, setTick] = useState(0)
  const inserted = cartById(state.cart.inserted ?? undefined)
  // Start on the title only ever opens the menu; the loaded cartridge is
  // played from there, so the caption doesn't promise otherwise
  const startCaption = 'Press Start'
  useAnnounce(`Title screen. ${startCaption}.${inserted ? ` ${inserted.title} is in the slot.` : ''}`)

  // any button press resets the idle timer and leaves attract mode
  useAnyInput(() => {
    setAttract(false)
    setTick((t) => t + 1)
  })

  useEffect(() => {
    if (reducedMotion) return
    const t = window.setTimeout(() => setAttract(true), IDLE_MS)
    return () => window.clearTimeout(t)
  }, [tick, reducedMotion])

  return (
    <button
      type="button"
      onClick={() => press('start')}
      className="absolute inset-0 flex w-full cursor-pointer flex-col items-center justify-center focus-visible:outline-2 focus-visible:outline-current"
      aria-label={`Title screen. ${startCaption}.`}
    >
      {attract ? (
        <Attract />
      ) : (
        <>
          <div className="font-display lcd-text" style={{ fontSize: '17cqw', lineHeight: 1 }}>
            {colophon.deviceName}
          </div>
          <div className="t-xs mt-[1cqw] uppercase tracking-[0.2em]">Portfolio system</div>
          <div className="t-md blink mt-[9cqw] uppercase">{startCaption}</div>
          {inserted && <div className="t-xs mt-[2cqw] uppercase opacity-80">Slot: {inserted.title}</div>}
          <div className="t-xs absolute bottom-[4cqw] uppercase opacity-70">
            {profile.name} · {profile.location.split(',')[0]}
          </div>
        </>
      )}
    </button>
  )
}
