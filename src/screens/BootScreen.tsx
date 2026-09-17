import { useEffect, useState } from 'react'
import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { colophon } from '../content/profile'

const steps = ['KHEL OS', 'MEMORY OK', 'CARTRIDGE CHECK', 'READY']

/** Power-on sequence. Reduced motion never shows this (the reducer skips to on). */
export function BootScreen() {
  const { dispatch } = useDevice()
  const [step, setStep] = useState(0)
  useAnnounce('Powering on')

  useEffect(() => {
    const timers = steps.map((_, i) => window.setTimeout(() => setStep(i + 1), 250 + i * 280))
    const done = window.setTimeout(() => dispatch({ type: 'BOOT_DONE' }), 250 + steps.length * 280 + 200)
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(done)
    }
  }, [dispatch])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[6cqw]">
      <div className="font-display t-xl" style={{ transform: `translateY(${step === 0 ? '-40cqw' : '0'})`, transition: 'transform 240ms steps(4)' }}>
        {colophon.deviceName}
      </div>
      <ul className="t-xs mt-[6cqw] w-full max-w-[70%] font-mono uppercase" aria-hidden="true">
        {steps.slice(0, step).map((s) => (
          <li key={s} className="flex justify-between">
            <span>{s}</span>
            <span>OK</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
