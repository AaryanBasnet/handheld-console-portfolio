import { useDevice } from './DeviceProvider'

/** Volume: a real range input over a ridged wheel that turns with the value. */
export function VolumeWheel({ className = '' }: { className?: string }) {
  const { state, setVolume } = useDevice()
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative h-[64px] w-[14px] overflow-hidden rounded-sm wheel" style={{ backgroundPositionY: state.volume * 40 }}>
        <div
          className="absolute inset-0 wheel"
          style={{
            background: `repeating-linear-gradient(180deg, #2a2a2a 0 3px, #6a6a6a 3px 6px)`,
            backgroundPositionY: `${state.volume * -48}px`,
            border: 'none',
          }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={state.volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          aria-valuetext={`${Math.round(state.volume * 100)} percent`}
          className="focus-ring absolute inset-0 h-full w-full cursor-ns-resize opacity-0"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        />
      </div>
      <span className="shell-tag">Vol</span>
    </div>
  )
}

/** Contrast: cycles screen palettes. Ridges rotate one step per click. */
export function ContrastWheel({ className = '' }: { className?: string }) {
  const { state, cyclePalette, palette } = useDevice()
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={cyclePalette}
        aria-label={`Contrast wheel. Palette: ${palette.name}`}
        className="focus-ring relative h-[64px] w-[14px] overflow-hidden rounded-sm wheel"
      >
        <span
          className="absolute inset-0 transition-[background-position] duration-150"
          style={{
            background: `repeating-linear-gradient(180deg, #2a2a2a 0 3px, #6a6a6a 3px 6px)`,
            backgroundPositionY: `${state.paletteIndex * 4}px`,
          }}
        />
      </button>
      <span className="shell-tag">Con</span>
    </div>
  )
}
