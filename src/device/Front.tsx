import { useDevice } from './DeviceProvider'
import { cartById } from '../content/cartridges'
import { colophon } from '../content/profile'
import { Screen } from './Screen'
import { ABButtons, DPad, StartSelect } from './Controls'
import { ContrastWheel, VolumeWheel } from './Wheels'
import { PowerSwitch } from './PowerSwitch'
import { Cartridge } from './Cartridge'

function LED({ on }: { on: boolean }) {
  return (
    <span
      className="inline-block h-[9px] w-[9px] rounded-full border-2 border-[#050505]"
      style={{ background: on ? 'var(--color-tomato)' : '#4a1a12' }}
      aria-hidden="true"
    />
  )
}

/** Small ticker on the bezel for achievements and system notes. */
function Toast() {
  const { state } = useDevice()
  return (
    <div role="status" aria-live="polite" className="min-h-[12px] max-w-[60%] truncate text-right font-tiny text-[9px] uppercase text-butter">
      {state.toast && (
        <span key={state.toast.key} className="inline-block" style={{ animation: 'toast-in 160ms steps(3) both' }}>
          {state.toast.text}
        </span>
      )}
    </div>
  )
}

function EjectButton({ className = '' }: { className?: string }) {
  const { state, eject } = useDevice()
  const has = !!(state.cart.inserted || state.cart.seating)
  return (
    <button
      type="button"
      onClick={eject}
      disabled={!has}
      aria-label="Eject cartridge"
      className={`focus-ring rounded-b-md border-x-[3px] border-b-[3px] border-ink px-2.5 pb-[4px] pt-[1px] font-tiny text-[10px] uppercase text-paper transition-transform active:translate-y-[2px] disabled:opacity-60 ${className}`}
      style={{ background: 'var(--shell-dark)' }}
    >
      Eject
    </button>
  )
}

function Speaker({ className = '' }: { className?: string }) {
  return (
    <div className={`flex -rotate-[28deg] gap-[5px] ${className}`} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="block h-[34px] w-[6px] rounded-full bg-ink" style={{ marginTop: i * 2 }} />
      ))}
    </div>
  )
}

/** Link cable port on the right edge; a cable plugs in on the contact page. */
function LinkPort({ className = '' }: { className?: string }) {
  const { state, reducedMotion } = useDevice()
  const linked = state.page.kind === 'contact'
  return (
    <div className={`${className}`} aria-hidden="true">
      <div className="relative h-[28px] w-[12px] rounded-r-sm border-[3px] border-l-0 border-ink bg-[#1a1a1a]">
        <span className="absolute left-[1px] top-[5px] h-[3px] w-[4px] bg-[#8a8a8a]" />
        <span className="absolute left-[1px] top-[14px] h-[3px] w-[4px] bg-[#8a8a8a]" />
      </div>
      <span className="shell-tag absolute -top-[16px] left-0">Link</span>
      {linked && (
        <svg className="absolute left-[9px] top-[-2px] overflow-visible" width="70" height="210" viewBox="0 0 70 210">
          {/* plug in the port, a cable curling down the gap, and the player 2 plug at the end */}
          <rect x="0" y="6" width="22" height="20" rx="2" fill="#3a3a3a" stroke="#111" strokeWidth="3" />
          <path
            d="M22 16 C 52 16, 44 70, 44 120 L 44 158"
            fill="none"
            stroke="#111"
            strokeWidth="7"
            strokeLinecap="round"
            style={reducedMotion ? undefined : { strokeDasharray: 220, strokeDashoffset: 220, animation: 'cable-in 500ms ease-out forwards' }}
          />
          <path
            d="M22 16 C 52 16, 44 70, 44 120 L 44 158"
            fill="none"
            stroke="var(--color-cobalt)"
            strokeWidth="3"
            strokeLinecap="round"
            style={reducedMotion ? undefined : { strokeDasharray: 220, strokeDashoffset: 220, animation: 'cable-in 500ms ease-out forwards' }}
          />
          <g style={reducedMotion ? undefined : { opacity: 0, animation: 'toast-in 200ms ease-out 450ms forwards' }}>
            <rect x="30" y="156" width="28" height="34" rx="3" fill="#3a3a3a" stroke="#111" strokeWidth="3" />
            <rect x="36" y="180" width="16" height="6" fill="#8a8a8a" />
            <text x="44" y="174" textAnchor="middle" fontSize="9" fontFamily="Silkscreen, monospace" fill="#fffdf5">
              P2
            </text>
          </g>
        </svg>
      )}
    </div>
  )
}

function Brand({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display leading-none" style={{ color: 'var(--shell)', fontSize: size }}>
        {colophon.deviceName}
      </span>
      <span className="font-tiny text-[7px] uppercase text-paper/60">Portfolio system</span>
    </div>
  )
}

export function Front() {
  const { state } = useDevice()
  const slotCart = cartById(state.cart.inserted ?? state.cart.seating ?? undefined)
  const seating = !!state.cart.seating
  const on = state.power !== 'off'

  return (
    <div className="relative" style={{ width: 380 }}>
      {slotCart && (
        <div className={`device-face absolute left-1/2 top-0 z-0 ${seating ? 'cart-seating' : 'cart-seated'}`} aria-hidden="true">
          <Cartridge cart={slotCart} width={168} />
        </div>
      )}

      <div className="plastic relative z-10 rounded-[26px] rounded-br-[72px] px-6 pb-8 pt-7">
        <div
          id="cart-slot"
          className="absolute left-1/2 top-[-3px] h-[14px] w-[196px] -translate-x-1/2 rounded-b-md border-x-[3px] border-b-[3px] border-ink bg-[#1a1a1a] transition-colors data-[over=true]:bg-cobalt"
        />
        <EjectButton className="absolute right-[22px] top-[-3px]" />
        <PowerSwitch className="absolute left-[30px] top-[-12px]" />

        <div className="relative mt-4 rounded-2xl rounded-br-[44px] border-[3px] border-ink bg-[#151515] px-[14px] pb-3 pt-6">
          <div className="absolute left-3 top-[5px] flex items-center gap-1.5">
            <LED on={on} />
            <span className="font-tiny text-[7px] uppercase text-paper/70">Power</span>
          </div>
          <span className="absolute right-4 top-[5px] font-tiny text-[7px] uppercase text-paper/50">Color LCD</span>
          <Screen />
          <div className="mt-2 flex items-end justify-between px-1">
            <Brand />
            <Toast />
          </div>
        </div>

        <div className="mt-6 flex items-start justify-between px-1">
          <DPad size={112} />
          <ABButtons size={54} />
        </div>
        <div className="mt-2 flex justify-center">
          <StartSelect />
        </div>
        <Speaker className="absolute bottom-[58px] right-[34px]" />
      </div>

      <ContrastWheel className="absolute -left-[12px] top-[118px] z-20" />
      <VolumeWheel className="absolute -right-[12px] top-[118px] z-20" />
      <LinkPort className="absolute -right-[9px] top-[420px] z-20" />
    </div>
  )
}
