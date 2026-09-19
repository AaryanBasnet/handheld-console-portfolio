import { useEffect } from 'react'
import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { CartArt } from '../device/Cartridge'
import { sfx } from '../audio/synth'
import type { Cartridge } from '../content/cartridges'

/** Long enough to read the two-line tip; still "about a second". */
const BOOT_MS = 1400

/**
 * Startup screen for a cartridge: art, title, jingle, and a tip pointing at
 * the manual, worded for this cartridge. Then the program starts.
 */
export function CartBootScreen({ cart }: { cart: Cartridge }) {
  const { markBooted, reducedMotion } = useDevice()
  useAnnounce(`Booting ${cart.title}. Tip: Select opens the manual. ${cart.tip}`)

  useEffect(() => {
    sfx.jingle(cart.jingle)
    const t = window.setTimeout(() => markBooted(cart.id), reducedMotion ? 0 : BOOT_MS)
    return () => window.clearTimeout(t)
  }, [cart, markBooted, reducedMotion])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2.5cqw] p-[5cqw]">
      <div className="h-[22cqw] w-[22cqw]" style={{ color: 'var(--lcd-fg)' }}>
        <CartArt id={cart.id} accent="var(--lcd-accent)" fg="var(--lcd-fg)" />
      </div>
      <div className="font-display lcd-text t-lg uppercase">{cart.title}</div>
      <div className="t-xs uppercase opacity-80">
        {cart.tag} · {cart.status}
      </div>
      <div className="mt-[1cqw] h-[3cqw] w-[50%] overflow-hidden border-2 border-current" aria-hidden="true">
        <div
          className="h-full"
          style={{
            background: 'var(--lcd-fg)',
            animation: reducedMotion ? 'none' : `boot-bar ${BOOT_MS}ms steps(10) forwards`,
            width: reducedMotion ? '100%' : undefined,
          }}
        />
      </div>
      <p className="t-xs mt-[1cqw] text-center uppercase leading-snug" aria-hidden="true">
        <span className="block">Tip: Select opens the manual.</span>
        <span className="block opacity-80">{cart.tip}</span>
      </p>
    </div>
  )
}
