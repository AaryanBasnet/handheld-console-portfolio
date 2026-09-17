import { useEffect, useRef, type ReactNode } from 'react'
import { useDevice } from '../device/DeviceProvider'

interface Props {
  title?: ReactNode
  right?: ReactNode
  hint?: ReactNode
  children: ReactNode
  /** register the body as the d-pad scroll target */
  scroll?: boolean
  className?: string
  /** suppress the automatic "Select: manual" note, for screens with no manual to open */
  noManualHint?: boolean
}

/**
 * Header bar, scrollable body, footer hint. Every system screen uses it.
 * Select opens the loaded cartridge's manual from anywhere it's loaded, so
 * the hint mentions that automatically instead of every screen restating it.
 */
export function ScreenFrame({ title, right, hint, children, scroll = true, className = '', noManualHint = false }: Props) {
  const { scrollRef, state } = useDevice()
  const showManualHint = !noManualHint && !!state.cart.inserted && !state.manualOpen
  const fullHint = hint && showManualHint ? (
    <>
      {hint} · Select: manual
    </>
  ) : (
    hint ?? (showManualHint ? 'Select: manual' : undefined)
  )
  return (
    <div className={`absolute inset-0 flex flex-col ${className}`}>
      {title !== undefined && (
        <div
          className="t-xs flex items-center justify-between gap-2 px-[4cqw] py-[2cqw] uppercase tracking-wide"
          style={{ borderBottom: '2px solid var(--lcd-fg)' }}
        >
          <span className="truncate font-bold">{title}</span>
          {right && <span className="shrink-0 opacity-80">{right}</span>}
        </div>
      )}
      <div
        ref={scroll ? (el) => { scrollRef.current = el } : undefined}
        className="lcd-text t-sm no-scrollbar min-h-0 flex-1 overflow-y-auto px-[4cqw] py-[3cqw]"
      >
        {children}
      </div>
      {fullHint && (
        <div className="t-xs px-[4cqw] pb-[2.5cqw] pt-[1cqw] uppercase opacity-80" style={{ borderTop: '2px dotted var(--lcd-mid)' }}>
          {fullHint}
        </div>
      )}
    </div>
  )
}

/** A selectable row for lists driven by the d-pad, also clickable. */
export function Row({
  selected,
  onClick,
  children,
  right,
  sub,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  right?: ReactNode
  /** small plain-language gloss shown under the label, not uppercased */
  sub?: ReactNode
}) {
  const ref = useRef<HTMLLIElement>(null)
  // lists longer than the screen: keep the highlighted row in view as the
  // d-pad moves it, otherwise the last rows sit hidden below the fold
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  return (
    <li ref={ref}>
      <button
        type="button"
        onClick={onClick}
        aria-current={selected ? 'true' : undefined}
        className="flex w-full items-center gap-[2cqw] px-[2cqw] py-[1cqw] text-left uppercase focus-visible:outline-2 focus-visible:outline-current"
        style={selected ? { background: 'var(--lcd-fg)', color: 'var(--lcd-bg)' } : undefined}
      >
        <span className="w-[4cqw] shrink-0">{selected ? '▶' : ''}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate">{children}</span>
          {sub && <span className="t-xs block truncate normal-case opacity-70">{sub}</span>}
        </span>
        {right && <span className="t-xs shrink-0 opacity-80">{right}</span>}
      </button>
    </li>
  )
}
