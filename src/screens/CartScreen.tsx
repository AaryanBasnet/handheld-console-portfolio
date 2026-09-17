import { Suspense } from 'react'
import { cartModules } from '../carts'
import type { Cartridge } from '../content/cartridges'

function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="t-sm blink uppercase">Loading…</span>
    </div>
  )
}

/** Mounts the lazily loaded program for the inserted cartridge. */
export function CartScreen({ cart }: { cart: Cartridge }) {
  const Program = cartModules[cart.id]
  return (
    <Suspense fallback={<Loading />}>
      <Program cart={cart} />
    </Suspense>
  )
}
