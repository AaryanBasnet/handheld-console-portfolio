import type { CSSProperties } from 'react'
import type { Cartridge as CartData } from '../content/cartridges'

/** Label pictograms, one per cartridge. Thick strokes, flat fills. */
export function CartArt({ id, accent, fg }: { id: CartData['id']; accent: string; fg: string }) {
  const stroke = fg
  const common = { stroke, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  switch (id) {
    case 'tia':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M6 30 L24 26 L40 12 L44 14 L32 30 L34 40 L30 40 L26 32 L18 34 L14 40 L11 39 L12 32 L6 30 Z" fill={accent} {...common} />
          <rect x="4" y="6" width="18" height="11" rx="2" fill={fg} stroke="none" />
          <path d="M8 17 L8 21 L12 17" fill={fg} stroke="none" />
        </svg>
      )
    case 'crowdshield':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 4 L42 10 V24 C42 34 33 41 24 44 C15 41 6 34 6 24 V10 Z" fill={accent} {...common} />
          <path d="M24 10 L24 40" {...common} strokeDasharray="4 3" />
          <path d="M14 18 L20 24 L16 30" fill="none" {...common} />
        </svg>
      )
    case 'venure':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M6 20 L24 6 L42 20 Z" fill={accent} {...common} />
          <rect x="10" y="20" width="28" height="22" fill={accent} {...common} />
          <rect x="14" y="24" width="4" height="18" fill={fg} stroke="none" />
          <rect x="22" y="24" width="4" height="18" fill={fg} stroke="none" />
          <rect x="30" y="24" width="4" height="18" fill={fg} stroke="none" />
        </svg>
      )
    case 'ripe':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="28" r="15" fill={accent} {...common} />
          <path d="M24 13 C20 8 14 8 12 10 C18 10 20 13 24 13 C28 13 30 10 36 10 C34 8 28 8 24 13 Z" fill={fg} stroke="none" />
          <path d="M24 13 L24 6" {...common} />
        </svg>
      )
    case 'crownhour':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect x="17" y="2" width="14" height="44" rx="3" fill={fg} stroke="none" />
          <circle cx="24" cy="24" r="13" fill={accent} {...common} />
          <path d="M24 16 L24 24 L29 28" fill="none" {...common} />
        </svg>
      )
    case 'sweetnest':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect x="6" y="30" width="36" height="12" rx="2" fill={accent} {...common} />
          <rect x="12" y="18" width="24" height="12" rx="2" fill={accent} {...common} />
          <rect x="18" y="8" width="12" height="10" rx="2" fill={accent} {...common} />
          <rect x="23" y="2" width="2" height="6" fill={fg} stroke="none" />
        </svg>
      )
    case 'devkit':
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect x="12" y="12" width="24" height="24" rx="2" fill={accent} {...common} />
          {[16, 22, 28, 34].map((p) => (
            <g key={p}>
              <path d={`M${p} 12 V4`} {...common} />
              <path d={`M${p} 36 V44`} {...common} />
              <path d={`M12 ${p} H4`} {...common} />
              <path d={`M36 ${p} H44`} {...common} />
            </g>
          ))}
        </svg>
      )
  }
}

interface Props {
  cart: CartData
  /** width in px; height follows */
  width?: number
  className?: string
  style?: CSSProperties
  /** show the small BIN sticker */
  sticker?: boolean
}

const shellFor = (cart: CartData) => (cart.bin === 'bargain' ? '#c9c9c9' : cart.bin === 'hidden' ? '#222222' : '#e6dfc6')

/** A physical-looking cartridge. Purely visual; wrap in a button for interaction. */
export function Cartridge({ cart, width = 150, className = '', style, sticker }: Props) {
  const h = Math.round(width * 0.82)
  return (
    <div
      className={`cart-shell ${className}`}
      style={{ width, height: h, background: shellFor(cart), ...style }}
      aria-hidden="true"
    >
      <div
        className="cart-label absolute overflow-hidden"
        style={{ left: '8%', right: '8%', top: '7%', height: '62%', background: cart.label.bg, color: cart.label.fg }}
      >
        <div className="absolute" style={{ left: '5%', top: '14%', width: '28%', height: '72%' }}>
          <CartArt id={cart.id} accent={cart.label.accent} fg={cart.label.fg} />
        </div>
        <div className="absolute" style={{ left: '36%', right: '4%', top: '12%' }}>
          {/* titles longer than 9 letters (CrowdShield) shrink to stay on the label */}
          <div className="font-pixel font-bold uppercase leading-none tracking-tight" style={{ fontSize: width * 0.088 * Math.min(1, 9 / cart.title.length) }}>
            {cart.title}
          </div>
          <div className="leading-tight opacity-90" style={{ fontSize: width * 0.052, marginTop: width * 0.03 }}>
            {cart.tag}
          </div>
        </div>
        <div
          className="absolute bottom-0 right-0 px-1 uppercase"
          style={{ background: cart.label.fg, color: cart.label.bg, fontSize: width * 0.045 }}
        >
          {cart.status}
        </div>
      </div>
      {sticker && (
        <div
          className="absolute -right-2 -top-2 rotate-12 border-2 border-ink bg-tomato px-1 font-tiny text-paper"
          style={{ fontSize: width * 0.06 }}
        >
          BIN
        </div>
      )}
    </div>
  )
}
