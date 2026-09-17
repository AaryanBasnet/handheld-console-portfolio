import { useEffect, useRef, type ReactNode } from 'react'
import { useDevice } from './DeviceProvider'
import { cartById } from '../content/cartridges'
import { CartArt } from './Cartridge'

/** Highlights TODO markers so placeholders are impossible to miss. */
export function Todo({ text }: { text: string }) {
  if (!text.includes('TODO')) return <>{text}</>
  const parts = text.split(/(TODO)/)
  return (
    <>
      {parts.map((p, i) =>
        p === 'TODO' ? (
          <mark key={i} className="bg-tomato px-1 font-mono text-[0.85em] font-medium text-paper">
            TODO
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 border-b-2 border-ink font-sans text-[11px] font-semibold uppercase tracking-wider">{heading}</h3>
      {children}
    </section>
  )
}

/** The instruction booklet for the inserted cartridge. Opened with Select. */
export function Manual({ handheld }: { handheld: boolean }) {
  const { state, openManual, manualScrollRef } = useDevice()
  const cart = cartById(state.cart.inserted ?? undefined)
  const open = state.manualOpen && !!cart
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open || !cart) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${cart.title} instruction booklet`}
      className={
        handheld
          ? 'fixed inset-0 z-50 flex flex-col bg-paper'
          : 'booklet booklet-in booklet-desk absolute right-full top-0 mr-8 flex h-full w-[400px] flex-col'
      }
    >
      <header className="flex items-start justify-between gap-3 border-b-[3px] border-ink px-5 py-4" style={{ background: cart.label.bg, color: cart.label.fg }}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0">
            <CartArt id={cart.id} accent={cart.label.accent} fg={cart.label.fg} />
          </div>
          <div>
            <div className="font-tiny text-[8px] uppercase opacity-80">Instruction booklet</div>
            <h2 className="font-display text-2xl leading-none">{cart.title}</h2>
            <div className="mt-1 font-sans text-xs">
              {cart.tag} · {cart.status}
            </div>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={() => openManual(false)}
          aria-label="Close manual"
          className="focus-ring h-8 w-8 shrink-0 border-[3px] border-ink bg-paper font-display text-base leading-none text-ink shadow-hard-sm active:translate-y-[2px] active:shadow-none"
        >
          ×
        </button>
      </header>

      <div ref={(el) => { manualScrollRef.current = el }} className="min-h-0 flex-1 overflow-y-auto px-6 py-5 font-sans text-[15px] leading-relaxed">
        {cart.manual.map((s) => (
          <Section key={s.heading} heading={s.heading}>
            {s.body?.map((p, i) => (
              <p key={i} className="mb-2">
                <Todo text={p} />
              </p>
            ))}
            {s.bullets && (
              <ul className="list-disc space-y-1 pl-5">
                {s.bullets.map((b, i) => (
                  <li key={i}>
                    <Todo text={b} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        ))}
        <Section heading="Stack">
          <ul className="flex flex-wrap gap-1.5">
            {cart.stack.map((s) => (
              <li key={s} className="border-2 border-ink px-2 py-0.5 font-mono text-xs">
                {s}
              </li>
            ))}
          </ul>
        </Section>
        {cart.links.length > 0 && (
          <Section heading="Links">
            <ul className="space-y-1 font-mono text-sm">
              {cart.links.map((l) => (
                <li key={l.label}>
                  {l.href && l.href !== 'TODO' ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-2">
                      {l.label}
                    </a>
                  ) : (
                    <span>
                      {l.label}: <Todo text="TODO" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <footer className="border-t-[3px] border-ink px-5 py-2 font-mono text-[11px] text-ink/80">
        Select or B: close · ↑↓: scroll · Esc: close
      </footer>
    </div>
  )
}
