import { useDevice } from './DeviceProvider'

export function PowerSwitch({ className = '' }: { className?: string }) {
  const { state, powerToggle, unlocked, reducedMotion } = useDevice()
  const on = state.power !== 'off'
  /** never touched the power switch this device has ever seen: give it a nudge */
  const neverPowered = !on && !unlocked.includes('power')
  return (
    <div className={`flex flex-col items-center gap-[3px] ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Power. Flip to turn the device on."
        onClick={powerToggle}
        className={`focus-ring relative h-[22px] w-[48px] rounded-sm border-[3px] border-ink bg-[#3a3a3a] ${neverPowered && !reducedMotion ? 'power-hint' : ''}`}
      >
        <span
          className="absolute top-[1px] bottom-[1px] w-[20px] rounded-sm border-2 border-ink transition-[left] duration-100"
          style={{ left: on ? 21 : 1, background: on ? 'var(--color-leaf)' : '#8a8a8a' }}
        />
      </button>
      {/* the label says what the switch is; both positions stay visible under it
          so it reads as a legend rather than eating the width on either side */}
      <div className="on-shell font-tiny text-[8px] font-bold uppercase leading-none">Power</div>
      <div className="on-shell flex gap-1 font-tiny text-[7px] uppercase leading-none">
        <span style={{ opacity: on ? 0.4 : 1 }}>Off</span>
        <span aria-hidden="true">·</span>
        <span style={{ opacity: on ? 1 : 0.4 }}>On</span>
      </div>
    </div>
  )
}
