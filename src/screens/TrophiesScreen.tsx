import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { achievements } from '../content/achievements'
import { ScreenFrame } from './ScreenFrame'

export function TrophiesScreen() {
  const { unlocked } = useDevice()
  useAnnounce(`Achievements. ${unlocked.length} of ${achievements.length} unlocked.`)
  return (
    <ScreenFrame title="Achievements" right={`${unlocked.length}/${achievements.length}`} hint="Up/Down: scroll · B: back">
      <ul className="flex flex-col gap-[1.5cqw]">
        {achievements.map((a) => {
          const got = unlocked.includes(a.id)
          return (
            <li key={a.id} className="flex gap-[2cqw]" style={{ opacity: got ? 1 : 0.55 }}>
              <span className="font-mono shrink-0" aria-hidden="true">
                {got ? '[★]' : '[ ]'}
              </span>
              <span className="min-w-0">
                <span className="uppercase">{a.title}</span>
                <span className="sr-only">{got ? ', unlocked' : ', locked'}</span>
                <span className="t-xs block opacity-80">{a.how}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </ScreenFrame>
  )
}
