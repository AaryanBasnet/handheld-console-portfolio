import { useEffect, useState } from 'react'
import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { contact } from '../content/profile'
import { ScreenFrame } from './ScreenFrame'

/** Contact page: the link cable port. */
export function LinkCableScreen() {
  const { unlock, reducedMotion } = useDevice()
  const [dots, setDots] = useState(0)
  const [linked, setLinked] = useState(reducedMotion)
  useAnnounce('Link cable. Contact links.')

  useEffect(() => {
    unlock('link')
  }, [unlock])

  useEffect(() => {
    if (linked) return
    const t = window.setInterval(() => setDots((d) => (d + 1) % 4), 220)
    const done = window.setTimeout(() => setLinked(true), 1100)
    return () => {
      window.clearInterval(t)
      window.clearTimeout(done)
    }
  }, [linked])

  return (
    <ScreenFrame title="Link cable" right={linked ? 'P2 FOUND' : 'SEARCHING'} hint="B: back">
      {!linked ? (
        <p className="uppercase">Searching for player 2{'.'.repeat(dots)}</p>
      ) : (
        <>
          <p className="t-xs mb-[3cqw] uppercase opacity-80">{contact.intro}</p>
          <ul className="flex flex-col gap-[2cqw]">
            {contact.links.map((l) => (
              <li key={l.label} className="flex items-baseline gap-[3cqw]">
                <span className="t-xs w-[18cqw] shrink-0 font-bold uppercase opacity-70">{l.label}</span>
                {l.href && l.href !== 'TODO' ? (
                  <a href={l.href} className="underline focus-visible:outline-2 focus-visible:outline-current" target="_blank" rel="noreferrer">
                    {l.value}
                  </a>
                ) : (
                  <span className="font-mono">{l.value}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </ScreenFrame>
  )
}
