import { useRef, useState, type PointerEvent } from 'react'
import { useDevice } from './DeviceProvider'
import { Cartridge } from './Cartridge'
import { shellColors, type CartId, type Cartridge as CartData } from '../content/cartridges'

interface DragState {
  id: CartId
  x: number
  y: number
  w: number
}

function useCartDrag() {
  const { insertCart } = useDevice()
  const [drag, setDrag] = useState<DragState | null>(null)
  const start = useRef<{ id: CartId; x: number; y: number; ox: number; oy: number; w: number; moved: boolean } | null>(null)

  const overSlot = (x: number, y: number) => {
    const slot = document.getElementById('cart-slot')
    if (!slot) return false
    const r = slot.getBoundingClientRect()
    const pad = 60
    return x > r.left - pad && x < r.right + pad && y > r.top - pad - 40 && y < r.bottom + pad
  }

  const onDown = (e: PointerEvent<HTMLButtonElement>, id: CartId) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    start.current = { id, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current
    if (!s) return
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) s.moved = true
    if (!s.moved) return
    setDrag({ id: s.id, x: e.clientX - s.ox, y: e.clientY - s.oy, w: s.w })
    const slot = document.getElementById('cart-slot')
    if (slot) slot.dataset.over = String(overSlot(e.clientX, e.clientY))
  }
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current
    if (!s) return
    const slot = document.getElementById('cart-slot')
    if (slot) slot.dataset.over = 'false'
    if (!s.moved || overSlot(e.clientX, e.clientY)) insertCart(s.id)
    // a mouse/touch activation shouldn't leave this button "focused" for the
    // keyboard: otherwise the very next Enter (meant as the physical Start
    // button) gets swallowed as a redundant re-insert on this same cartridge
    e.currentTarget.blur()
    start.current = null
    setDrag(null)
  }
  const onCancel = () => {
    start.current = null
    setDrag(null)
  }
  return { drag, onDown, onMove, onUp, onCancel }
}

function ShelfCart({
  cart,
  width,
  sticker,
  dim,
  handlers,
}: {
  cart: CartData
  width: number
  sticker?: boolean
  dim: boolean
  handlers: ReturnType<typeof useCartDrag>
}) {
  const { state, insertCart } = useDevice()
  const inSlot = state.cart.inserted === cart.id || state.cart.seating === cart.id
  return (
    <button
      type="button"
      aria-label={`${cart.title}: ${cart.tag}. ${inSlot ? 'In the slot.' : 'Insert cartridge.'}`}
      onPointerDown={(e) => handlers.onDown(e, cart.id)}
      onPointerMove={handlers.onMove}
      onPointerUp={handlers.onUp}
      onPointerCancel={handlers.onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          insertCart(cart.id)
        }
      }}
      className="focus-ring block cursor-grab touch-none transition-transform hover:-translate-y-1 active:cursor-grabbing"
      style={{ opacity: dim || inSlot ? 0.35 : 1 }}
    >
      <Cartridge cart={cart} width={width} sticker={sticker} />
    </button>
  )
}

/** Desktop: a rack of cartridges beside the device, with a bargain bin below. */
export function Shelf() {
  const { available, state, setShell } = useDevice()
  const shelf = available.filter((c) => c.bin !== 'bargain')
  const bargain = available.filter((c) => c.bin === 'bargain')
  const handlers = useCartDrag()
  const { drag } = handlers
  const dragCart = drag ? available.find((c) => c.id === drag.id) : undefined

  return (
    <aside className="flex flex-col gap-5" aria-label="Cartridge shelf">
      <div className="border-[3px] border-ink bg-paper p-4 shadow-hard">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg">Shelf</h2>
          <span className="font-tiny text-[8px] uppercase text-ink/70">Drag or click to insert</span>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5">
          {shelf.map((c) => (
            <li key={c.id} className="flex justify-center">
              <ShelfCart cart={c} width={122} dim={!!drag && drag.id !== c.id} handlers={handlers} />
            </li>
          ))}
        </ul>
        <div className="mt-4 h-[6px] border-y-[3px] border-ink bg-[color-mix(in_oklab,var(--color-paper)_70%,#111)]" aria-hidden="true" />
      </div>

      <div className="relative border-[3px] border-ink bg-butter p-4 shadow-hard">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg">Bargain bin</h2>
          <span className="font-tiny text-[8px] uppercase text-ink/70">Small programs</span>
        </div>
        <ul className="flex items-end justify-around gap-2">
          {bargain.map((c, i) => (
            <li key={c.id} style={{ transform: `rotate(${i % 2 ? 5 : -6}deg)` }}>
              <ShelfCart cart={c} width={104} sticker dim={!!drag && drag.id !== c.id} handlers={handlers} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-2 shadow-hard-sm" role="group" aria-label="Shell colour">
        <span className="font-tiny text-[8px] uppercase">Shell</span>
        {shellColors.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setShell(c.value)}
            aria-pressed={state.shell === c.value}
            aria-label={c.name}
            className="focus-ring h-5 w-5 rounded-sm border-2 border-ink aria-pressed:outline aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-ink"
            style={{ background: c.value }}
          />
        ))}
      </div>

      {drag && dragCart && (
        <div className="pointer-events-none fixed z-[100]" style={{ left: drag.x, top: drag.y, transform: 'rotate(-4deg) scale(1.06)' }} aria-hidden="true">
          <Cartridge cart={dragCart} width={drag.w} />
        </div>
      )}
    </aside>
  )
}

