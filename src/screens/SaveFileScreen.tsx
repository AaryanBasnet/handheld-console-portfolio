import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { profile } from '../content/profile'
import { achievements } from '../content/achievements'
import { cartTally } from '../lib/tally'
import { ScreenFrame } from './ScreenFrame'

/** About page, as a save file. */
export function SaveFileScreen() {
  const { unlocked, bootedCarts, available } = useDevice()
  const { played, total } = cartTally(available, bootedCarts)
  useAnnounce(`Save file. ${profile.name}, ${profile.location}. ${played} of ${total} cartridges booted, ${unlocked.length} of ${achievements.length} trophies.`)

  const { save } = profile
  const rows: [string, string[]][] = [
    ['Name', [profile.name]],
    ['Class', save.class],
    ['Guild', [save.guild]],
    ['Abilities', save.abilities],
    ['Status', [save.status]],
  ]

  return (
    <ScreenFrame title={`${profile.saveSlot} · ${profile.shortName} · ${profile.location.split(',')[0]}`} hint="A: main portfolio · B: back">
      <dl className="grid grid-cols-[auto_1fr] gap-x-[3cqw] gap-y-[1.4cqw]">
        {rows.map(([label, lines]) => (
          <div key={label} className="contents">
            <dt className="t-xs pt-[0.7cqw] font-bold uppercase opacity-70">{label}</dt>
            <dd>
              {lines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </dd>
          </div>
        ))}
        <dt className="t-xs pt-[0.7cqw] font-bold uppercase opacity-70">Carts</dt>
        <dd>
          {played}/{total} booted <span className="ml-[2cqw]">★ {unlocked.length}/{achievements.length}</span>
        </dd>
      </dl>
      {/* the same link the A button opens, for mouse and touch */}
      <a
        href={profile.otherPortfolio.url}
        target="_blank"
        rel="noreferrer"
        className="t-xs mt-[3cqw] flex items-center justify-between gap-[2cqw] border-2 border-current px-[2.5cqw] py-[1.4cqw] uppercase focus-visible:outline-2 focus-visible:outline-current"
        style={{ background: 'var(--lcd-fg)', color: 'var(--lcd-bg)' }}
      >
        <span>▶ Main portfolio</span>
        <span className="min-w-0 truncate normal-case">{profile.otherPortfolio.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗</span>
      </a>
    </ScreenFrame>
  )
}
