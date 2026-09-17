import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { CartId, Cartridge } from '../content/cartridges'

export interface CartProps {
  cart: Cartridge
}

type CartModule = LazyExoticComponent<ComponentType<CartProps>>

/** One lazy chunk per cartridge. Nothing here loads until the cart boots. */
export const cartModules: Record<CartId, CartModule> = {
  tia: lazy(() => import('./tia/TiaCart')),
  crowdshield: lazy(() => import('./crowdshield/CrowdShieldCart')),
  venure: lazy(() => import('./venure/VenureCart')),
  ripe: lazy(() => import('./ripe/RipeCart')),
  crownhour: lazy(() => import('./crownhour/CrownHourCart')),
  sweetnest: lazy(() => import('./sweetnest/SweetNestCart')),
  devkit: lazy(() => import('./devkit/DevKitCart')),
}
