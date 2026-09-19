import type { ReactNode } from 'react'
import { useDevice } from './DeviceProvider'
import { achievements } from '../content/achievements'
import { CartArt } from './Cartridge'
import { KeyLegend } from './KeyLegend'
import { cartTally } from '../lib/tally'

/** Sticky note on the desk: the last achievement earned. */
export function StickyNote({ className = '' }: { className?: string }) {
  const { unlocked } = useDevice()
  const last = achievements.find((a) => a.id === unlocked[unlocked.length - 1])
  return (
    <div
      className={`relative w-[150px] -rotate-3 bg-butter px-3 pb-3 pt-4 font-sans text-[12px] leading-snug text-ink ${className}`}
      style={{ boxShadow: '3px 4px 0 0 rgba(17,17,17,0.22)' }}
      role="note"
      aria-label="Sticky note"
    >
      <span className="absolute left-1/2 top-[-7px] h-[12px] w-[38px] -translate-x-1/2 rotate-2 bg-[rgba(255,255,255,0.6)]" aria-hidden="true" />
      <div className="font-tiny text-[7px] uppercase text-ink/60">Last unlocked</div>
      {last ? (
        <>
          <div className="font-semibold">★ {last.title}</div>
          <div className="text-ink/80">{last.how}</div>
        </>
      ) : (
        <div>No trophies yet. Flip the switch.</div>
      )}
      <div className="mt-1 font-tiny text-[7px] uppercase text-ink/60">
        {unlocked.length}/{achievements.length} trophies
      </div>
    </div>
  )
}

/** Coffee mug. Steams only while the device is on. */
export function Mug({ className = '' }: { className?: string }) {
  const { state, reducedMotion } = useDevice()
  const on = state.power === 'on'
  return (
    <svg viewBox="0 0 80 92" width="76" height="88" className={className} aria-hidden="true">
      {on &&
        !reducedMotion &&
        [0, 1, 2].map((i) => (
          <path
            key={i}
            className="steam"
            d={`M${26 + i * 10} 28 c -4 -5, 4 -9, 0 -15`}
            fill="none"
            stroke="#111"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animationDelay: `${i * 0.7}s`, transformOrigin: `${26 + i * 10}px 28px` }}
          />
        ))}
      <rect x="10" y="34" width="46" height="48" rx="6" fill="var(--color-tomato)" stroke="#111" strokeWidth="3" />
      <path d="M56 46 h8 a10 10 0 0 1 0 22 h-8" fill="none" stroke="#111" strokeWidth="3" />
      <ellipse cx="33" cy="36" rx="21" ry="4.5" fill="#3a2418" stroke="#111" strokeWidth="2" />
      <text x="33" y="66" textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize="8" fill="#fffdf5">
        KHEL
      </text>
    </svg>
  )
}

/** A pencil lying on the mat. */
export function Pencil({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 26" width="170" height="24" className={className} aria-hidden="true">
      <polygon points="2,13 22,3 22,23" fill="#f0d9a8" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="2,13 9,9.5 9,16.5" fill="#111" />
      <rect x="22" y="3" width="130" height="20" fill="var(--color-butter)" stroke="#111" strokeWidth="2.5" />
      <line x1="22" y1="10" x2="152" y2="10" stroke="rgba(17,17,17,0.25)" strokeWidth="1.5" />
      <line x1="22" y1="16" x2="152" y2="16" stroke="rgba(17,17,17,0.25)" strokeWidth="1.5" />
      <rect x="152" y="3" width="10" height="20" fill="#9a9a9a" stroke="#111" strokeWidth="2.5" />
      <rect x="162" y="3" width="16" height="20" rx="3" fill="var(--color-pink)" stroke="#111" strokeWidth="2.5" />
      <text x="60" y="17" fontFamily="Silkscreen, monospace" fontSize="7" fill="#111">
        KHEL·1
      </text>
    </svg>
  )
}

/** Printed quick-start card: the key legend, plus any extra controls. */
export function QuickStartCard({ children }: { children?: ReactNode }) {
  return (
    // mt-9, not mt-6: the manual's tab hangs 28px under the console
    <div className="mt-9 border-[3px] border-ink bg-paper px-4 py-3 shadow-hard-sm" aria-label="Quick start card">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-sm">Quick start</span>
        <span className="font-tiny text-[7px] uppercase text-ink/60">Keyboard · a gamepad works too</span>
      </div>
      <KeyLegend className="mt-2" />
      {children && <div className="mt-2 border-t-2 border-dotted border-ink pt-2">{children}</div>}
    </div>
  )
}

/** One case per cartridge, filled in as you boot them. Feeds the Collector trophy. */
export function GameCases() {
  const { bootedCarts, available } = useDevice()
  const listed = available.filter((c) => c.bin !== 'hidden')
  const { played, total } = cartTally(available, bootedCarts)
  const shelfCount = available.filter((c) => c.bin === 'shelf').length
  return (
    <div className="border-[3px] border-ink bg-paper p-4 shadow-hard">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-lg">Game cases</h2>
        {/* same words and same count as CARTS on the save file */}
        <span className="font-tiny text-[8px] uppercase text-ink/70">
          Carts {played}/{total} booted
        </span>
      </div>
      <ul className="flex gap-2" aria-label="Game cases">
        {listed.map((c) => {
          const got = bootedCarts.includes(c.id)
          return (
            <li
              key={c.id}
              aria-label={`${c.title}${got ? ', played' : ', not played yet'}`}
              className="flex h-[52px] flex-1 items-center justify-center rounded-sm border-2"
              style={
                got
                  ? { background: c.label.bg, color: c.label.fg, borderColor: '#111111', boxShadow: '2px 2px 0 0 #111111' }
                  : { borderStyle: 'dotted', borderColor: 'rgba(17,17,17,0.35)' }
              }
            >
              {got ? (
                <div className="h-7 w-7">
                  <CartArt id={c.id} accent={c.label.accent} fg={c.label.fg} />
                </div>
              ) : (
                <span className="font-tiny text-[9px] text-ink/40">?</span>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-2 font-tiny text-[7px] uppercase text-ink/60">Boot the {shelfCount} shelf carts for the Collector trophy.</p>
    </div>
  )
}
