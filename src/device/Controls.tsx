import { useState } from 'react'
import { HwButton } from './HwButton'
import { useDevice } from './DeviceProvider'

/** Sizes scale from one number so desk and handheld layouts share the parts. */
export function DPad({ size = 112 }: { size?: number }) {
  const [dir, setDir] = useState<string | null>(null)
  const arm = size / 3
  const tilt: Record<string, string> = {
    up: 'rotateX(14deg)',
    down: 'rotateX(-14deg)',
    left: 'rotateY(-14deg)',
    right: 'rotateY(14deg)',
  }
  const set = (d: string) => (p: boolean) => setDir(p ? d : null)
  return (
    <div className="relative" style={{ width: size, height: size, perspective: 400 }} role="group" aria-label="Directional pad">
      <div
        className="absolute inset-0 transition-transform duration-75"
        style={{ transform: dir ? tilt[dir] : 'none', transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 3 3" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <path
            d="M1 0 H2 V1 H3 V2 H2 V3 H1 V2 H0 V1 H1 Z"
            fill="#111"
            transform="translate(0.06 0.09)"
          />
          <path d="M1 0 H2 V1 H3 V2 H2 V3 H1 V2 H0 V1 H1 Z" fill="var(--shell-dark)" stroke="#111" strokeWidth="0.09" strokeLinejoin="round" />
          <circle cx="1.5" cy="1.5" r="0.32" fill="none" stroke="#111" strokeWidth="0.06" strokeDasharray="0.12 0.08" />
          <path d="M1.5 0.32 L1.3 0.62 H1.7 Z" fill="#111" />
          <path d="M1.5 2.68 L1.3 2.38 H1.7 Z" fill="#111" />
          <path d="M0.32 1.5 L0.62 1.3 V1.7 Z" fill="#111" />
          <path d="M2.68 1.5 L2.38 1.3 V1.7 Z" fill="#111" />
        </svg>
        {(
          [
            ['up', arm, 0],
            ['down', arm, arm * 2],
            ['left', 0, arm],
            ['right', arm * 2, arm],
          ] as const
        ).map(([d, x, y]) => (
          <HwButton
            key={d}
            button={d}
            label={`D-pad ${d}`}
            repeat
            onPressedChange={set(d)}
            className="absolute rounded-sm"
            style={{ left: x, top: y, width: arm, height: arm, border: 0, boxShadow: 'none', background: 'transparent', transform: 'none' }}
          >
            <span className="sr-only">{d}</span>
          </HwButton>
        ))}
      </div>
    </div>
  )
}

export function ABButtons({ size = 54 }: { size?: number }) {
  const font = size * 0.5
  return (
    <div className="relative" style={{ width: size * 2.1, height: size * 1.75 }} role="group" aria-label="A and B buttons">
      <div className="absolute" style={{ left: 0, top: size * 0.75 }}>
        <HwButton button="b" label="B button" className="rounded-full bg-cobalt text-paper font-display" >
          <span className="flex items-center justify-center" style={{ width: size, height: size, fontSize: font }}>
            B
          </span>
        </HwButton>
        <div className="on-shell mt-2 text-center font-tiny text-[10px]">B</div>
      </div>
      <div className="absolute" style={{ left: size * 1.1, top: 0 }}>
        <HwButton button="a" label="A button" className="rounded-full bg-tomato text-paper font-display">
          <span className="flex items-center justify-center" style={{ width: size, height: size, fontSize: font }}>
            A
          </span>
        </HwButton>
        <div className="on-shell mt-2 text-center font-tiny text-[10px]">A</div>
      </div>
    </div>
  )
}

export function StartSelect({ width = 48 }: { width?: number }) {
  const { nudge } = useDevice()
  return (
    <div className="flex items-end gap-4" role="group" aria-label="Select and Start">
      {(['select', 'start'] as const).map((b) => (
        <div key={b} className="flex flex-col items-center">
          <HwButton
            button={b}
            label={b === 'start' ? 'Start' : 'Select'}
            className="rounded-full"
            style={{ border: 0, boxShadow: 'none', background: 'transparent', transform: 'none', padding: '8px 6px' }}
          >
            <span
              className={`pill block -rotate-[22deg] rounded-full border-[3px] border-ink bg-[#4a4a4a] ${b === 'select' && nudge ? 'pill-nudge' : ''}`}
              style={{ width, height: width * 0.32 }}
            />
          </HwButton>
          <div className="mt-3 font-tiny text-[10px] uppercase text-ink">{b}</div>
        </div>
      ))}
    </div>
  )
}
