import type { CSSProperties } from 'react'
import { useAnnounce, useDevice } from './DeviceProvider'
import { cartById, type Cartridge } from '../content/cartridges'
import { CartArt } from './Cartridge'
import { ScreenFrame } from '../screens/ScreenFrame'
import { BootScreen } from '../screens/BootScreen'
import { TitleScreen } from '../screens/TitleScreen'
import { MenuScreen } from '../screens/MenuScreen'
import { CartListScreen } from '../screens/CartListScreen'
import { TrophiesScreen } from '../screens/TrophiesScreen'
import { SaveFileScreen } from '../screens/SaveFileScreen'
import { LinkCableScreen } from '../screens/LinkCableScreen'
import { ColophonScreen } from '../screens/ColophonScreen'
import { CartBootScreen } from '../screens/CartBootScreen'
import { CartScreen } from '../screens/CartScreen'

/**
 * Shown on a cartridge's page when that cartridge is no longer the one in the
 * slot: another one was inserted over it, or it was ejected. Names the
 * cartridge that is loaded now and tells you Start plays it.
 */
function SlotScreen({ pageCart }: { pageCart: Cartridge }) {
  const { state } = useDevice()
  const seating = cartById(state.cart.seating ?? undefined)
  const loaded = cartById(state.cart.inserted ?? undefined)
  const cart = seating ?? loaded

  useAnnounce(
    !cart
      ? `${pageCart.title} was ejected. Insert a cartridge, or press Start for the list.`
      : seating
        ? `Inserting ${cart.title}.`
        : `${cart.title} is loaded. Press Start to play it.`,
  )

  if (!cart) {
    return (
      <ScreenFrame title={pageCart.title} right="Ejected" hint="Start: cartridges · B: menu" scroll={false} noManualHint>
        <div className="flex h-full flex-col items-center justify-center gap-[2cqw] text-center">
          <div className="t-md uppercase">Insert cartridge</div>
          <div className="t-xs uppercase opacity-80">Slot: empty</div>
        </div>
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame
      title="Cartridge changed"
      right={pageCart.title}
      hint={seating ? undefined : 'Start: play · B: menu'}
      scroll={false}
      noManualHint={!!seating}
    >
      <div className="flex h-full flex-col items-center justify-center gap-[2cqw] text-center">
        <div className="h-[20cqw] w-[20cqw]" style={{ color: 'var(--lcd-fg)' }}>
          <CartArt id={cart.id} accent="var(--lcd-accent)" fg="var(--lcd-fg)" />
        </div>
        <div className="font-display lcd-text t-lg uppercase">{cart.title}</div>
        {seating ? (
          <div className="t-sm blink uppercase">Inserting…</div>
        ) : (
          <>
            <div className="t-xs uppercase opacity-80">Loaded · {pageCart.title} unloaded</div>
            <div className="t-md blink uppercase">Press Start</div>
          </>
        )}
      </div>
    </ScreenFrame>
  )
}

function ScreenRouter() {
  const { state } = useDevice()
  if (state.power === 'booting') return <BootScreen />
  const { page } = state
  switch (page.kind) {
    case 'home':
      switch (state.homeView) {
        case 'title':
          return <TitleScreen />
        case 'menu':
          return <MenuScreen />
        case 'cartList':
          return <CartListScreen />
        case 'trophies':
          return <TrophiesScreen />
      }
      break
    case 'about':
      return <SaveFileScreen />
    case 'contact':
      return <LinkCableScreen />
    case 'colophon':
      return <ColophonScreen />
    case 'cart': {
      const cart = cartById(page.id)
      if (!cart) return null
      if (state.cart.inserted !== page.id) return <SlotScreen pageCart={cart} />
      if (state.cart.booted !== page.id) return <CartBootScreen cart={cart} />
      return <CartScreen cart={cart} />
    }
  }
  return null
}

/** The LCD. Palette comes from state; effects are pure CSS. */
export function Screen({ style }: { style?: CSSProperties }) {
  const { state, palette, reducedMotion, powerToggle } = useDevice()
  const off = state.power === 'off'
  const vars = {
    '--lcd-bg': palette.bg,
    '--lcd-fg': palette.fg,
    '--lcd-mid': palette.mid,
    '--lcd-accent': palette.accent,
    ...style,
  } as CSSProperties

  return (
    <div
      className={`lcd lcd-fx aspect-[10/9] w-full rounded-md border-[3px] border-[#050505] ${off ? 'lcd-off' : ''}`}
      style={vars}
      role="region"
      aria-label="Screen"
    >
      {off && (
        // a dark screen is the first thing everyone pokes: let that be the
        // power switch too, and print the instruction on the glass
        <button
          type="button"
          onClick={powerToggle}
          aria-label="Power on"
          className="absolute inset-0 z-[7] flex cursor-pointer flex-col items-center justify-center gap-[2cqw] focus-visible:outline-2 focus-visible:outline-[#8a9a80]"
        >
          <span className="t-sm font-tiny uppercase tracking-[0.15em] text-[#7f8c74]">Tap to power on</span>
          <span className="t-xs font-tiny uppercase tracking-[0.1em] text-[#5f6b57]">↖ or flip the switch</span>
        </button>
      )}
      {!off && (
        <div key={`p${state.power}`} className={`absolute inset-0 ${reducedMotion ? '' : 'lcd-power-on'}`}>
          <div key={state.swap} className={`absolute inset-0 ${reducedMotion ? '' : 'lcd-swap'}`}>
            <ScreenRouter />
          </div>
        </div>
      )}
    </div>
  )
}
