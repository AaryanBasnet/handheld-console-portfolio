import { useEffect } from 'react'
import { useDevice } from './DeviceProvider'
import { colophon } from '../content/profile'

/** Cross-head screw. */
function Screw({ className }: { className: string }) {
  return (
    <span className={`absolute h-[13px] w-[13px] rounded-full border-2 border-ink bg-[#9a9a9a] ${className}`} aria-hidden="true">
      <span className="absolute bottom-[1px] left-1/2 top-[1px] w-[2px] -translate-x-1/2 bg-ink" />
      <span className="absolute left-[1px] right-[1px] top-1/2 h-[2px] -translate-y-1/2 bg-ink" />
    </span>
  )
}

/** Battery cover: a ridged slide-off panel. Decorative. */
function BatteryCover() {
  return (
    <div
      className="relative mt-3 h-[68px] rounded-lg border-[3px] border-ink"
      style={{ background: 'var(--shell-dark)', boxShadow: 'inset 0 -4px 0 0 color-mix(in oklab, var(--shell) 60%, #111111)' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-6 bottom-3 top-3 rounded"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 8px, rgba(17,17,17,0.35) 8px 11px)' }}
      />
      <div className="absolute left-2 top-1 flex items-center gap-1 font-tiny text-[7px] uppercase text-paper">
        <span>▲</span>
        <span>Open</span>
      </div>
      <div className="absolute bottom-1 right-2 font-tiny text-[7px] uppercase text-paper/80">4 × AA · not included</div>
    </div>
  )
}

/** Rows of a spec label: part number on the left, value on the right. */
function Spec({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-[1px] font-mono text-[10px] leading-[13px]">
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="uppercase text-ink/60">{r.k}</dt>
          <dd className="truncate">{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * The back of the device: screws, a battery cover and the specification
 * label, which is where the colophon is printed. Sized to the front face, so
 * nothing here scrolls; keep the content short.
 */
export function Back() {
  const { state, navigateTo, unlock } = useDevice()
  const showing = state.page.kind === 'colophon'

  useEffect(() => {
    if (showing) unlock('flip')
  }, [showing, unlock])

  return (
    <div
      className="plastic relative flex h-full flex-col overflow-hidden rounded-[26px] rounded-bl-[72px] px-6 pb-6 pt-5"
      style={{ width: 380 }}
      aria-hidden={!showing}
      inert={!showing}
    >
      <Screw className="left-2.5 top-2.5" />
      <Screw className="right-2.5 top-2.5" />
      <Screw className="bottom-7 left-7" />
      <Screw className="bottom-2.5 right-2.5" />

      <div className="mt-3 flex items-baseline justify-between px-3">
        <span className="font-display text-[22px]" style={{ color: 'var(--shell-dark)' }}>
          {colophon.deviceName}
        </span>
        <span className="on-shell font-tiny text-[7px] uppercase opacity-70">{colophon.deviceTagline}</span>
      </div>
      <div className="on-shell mt-0.5 px-3 font-tiny text-[7px] uppercase opacity-70">Model KHEL-1 · Designed in Kathmandu</div>

      <BatteryCover />

      <div className="relative mt-3 shrink-0 overflow-hidden border-[3px] border-ink bg-paper p-3 text-ink" style={{ boxShadow: '3px 3px 0 0 rgba(17,17,17,0.35)' }}>
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-1">
          <span className="font-tiny text-[8px] uppercase">Specification label</span>
          <span className="font-tiny text-[7px] uppercase text-ink/60">Portfolio system</span>
        </div>

        <div className="mt-2 font-tiny text-[7px] uppercase text-ink/60">Main board</div>
        <Spec rows={colophon.stack.map((c) => ({ k: c.part, v: c.value }))} />

        <div className="mt-2 font-tiny text-[7px] uppercase text-ink/60">ROM · type</div>
        <Spec rows={colophon.fonts.map((f) => ({ k: f.role, v: f.value }))} />

        <ul className="mt-2 space-y-[1px] border-t-2 border-dotted border-ink pt-1.5 font-tiny text-[7px] uppercase">
          {colophon.credits.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="font-tiny text-[7px] uppercase">
            <div className="text-ink/60">Serial</div>
            <div>KHL1-2026-001</div>
          </div>
          <div
            className="h-[16px] w-[84px]"
            aria-hidden="true"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #111 0 2px, transparent 2px 3px, #111 3px 4px, transparent 4px 6px, #111 6px 9px, transparent 9px 11px)' }}
          />
          <div className="flex items-center gap-1 font-tiny text-[7px] uppercase">
            <span className="text-ink/60">Test pad</span>
            <span>{colophon.secretHint}</span>
            <span className="inline-block h-2 w-2 rounded-full border border-ink bg-butter" aria-hidden="true" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigateTo('/')}
        className="focus-ring mt-auto self-center border-[3px] border-ink bg-paper px-3 py-1 font-tiny text-[9px] uppercase shadow-hard-sm active:translate-y-[2px] active:shadow-none"
      >
        Flip back (B)
      </button>
    </div>
  )
}
