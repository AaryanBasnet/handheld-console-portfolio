import type { CartId } from '../content/cartridges'

/** Hardware buttons */
export type Button = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select'

/** Which part of the device is showing; mirrored from the URL */
export type Page =
  | { kind: 'home' }
  | { kind: 'about' }
  | { kind: 'contact' }
  | { kind: 'colophon' }
  | { kind: 'cart'; id: CartId }

export type HomeView = 'title' | 'menu' | 'cartList' | 'trophies'

export interface DeviceState {
  power: 'off' | 'booting' | 'on'
  page: Page
  homeView: HomeView
  menuIndex: number
  listIndex: number
  cart: {
    /** cartridge physically in the slot */
    inserted: CartId | null
    /** cartridge mid-animation into the slot */
    seating: CartId | null
    /** cartridge whose boot screen has finished */
    booted: CartId | null
  }
  manualOpen: boolean
  volume: number
  /** index into [cart palette?, ...devicePalettes] */
  paletteIndex: number
  shell: string
  secretUnlocked: boolean
  toast: { text: string; key: number } | null
  /** bumps every time a system screen changes; used to replay the LCD swap effect */
  swap: number
}

export type Action =
  | { type: 'POWER_ON'; instant: boolean }
  | { type: 'BOOT_DONE' }
  | { type: 'POWER_OFF' }
  | { type: 'ROUTE'; page: Page }
  | { type: 'HOME_VIEW'; view: HomeView }
  | { type: 'MENU_MOVE'; delta: number; count: number }
  | { type: 'LIST_MOVE'; delta: number; count: number }
  | { type: 'MENU_SET'; index: number }
  | { type: 'LIST_SET'; index: number }
  | { type: 'SEAT_CART'; id: CartId }
  | { type: 'CART_SEATED' }
  | { type: 'CART_BOOTED'; id: CartId }
  | { type: 'EJECT' }
  | { type: 'SET_MANUAL'; open: boolean }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'CYCLE_PALETTE'; count: number }
  | { type: 'SET_PALETTE'; index: number }
  | { type: 'SET_SHELL'; shell: string }
  | { type: 'UNLOCK_SECRET' }
  | { type: 'TOAST'; text: string }
  | { type: 'CLEAR_TOAST' }

export function initialState(page: Page, saved: Partial<Pick<DeviceState, 'volume' | 'paletteIndex' | 'shell' | 'secretUnlocked'>>, instant: boolean): DeviceState {
  const deepLinked = page.kind !== 'home'
  return {
    power: deepLinked ? (instant ? 'on' : 'booting') : 'off',
    page,
    homeView: 'title',
    menuIndex: 0,
    listIndex: 0,
    cart: {
      inserted: page.kind === 'cart' ? page.id : null,
      seating: null,
      booted: null,
    },
    manualOpen: false,
    volume: saved.volume ?? 0.6,
    paletteIndex: saved.paletteIndex ?? 0,
    shell: saved.shell ?? '#ffe45e',
    secretUnlocked: saved.secretUnlocked ?? false,
    toast: null,
    swap: 0,
  }
}

const wrap = (i: number, n: number) => (n === 0 ? 0 : ((i % n) + n) % n)

export function deviceReducer(s: DeviceState, a: Action): DeviceState {
  switch (a.type) {
    case 'POWER_ON':
      if (s.power !== 'off') return s
      return { ...s, power: a.instant ? 'on' : 'booting', homeView: 'title', manualOpen: false, swap: s.swap + 1 }
    case 'BOOT_DONE':
      return s.power === 'booting' ? { ...s, power: 'on', swap: s.swap + 1 } : s
    case 'POWER_OFF':
      return { ...s, power: 'off', homeView: 'title', manualOpen: false, cart: { ...s.cart, booted: null, seating: null } }
    case 'ROUTE': {
      const next: DeviceState = { ...s, page: a.page, swap: s.swap + 1 }
      if (a.page.kind === 'cart') {
        // deep link or menu navigation: make sure the cart is in the slot, and boot it fresh
        next.cart = { inserted: a.page.id, seating: null, booted: null }
      }
      if (a.page.kind === 'home' && s.page.kind !== 'home') next.homeView = 'menu'
      if (a.page.kind !== s.page.kind) next.paletteIndex = 0
      return next
    }
    case 'HOME_VIEW':
      return { ...s, homeView: a.view, listIndex: 0, swap: s.swap + 1 }
    case 'MENU_MOVE':
      return { ...s, menuIndex: wrap(s.menuIndex + a.delta, a.count) }
    case 'LIST_MOVE':
      return { ...s, listIndex: wrap(s.listIndex + a.delta, a.count) }
    case 'MENU_SET':
      return { ...s, menuIndex: a.index }
    case 'LIST_SET':
      return { ...s, listIndex: a.index }
    case 'SEAT_CART':
      // the manual belongs to the cartridge that just left the slot: close it,
      // otherwise it keeps swallowing Start for the one coming in
      return { ...s, cart: { inserted: null, seating: a.id, booted: null }, manualOpen: false }
    case 'CART_SEATED':
      if (!s.cart.seating) return s
      return { ...s, cart: { inserted: s.cart.seating, seating: null, booted: null }, menuIndex: 0 }
    case 'CART_BOOTED':
      return { ...s, cart: { ...s.cart, booted: a.id }, swap: s.swap + 1 }
    case 'EJECT':
      return { ...s, cart: { inserted: null, seating: null, booted: null }, manualOpen: false, menuIndex: 0, paletteIndex: 0 }
    case 'SET_MANUAL':
      return { ...s, manualOpen: a.open }
    case 'SET_VOLUME':
      return { ...s, volume: Math.max(0, Math.min(1, a.volume)) }
    case 'CYCLE_PALETTE':
      return { ...s, paletteIndex: wrap(s.paletteIndex + 1, a.count) }
    case 'SET_PALETTE':
      return { ...s, paletteIndex: a.index }
    case 'SET_SHELL':
      return { ...s, shell: a.shell }
    case 'UNLOCK_SECRET':
      return { ...s, secretUnlocked: true }
    case 'TOAST':
      return { ...s, toast: { text: a.text, key: (s.toast?.key ?? 0) + 1 } }
    case 'CLEAR_TOAST':
      return { ...s, toast: null }
    default:
      return s
  }
}

/** Menu entries on the home screen, derived from state */
export interface MenuItem {
  id: string
  label: string
  /** plain-language gloss shown under the in-fiction label */
  sub?: string
  to?: string
}

export function menuItems(s: DeviceState, insertedTitle: string | null): MenuItem[] {
  const items: MenuItem[] = []
  if (s.cart.inserted && insertedTitle) items.push({ id: 'play', label: `PLAY ${insertedTitle.toUpperCase()}`, to: `/cart/${s.cart.inserted}` })
  items.push({ id: 'carts', label: 'CARTRIDGES', sub: 'browse the projects' })
  items.push({ id: 'save', label: 'SAVE FILE', sub: 'about me', to: '/about' })
  items.push({ id: 'link', label: 'LINK CABLE', sub: 'contact', to: '/contact' })
  items.push({ id: 'flip', label: 'BACK OF DEVICE', sub: 'credits', to: '/colophon' })
  items.push({ id: 'trophies', label: 'ACHIEVEMENTS' })
  items.push({ id: 'plain', label: 'PLAIN VERSION', sub: 'everything, one page', to: '/plain' })
  return items
}
