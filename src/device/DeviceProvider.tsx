import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router'
import { deviceReducer, initialState, menuItems, type Action, type Button, type DeviceState, type Page } from './deviceReducer'
import { cartById, cartridges, devicePalettes, secretSequence, shellColors, type CartId, type Cartridge, type Palette } from '../content/cartridges'
import { achievements as achievementList } from '../content/achievements'
import { profile } from '../content/profile'
import { sfx, setVolume as setSynthVolume, unlockAudio } from '../audio/synth'
import { vibrate } from '../input/haptics'
import { useKeyboard } from '../input/useKeyboard'
import { useGamepad } from '../input/useGamepad'
import { load, save } from '../lib/storage'
import { prefersReducedMotion, useReducedMotion } from '../hooks/useReducedMotion'

/** A cartridge screen returns true when it handled the button. */
export type InputListener = (b: Button) => boolean | void

export interface DeviceApi {
  state: DeviceState
  dispatch: Dispatch<Action>
  reducedMotion: boolean
  /** press a hardware button (from on-screen, keyboard or gamepad) */
  press: (b: Button) => void
  subscribeInput: (fn: InputListener) => () => void
  subscribeAnyInput: (fn: (b: Button) => void) => () => void
  powerToggle: () => void
  /** seats a cartridge in the slot only; never plays it on its own */
  insertCart: (id: CartId) => void
  /** seats the cartridge if needed, then plays it — the one action that launches a game */
  playCart: (id: CartId) => void
  eject: () => void
  openManual: (open: boolean) => void
  setVolume: (v: number) => void
  cyclePalette: () => void
  setShell: (hex: string) => void
  palette: Palette
  paletteList: Palette[]
  /** cartridges the shelf can show (hidden one only once unlocked) */
  available: Cartridge[]
  unlock: (id: string) => void
  unlocked: string[]
  markBooted: (id: CartId) => void
  bootedCarts: string[]
  navigateTo: (to: string) => void
  announce: (text: string) => void
  announcement: string
  /** element the d-pad scrolls on system pages */
  scrollRef: React.MutableRefObject<HTMLElement | null>
  manualScrollRef: React.MutableRefObject<HTMLElement | null>
  /** mouse/touch shortcut: choose a menu row directly */
  activateMenu: (index: number) => void
  activateCartList: (index: number) => void
}

const DeviceContext = createContext<DeviceApi | null>(null)

export function useDevice(): DeviceApi {
  const ctx = useContext(DeviceContext)
  if (!ctx) throw new Error('useDevice must be used inside DeviceProvider')
  return ctx
}

export function pageFromPath(pathname: string): Page | null {
  if (pathname === '/' || pathname === '') return { kind: 'home' }
  if (pathname === '/about') return { kind: 'about' }
  if (pathname === '/contact') return { kind: 'contact' }
  if (pathname === '/colophon') return { kind: 'colophon' }
  const m = matchPath('/cart/:id', pathname)
  const cart = cartById(m?.params.id)
  if (cart) return { kind: 'cart', id: cart.id }
  return null
}

interface SavedSettings {
  volume?: number
  paletteIndex?: number
  shell?: string
  secretUnlocked?: boolean
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  const [state, dispatch] = useReducer(deviceReducer, null, () =>
    initialState(pageFromPath(location.pathname) ?? { kind: 'home' }, load<SavedSettings>('settings', {}), prefersReducedMotion()),
  )
  const stateRef = useRef(state)
  stateRef.current = state
  if (import.meta.env.DEV) (window as unknown as { __khel: DeviceState }).__khel = state

  const navRef = useRef(navigate)
  navRef.current = navigate
  const reducedRef = useRef(reducedMotion)
  reducedRef.current = reducedMotion

  const listeners = useRef<Set<InputListener>>(new Set())
  /** notified on every press, any page (idle detection, input monitor) */
  const anyListeners = useRef<Set<(b: Button) => void>>(new Set())
  const scrollRef = useRef<HTMLElement | null>(null)
  const manualScrollRef = useRef<HTMLElement | null>(null)
  const history = useRef<Button[]>([])

  const unlockedRef = useRef<string[]>(load<string[]>('achievements', []))
  const [unlocked, setUnlocked] = useState<string[]>(unlockedRef.current)
  const bootedRef = useRef<string[]>(load<string[]>('booted', []))
  const [bootedCarts, setBootedCarts] = useState<string[]>(bootedRef.current)
  const [announcement, setAnnouncement] = useState('')

  /* ---------- URL -> state ---------- */
  useEffect(() => {
    const page = pageFromPath(location.pathname)
    if (!page) {
      navigate('/', { replace: true })
      return
    }
    dispatch({ type: 'ROUTE', page })
  }, [location.pathname, navigate])

  /* ---------- persistence ---------- */
  useEffect(() => {
    save('settings', {
      volume: state.volume,
      paletteIndex: state.paletteIndex,
      shell: state.shell,
      secretUnlocked: state.secretUnlocked,
    })
  }, [state.volume, state.paletteIndex, state.shell, state.secretUnlocked])

  useEffect(() => {
    setSynthVolume(state.volume)
  }, [state.volume])

  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--shell', state.shell)
    // captions printed straight on the shell plastic need a matching contrast
    // colour, since a dark shell (Cobalt) needs light text and the rest dark
    root.setProperty('--shell-ink', shellColors.find((c) => c.value === state.shell)?.ink ?? '#111111')
  }, [state.shell])

  useEffect(() => {
    if (!state.toast) return
    const t = window.setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 2400)
    return () => window.clearTimeout(t)
  }, [state.toast])

  /* ---------- helpers ---------- */
  const toast = useCallback((text: string) => dispatch({ type: 'TOAST', text }), [])

  const unlock = useCallback(
    (id: string) => {
      if (unlockedRef.current.includes(id)) return
      const a = achievementList.find((x) => x.id === id)
      if (!a) return
      unlockedRef.current = [...unlockedRef.current, id]
      save('achievements', unlockedRef.current)
      setUnlocked(unlockedRef.current)
      toast(`★ ${a.title}`)
      sfx.achieve()
      vibrate([10, 40, 10])
    },
    [toast],
  )

  const navigateTo = useCallback((to: string) => navRef.current(to), [])

  const announce = useCallback((text: string) => setAnnouncement(text), [])

  const available = useMemo(
    () => cartridges.filter((c) => c.bin !== 'hidden' || state.secretUnlocked),
    [state.secretUnlocked],
  )

  const cartOnScreen = state.page.kind === 'cart' && state.cart.inserted === state.page.id ? cartById(state.page.id) : undefined
  const paletteList = useMemo(() => (cartOnScreen ? [cartOnScreen.palette, ...devicePalettes] : devicePalettes), [cartOnScreen])
  const palette = paletteList[state.paletteIndex % paletteList.length] ?? paletteList[0]

  const openManual = useCallback(
    (open: boolean) => {
      const s = stateRef.current
      if (open && !s.cart.inserted) {
        toast('NO CARTRIDGE')
        sfx.error()
        return
      }
      dispatch({ type: 'SET_MANUAL', open })
      if (open) {
        sfx.click()
        unlock('manual')
        const cart = cartById(s.cart.inserted ?? undefined)
        if (cart?.bin === 'bargain') unlock('bargain')
      } else sfx.back()
    },
    [toast, unlock],
  )

  // Inserting a cartridge (dragging or clicking it on the shelf) only ever
  // seats it in the slot. It never plays on its own — Start is the only
  // thing that ever launches a game, so pressing it always does something
  // visible instead of the game already being underway by the time you
  // think to press it.
  const insertCart = useCallback(
    (id: CartId) => {
      unlockAudio()
      const s = stateRef.current
      if (s.cart.seating || s.cart.inserted === id) return
      dispatch({ type: 'SEAT_CART', id })
      sfx.cartIn()
      vibrate([8, 40, 18])
      const dur = reducedRef.current ? 0 : 440
      window.setTimeout(() => {
        dispatch({ type: 'CART_SEATED' })
        unlock('insert')
        const title = cartById(id)?.title.toUpperCase() ?? 'CARTRIDGE'
        toast(`${title} LOADED · PRESS START`)
      }, dur)
    },
    [unlock, toast],
  )

  // The one action that actually launches a game: used by the in-menu
  // cartridge list (choosing from a list is a "play this" gesture) and by
  // the Start button everywhere else.
  const playCart = useCallback(
    (id: CartId) => {
      unlockAudio()
      const s = stateRef.current
      if (s.cart.seating) return
      if (s.cart.inserted === id) {
        navRef.current(`/cart/${id}`)
        return
      }
      dispatch({ type: 'SEAT_CART', id })
      sfx.cartIn()
      vibrate([8, 40, 18])
      const dur = reducedRef.current ? 0 : 440
      window.setTimeout(() => {
        dispatch({ type: 'CART_SEATED' })
        unlock('insert')
        navRef.current(`/cart/${id}`)
      }, dur)
    },
    [unlock],
  )

  const eject = useCallback(() => {
    const s = stateRef.current
    if (!s.cart.inserted && !s.cart.seating) return
    unlockAudio()
    dispatch({ type: 'EJECT' })
    sfx.cartOut()
    vibrate(12)
    if (s.page.kind === 'cart') navRef.current('/')
  }, [])

  const powerToggle = useCallback(() => {
    unlockAudio()
    const s = stateRef.current
    if (s.power === 'off') {
      dispatch({ type: 'POWER_ON', instant: reducedRef.current })
      sfx.power()
      vibrate(15)
      unlock('power')
    } else {
      dispatch({ type: 'POWER_OFF' })
      sfx.powerOff()
      vibrate(8)
    }
  }, [unlock])

  const markBooted = useCallback(
    (id: CartId) => {
      dispatch({ type: 'CART_BOOTED', id })
      if (!bootedRef.current.includes(id)) {
        bootedRef.current = [...bootedRef.current, id]
        save('booted', bootedRef.current)
        setBootedCarts(bootedRef.current)
      }
      const shelf = cartridges.filter((c) => c.bin === 'shelf').map((c) => c.id)
      if (shelf.every((c) => bootedRef.current.includes(c))) unlock('collector')
    },
    [unlock],
  )

  const setVolume = useCallback((v: number) => {
    unlockAudio()
    dispatch({ type: 'SET_VOLUME', volume: v })
    sfx.wheel()
  }, [])

  const paletteCountRef = useRef(paletteList.length)
  paletteCountRef.current = paletteList.length
  const cyclePalette = useCallback(() => {
    unlockAudio()
    dispatch({ type: 'CYCLE_PALETTE', count: paletteCountRef.current })
    sfx.wheel()
    unlock('palette')
  }, [unlock])

  const setShell = useCallback((hex: string) => {
    dispatch({ type: 'SET_SHELL', shell: hex })
    sfx.click()
  }, [])

  const subscribeInput = useCallback((fn: InputListener) => {
    listeners.current.add(fn)
    return () => {
      listeners.current.delete(fn)
    }
  }, [])

  const subscribeAnyInput = useCallback((fn: (b: Button) => void) => {
    anyListeners.current.add(fn)
    return () => {
      anyListeners.current.delete(fn)
    }
  }, [])

  const runMenuItem = useCallback(
    (index: number) => {
      const s = stateRef.current
      const insertedTitle = cartById(s.cart.inserted ?? undefined)?.title ?? null
      const item = menuItems(s, insertedTitle)[index]
      if (!item) return
      sfx.confirm()
      if (item.id === 'carts') dispatch({ type: 'HOME_VIEW', view: 'cartList' })
      else if (item.id === 'trophies') dispatch({ type: 'HOME_VIEW', view: 'trophies' })
      else if (item.to) navRef.current(item.to)
    },
    [],
  )

  const activateMenu = useCallback(
    (index: number) => {
      unlockAudio()
      if (stateRef.current.power !== 'on') return
      dispatch({ type: 'MENU_SET', index })
      runMenuItem(index)
    },
    [runMenuItem],
  )

  const activateCartList = useCallback(
    (index: number) => {
      const s = stateRef.current
      if (s.power !== 'on') return
      const list = cartridges.filter((c) => c.bin !== 'hidden' || s.secretUnlocked)
      dispatch({ type: 'LIST_SET', index })
      const cart = list[index]
      if (cart) playCart(cart.id)
    },
    [playCart],
  )

  /* ---------- the button press router ---------- */
  const press = useCallback(
    (b: Button) => {
      unlockAudio()
      vibrate(6)
      const s = stateRef.current
      anyListeners.current.forEach((fn) => fn(b))

      // secret sequence, checked on every press
      history.current = [...history.current.slice(-(secretSequence.length - 1)), b]
      if (!s.secretUnlocked && history.current.length === secretSequence.length && history.current.every((x, i) => x === secretSequence[i])) {
        dispatch({ type: 'UNLOCK_SECRET' })
        unlock('secret')
        toast('DEV KIT UNLOCKED')
      }

      if (s.power !== 'on') {
        // any button on a dark console turns it on: it's what everyone tries
        // first, so it should work. Start also opens the menu once booted.
        if (s.power === 'off') {
          dispatch({ type: 'POWER_ON', instant: reducedRef.current })
          if (b === 'start') dispatch({ type: 'HOME_VIEW', view: 'menu' })
          sfx.power()
          vibrate(15)
          unlock('power')
        }
        return
      }

      if (s.manualOpen) {
        if (b === 'select' || b === 'b') openManual(false)
        else if (b === 'up' || b === 'down') manualScrollRef.current?.scrollBy({ top: b === 'up' ? -80 : 80, behavior: reducedRef.current ? 'auto' : 'smooth' })
        return
      }

      if (b === 'select') {
        openManual(true)
        return
      }

      const page = s.page

      // Start's one job, everywhere: get you to a game. A always does
      // whatever is highlighted on screen; Start skips straight past that to
      // actual play, whether or not anything is highlighted yet:
      //  - a cartridge is loaded  -> play it, from wherever you are
      //  - nothing is loaded yet  -> jump straight to the cartridge list,
      //    skipping the menu, so it's never just a duplicate of A
      // It steps aside in two places: on the title screen, where Start only
      // opens the menu (a loaded cartridge is never launched straight from
      // "Press Start"), and once you're already inside a cartridge, so that
      // cartridge's own use of Start (TIA's language toggle, etc.) still works.
      const alreadyInThatCart = page.kind === 'cart' && page.id === s.cart.inserted
      const alreadyOnCartList = page.kind === 'home' && s.homeView === 'cartList'
      const onTitle = page.kind === 'home' && s.homeView === 'title'
      if (b === 'start' && !alreadyInThatCart && !onTitle) {
        if (s.cart.inserted) {
          sfx.confirm()
          navRef.current(`/cart/${s.cart.inserted}`)
          return
        }
        if (!alreadyOnCartList) {
          sfx.confirm()
          dispatch({ type: 'HOME_VIEW', view: 'cartList' })
          if (page.kind !== 'home') navRef.current('/')
          return
        }
        // already browsing the list with nothing loaded: fall through below,
        // where Start plays the highlighted cartridge, same as A would
      }

      if (page.kind === 'home') {
        const insertedTitle = cartById(s.cart.inserted ?? undefined)?.title ?? null
        if (s.homeView === 'title') {
          if (b === 'start' || b === 'a') {
            dispatch({ type: 'HOME_VIEW', view: 'menu' })
            sfx.confirm()
          } else sfx.tick()
          return
        }
        if (s.homeView === 'menu') {
          const items = menuItems(s, insertedTitle)
          if (b === 'up' || b === 'down') {
            dispatch({ type: 'MENU_MOVE', delta: b === 'up' ? -1 : 1, count: items.length })
            sfx.tick()
          } else if (b === 'a' || b === 'start') {
            runMenuItem(s.menuIndex)
          } else if (b === 'b') {
            dispatch({ type: 'HOME_VIEW', view: 'title' })
            sfx.back()
          }
          return
        }
        if (s.homeView === 'cartList') {
          const list = cartridges.filter((c) => c.bin !== 'hidden' || s.secretUnlocked)
          if (b === 'up' || b === 'down') {
            dispatch({ type: 'LIST_MOVE', delta: b === 'up' ? -1 : 1, count: list.length })
            sfx.tick()
          } else if (b === 'a' || b === 'start') {
            const cart = list[s.listIndex]
            if (cart) playCart(cart.id)
          } else if (b === 'b') {
            dispatch({ type: 'HOME_VIEW', view: 'menu' })
            sfx.back()
          }
          return
        }
        if (s.homeView === 'trophies') {
          if (b === 'up' || b === 'down') scrollRef.current?.scrollBy({ top: b === 'up' ? -40 : 40 })
          else {
            dispatch({ type: 'HOME_VIEW', view: 'menu' })
            sfx.back()
          }
          return
        }
      }

      if (page.kind === 'about' || page.kind === 'contact' || page.kind === 'colophon') {
        if (b === 'up' || b === 'down') scrollRef.current?.scrollBy({ top: b === 'up' ? -40 : 40 })
        else if (page.kind === 'about' && b === 'a') {
          // the save file's one action: open the other portfolio
          sfx.confirm()
          window.open(profile.otherPortfolio.url, '_blank', 'noopener')
        } else if (b === 'b' || b === 'start' || b === 'a') {
          sfx.back()
          navRef.current('/')
        }
        return
      }

      if (page.kind === 'cart') {
        if (s.cart.inserted !== page.id) {
          // slot screen: this page's cartridge was swapped out or ejected
          if (b === 'b') {
            sfx.back()
            navRef.current('/')
          }
          return
        }
        if (s.cart.booted !== page.id) return // still booting
        let consumed = false
        for (const fn of Array.from(listeners.current).reverse()) {
          if (fn(b) === true) {
            consumed = true
            break
          }
        }
        if (!consumed && b === 'b') {
          sfx.back()
          navRef.current('/')
        }
      }
    },
    [playCart, openManual, toast, unlock, runMenuItem],
  )

  const onEscape = useCallback(() => {
    const s = stateRef.current
    if (s.manualOpen) openManual(false)
    else if (s.page.kind !== 'home') navRef.current('/')
  }, [openManual])

  const onGamepadFirstUse = useCallback(() => unlock('gamepad'), [unlock])

  useKeyboard(press, onEscape)
  useGamepad(press, onGamepadFirstUse)

  // deep links power on without a click; still counts
  useEffect(() => {
    if (stateRef.current.power !== 'off') unlock('power')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const api: DeviceApi = {
    state,
    dispatch,
    reducedMotion,
    press,
    subscribeInput,
    subscribeAnyInput,
    powerToggle,
    insertCart,
    playCart,
    eject,
    openManual,
    setVolume,
    cyclePalette,
    setShell,
    palette,
    paletteList,
    available,
    unlock,
    unlocked,
    markBooted,
    bootedCarts,
    navigateTo,
    announce,
    announcement,
    scrollRef,
    manualScrollRef,
    activateMenu,
    activateCartList,
  }

  return <DeviceContext.Provider value={api}>{children}</DeviceContext.Provider>
}

/** Subscribe a cartridge screen to button presses. Return true to consume. */
export function useCartInput(handler: InputListener) {
  const { subscribeInput } = useDevice()
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => subscribeInput((b) => ref.current(b)), [subscribeInput])
}

/** Called on every button press on any page. */
export function useAnyInput(handler: (b: Button) => void) {
  const { subscribeAnyInput } = useDevice()
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => subscribeAnyInput((b) => ref.current(b)), [subscribeAnyInput])
}

/** Announce a screen for assistive tech when it mounts. */
export function useAnnounce(text: string) {
  const { announce } = useDevice()
  useEffect(() => {
    announce(text)
  }, [announce, text])
}
