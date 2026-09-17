import { Link } from 'react-router'
import { cartridges } from '../content/cartridges'
import { colophon, contact, profile } from '../content/profile'
import { achievements } from '../content/achievements'
import { Todo } from '../device/Manual'

/** Everything on the site, as a readable page. No device, no game. */
export default function PlainPage() {
  const listed = cartridges.filter((c) => c.bin !== 'hidden')
  return (
    <main className="mx-auto max-w-[68ch] px-5 py-10 font-sans text-[16px] leading-relaxed text-ink">
      <nav className="mb-8 font-mono text-sm">
        <Link to="/" className="underline decoration-2 underline-offset-2">
          ← Back to the device
        </Link>
      </nav>

      <header className="mb-10 border-b-[3px] border-ink pb-6">
        <h1 className="font-display text-4xl">{profile.name}</h1>
        <p className="mt-2">
          {profile.degree}, {profile.college}, {profile.affiliation}. Based in {profile.location}.
        </p>
        <p className="mt-1">Work spans {profile.areas.map((a) => a.toLowerCase()).join(', ')}.</p>
        <p className="mt-1 font-mono text-sm">
          {profile.otherPortfolio.label}: <Todo text={profile.otherPortfolio.url} />
        </p>
      </header>

      <h2 className="mb-4 font-display text-2xl">Projects</h2>
      {listed.map((c) => (
        <article key={c.id} className="mb-10 border-[3px] border-ink bg-paper p-5 shadow-hard">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl">{c.title}</h3>
            <span className="font-mono text-xs uppercase">
              {c.tag} · {c.status}
              {c.bin === 'bargain' ? ' · bargain bin' : ''}
            </span>
          </div>
          <p className="mt-2">{c.summary}</p>
          <p className="mt-1 font-mono text-xs">{c.stack.join(' · ')}</p>
          {c.manual.map((s) => (
            <section key={s.heading} className="mt-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider">{s.heading}</h4>
              {s.body?.map((p, i) => (
                <p key={i} className="mt-1">
                  <Todo text={p} />
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-1 list-disc pl-5">
                  {s.bullets.map((b, i) => (
                    <li key={i}>
                      <Todo text={b} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          {c.links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 font-mono text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href && l.href !== 'TODO' ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="underline decoration-2 underline-offset-2">
                      {l.label}
                    </a>
                  ) : (
                    <span>
                      {l.label}: <Todo text="TODO" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 font-mono text-xs">
            <Link to={`/cart/${c.id}`} className="underline decoration-2 underline-offset-2">
              Boot this cartridge on the device
            </Link>
          </p>
        </article>
      ))}

      <h2 className="mb-3 font-display text-2xl">Contact</h2>
      <p>{contact.intro}</p>
      <ul className="mb-10 mt-2 font-mono text-sm">
        {contact.links.map((l) => (
          <li key={l.label}>
            {l.label}:{' '}
            {l.href && l.href !== 'TODO' ? (
              <a href={l.href} className="underline decoration-2 underline-offset-2">
                {l.value}
              </a>
            ) : (
              <Todo text={l.value} />
            )}
          </li>
        ))}
      </ul>

      <h2 className="mb-3 font-display text-2xl">Colophon</h2>
      <p>
        The device is called {colophon.deviceName} ({colophon.deviceTagline}). It is an original design.
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
        {colophon.stack.map((s) => (
          <div key={s.part} className="contents">
            <dt className="text-ink/60">{s.part}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
        {colophon.fonts.map((f) => (
          <div key={f.role} className="contents">
            <dt className="text-ink/60">{f.role}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-3 list-disc pl-5">
        {colophon.credits.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <h2 className="mb-3 mt-10 font-display text-2xl">Achievements on the device</h2>
      <ul className="list-disc pl-5">
        {achievements.map((a) => (
          <li key={a.id}>
            <strong>{a.title}</strong>: {a.how}
          </li>
        ))}
      </ul>
    </main>
  )
}
