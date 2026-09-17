import { useAnnounce } from '../device/DeviceProvider'
import { ScreenFrame } from './ScreenFrame'

/** Shown on the LCD while the device is flipped; the content lives on the back. */
export function ColophonScreen() {
  useAnnounce('Device flipped. The colophon is printed on the specification label on the back.')
  return (
    <ScreenFrame title="Back of device" hint="B: flip back">
      <p className="uppercase">See the label on the back.</p>
    </ScreenFrame>
  )
}
