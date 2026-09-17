import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { profile } from '../content/profile'
import { achievements } from '../content/achievements'
import { cartridges } from '../content/cartridges'
import { ScreenFrame } from './ScreenFrame'

/** About page, as a save file. */
export function SaveFileScreen() {
  const { unlocked, bootedCarts } = useDevice()
  const shelf = cartridges.filter((c) => c.bin === 'shelf')
  useAnnounce(`Save file. ${profile.name}, ${profile.location}.`)

  const rows: [string, string][] = [
    ['NAME', profile.name],
    ['BASE', profile.location],
    ['CLASS', profile.degree],
    ['GUILD', profile.college],
    ['', profile.affiliation],
    ['CARTS', `${shelf.filter((c) => bootedCarts.includes(c.id)).length}/${shelf.length} booted`],
    ['STARS', `${unlocked.length}/${achievements.length}`],
  ]

  return (
    <ScreenFrame title={`${profile.saveSlot} · ${profile.shortName} · ${profile.location.split(',')[0]}`} hint="A: open portfolio · B: back">
      <p className="t-xs uppercase opacity-80">Second portfolio. The first is an editorial site:</p>
      <a
        href={profile.otherPortfolio.url}
        target="_blank"
        rel="noreferrer"
        className="t-sm mb-[3cqw] mt-[1cqw] flex items-center justify-between gap-[2cqw] border-2 border-current px-[2.5cqw] py-[1.5cqw] uppercase focus-visible:outline-2 focus-visible:outline-current"
        style={{ background: 'var(--lcd-fg)', color: 'var(--lcd-bg)' }}
      >
        <span>
          <span className="blink" aria-hidden="true">
            ▶{' '}
          </span>
          {profile.otherPortfolio.label}
        </span>
        <span className="t-xs min-w-0 truncate normal-case">{profile.otherPortfolio.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗</span>
      </a>
      <dl className="grid grid-cols-[auto_1fr] gap-x-[3cqw] gap-y-[1cqw]">
        {rows.map(([k, v], i) => (
          <div key={i} className="contents">
            <dt className="t-xs pt-[0.6cqw] font-bold uppercase opacity-70">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <dt className="t-xs pt-[0.6cqw] font-bold uppercase opacity-70">SKILLS</dt>
        <dd>
          <ul>
            {profile.areas.map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </dd>
      </dl>
    </ScreenFrame>
  )
}
