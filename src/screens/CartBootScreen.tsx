import { useEffect } from 'react'
import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { CartArt } from '../device/Cartridge'
import { sfx } from '../audio/synth'
import type { Cartridge } from '../content/cartridges'

/** Startup screen for a cartridge: art, title, jingle, then the program. */
export function CartBootScreen({ cart }: { cart: Cartridge }) {
  const { markBooted, reducedMotion } = useDevice()
  useAnnounce(`Booting ${cart.title}`)

  useEffect(() => {
    sfx.jingle(cart.jingle)
    const t = window.setTimeout(() => markBooted(cart.id), reducedMotion ? 0 : 1150)
    return () => window.clearTimeout(t)
  }, [cart, markBooted, reducedMotion])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqw] p-[6cqw]">
      <div className="h-[26cqw] w-[26cqw]" style={{ color: 'var(--lcd-fg)' }}>
        <CartArt id={cart.id} accent="var(--lcd-accent)" fg="var(--lcd-fg)" />
      </div>
      <div className="font-display lcd-text t-lg uppercase">{cart.title}</div>
      <div className="t-xs uppercase opacity-80">
        {cart.tag} · {cart.status}
      </div>
      <div className="mt-[2cqw] h-[3cqw] w-[50%] overflow-hidden border-2 border-current" aria-hidden="true">
        <div
          className="h-full"
          style={{
            background: 'var(--lcd-fg)',
            animation: reducedMotion ? 'none' : 'boot-bar 1.1s steps(10) forwards',
            width: reducedMotion ? '100%' : undefined,
          }}
        />
      </div>
    </div>
  )
}
