import { useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { Row, ScreenFrame } from '../../screens/ScreenFrame'
import { bandFor, metric, ptesPhases, rooms, severityBands, vectorMetrics, type MetricKey, type Room } from '../../content/crowdshield-rooms'
import { sfx } from '../../audio/synth'
import { load, save } from '../../lib/storage'
import type { CartProps } from '../index'

const COLS = 3
const HEARTS = 3
/** map order: the boss sits in the last room */
const order: Room[] = [...rooms.filter((r) => !r.boss), ...rooms.filter((r) => r.boss)]
const maxHp = (r: Room) => Math.ceil(r.cvss)
const metricKeys = Object.keys(vectorMetrics) as MetricKey[]

interface Question {
  prompt: string
  choices: string[]
  answer: string
}

/** Every room asks its severity band, then one base metric from its vector. */
function questionsFor(r: Room, i: number): Question[] {
  const key = metricKeys[i % metricKeys.length]
  const m = vectorMetrics[key]
  return [
    { prompt: `CVSS ${r.cvss}: which severity band?`, choices: severityBands.map((b) => b.name), answer: bandFor(r.cvss) },
    { prompt: `${m.label} for this finding?`, choices: Object.values(m.values), answer: metric(r.vector, key) },
  ]
}

function Monster({ boss, hitKey, dead }: { boss: boolean; hitKey: number; dead: boolean }) {
  return (
    <svg
      key={hitKey}
      viewBox="0 0 48 48"
      className="h-[18cqw] w-[18cqw]"
      style={{ animation: hitKey ? 'cs-shake 220ms steps(4)' : undefined, opacity: dead ? 0.35 : 1 }}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M10 20 L4 14" />
        <path d="M38 20 L44 14" />
        <path d="M8 30 L2 32" />
        <path d="M40 30 L46 32" />
        <path d="M12 38 L6 44" />
        <path d="M36 38 L42 44" />
      </g>
      <ellipse cx="24" cy="28" rx="15" ry="14" fill="var(--lcd-accent)" stroke="currentColor" strokeWidth="3" />
      <circle cx="18" cy="24" r="3" fill="currentColor" />
      <circle cx="30" cy="24" r="3" fill="currentColor" />
      {boss && <path d="M12 12 L16 4 L24 10 L32 4 L36 12 Z" fill="currentColor" />}
      <path d={dead ? 'M17 35 Q24 30 31 35' : 'M17 33 Q24 38 31 33'} fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

/**
 * Nine rooms, one per finding in the report. A room's HP is its CVSS score.
 * You clear it by answering two questions about the score: its severity
 * band, and one base metric from its vector. A wrong answer costs a heart;
 * no hearts sends you back to the map. Method and findings only, never payloads.
 */
export default function CrowdShieldCart(_props: CartProps) {
  const { unlock } = useDevice()
  const [pos, setPos] = useState(0)
  const [view, setView] = useState<'map' | 'room' | 'report'>('map')
  const [cleared, setCleared] = useState<string[]>(() => load<string[]>('crowdshield', []))
  const [hp, setHp] = useState<number[]>(() => order.map((r) => (cleared.includes(r.id) ? 0 : maxHp(r))))
  const [hearts, setHearts] = useState(HEARTS)
  const [q, setQ] = useState(0)
  const [sel, setSel] = useState(0)
  const [hitKey, setHitKey] = useState(0)
  const [msg, setMsg] = useState('')

  const room = order[pos]
  const isCleared = (r: Room) => cleared.includes(r.id)
  const questions = questionsFor(room, pos)
  const question = questions[q]

  useAnnounce(
    view === 'map'
      ? `Dungeon map. Room ${pos + 1} of ${order.length}: ${room.name}${isCleared(room) ? ', cleared' : ''}. ${msg}`
      : view === 'room'
        ? isCleared(room)
          ? `${room.name}. Documented. CVSS ${room.cvss}, ${bandFor(room.cvss)}.`
          : `${room.name}. HP ${hp[pos]} of ${maxHp(room)}. ${question.prompt} ${question.choices[sel]} highlighted. ${msg}`
        : 'Report.',
  )

  const enter = () => {
    setQ(0)
    setSel(0)
    setMsg('')
    setView('room')
    sfx.confirm()
  }

  const clear = () => {
    const list = [...cleared, room.id]
    setCleared(list)
    save('crowdshield', list)
    setHp((h) => h.map((v, i) => (i === pos ? 0 : v)))
    setMsg('Documented.')
    sfx.jingle([60, 64, 67])
    if (room.boss) unlock('boss')
    if (list.length === order.length) unlock('dungeon')
  }

  const answer = (k: number) => {
    if (isCleared(room)) return
    setSel(k)
    if (question.choices[k] === question.answer) {
      setHitKey((n) => n + 1)
      sfx.hit()
      if (q + 1 < questions.length) {
        setHp((h) => h.map((v, i) => (i === pos ? Math.max(1, v - Math.ceil(maxHp(room) / questions.length)) : v)))
        setQ(q + 1)
        setSel(0)
        setMsg('Hit. Next question.')
      } else clear()
      return
    }
    sfx.error()
    if (hearts > 1) {
      setHearts(hearts - 1)
      setMsg('Wrong. Try again.')
      return
    }
    // out of hearts: back to the map, room and hearts restored
    setHearts(HEARTS)
    setHp((h) => h.map((v, i) => (i === pos ? maxHp(room) : v)))
    setView('map')
    setMsg('Retreated. Hearts restored.')
  }

  useCartInput((b) => {
    if (view === 'report') {
      if (b === 'b' || b === 'start') {
        setView('map')
        sfx.back()
      }
      return true
    }
    if (view === 'room') {
      if (b === 'up' || b === 'down') {
        if (!isCleared(room)) {
          setSel((s) => (s + (b === 'up' ? -1 : 1) + question.choices.length) % question.choices.length)
          sfx.tick()
        }
        return true
      }
      if (b === 'a') {
        answer(sel)
        return true
      }
      if (b === 'b') {
        setView('map')
        setMsg('')
        sfx.back()
        return true
      }
      if (b === 'start') {
        setView('report')
        return true
      }
      return true
    }
    // map
    const row = Math.floor(pos / COLS)
    const col = pos % COLS
    const move = (r: number, c: number) => {
      if (r < 0 || c < 0 || c >= COLS || r * COLS + c >= order.length) {
        sfx.error()
        return
      }
      setPos(r * COLS + c)
      sfx.tick()
    }
    if (b === 'up') move(row - 1, col)
    else if (b === 'down') move(row + 1, col)
    else if (b === 'left') move(row, col - 1)
    else if (b === 'right') move(row, col + 1)
    else if (b === 'a') enter()
    else if (b === 'start') setView('report')
    else return false
    return true
  })

  const heartRow = '♥'.repeat(hearts) + '♡'.repeat(HEARTS - hearts)
  const progress = `${cleared.length}/${order.length}`

  if (view === 'report') {
    const sorted = [...order].sort((a, b) => b.cvss - a.cvss)
    return (
      <ScreenFrame title="Report · PTES" right={progress} hint="B: map">
        <ol className="t-xs list-decimal pl-[5cqw] uppercase">
          {ptesPhases.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <p className="t-xs mt-[3cqw] uppercase opacity-80">Findings by severity:</p>
        <ul className="t-xs">
          {sorted.map((r) => (
            <li key={r.id} className="flex justify-between gap-[2cqw]" style={{ opacity: isCleared(r) ? 1 : 0.6 }}>
              <span className="truncate">
                {isCleared(r) ? '✓' : '·'} {r.id} {r.short}
              </span>
              <span className="shrink-0 uppercase">
                {r.cvss.toFixed(1)} {bandFor(r.cvss)}
              </span>
            </li>
          ))}
        </ul>
        <p className="t-xs mt-[3cqw] opacity-70">No payloads are shown on this cartridge or anywhere on this site.</p>
      </ScreenFrame>
    )
  }

  if (view === 'room') {
    const max = maxHp(room)
    const cur = hp[pos]
    const dead = isCleared(room)
    return (
      <ScreenFrame title={room.boss ? `BOSS · ${room.id}` : room.id} right={heartRow} hint={dead ? 'B: map' : 'UP/DOWN: choose · A: answer · B: map'} scroll={false}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-[3cqw]">
            <Monster boss={!!room.boss} hitKey={hitKey} dead={dead} />
            <div className="min-w-0 flex-1">
              <div className="t-xs uppercase leading-tight">{room.name}</div>
              <div className="t-xs mt-[1cqw] flex items-center gap-[2cqw]">
                <span>HP</span>
                <div className="flex flex-1 gap-[0.6cqw]" role="img" aria-label={`HP ${cur} of ${max}`}>
                  {Array.from({ length: max }).map((_, k) => (
                    <span key={k} className="h-[3cqw] flex-1 border border-current" style={{ background: k < cur ? 'var(--lcd-fg)' : 'transparent' }} />
                  ))}
                </div>
                <span>
                  {cur}/{max}
                </span>
              </div>
              {!dead && (
                <div className="t-xs mt-[0.5cqw] uppercase opacity-70">
                  Question {q + 1}/{questions.length}
                </div>
              )}
            </div>
          </div>

          <div className="t-xs mt-[2cqw] flex-1 border-2 border-current p-[1.5cqw]">
            {dead ? (
              <>
                <div className="uppercase">Documented.</div>
                <p className="mt-[1cqw] uppercase">
                  CVSS {room.cvss.toFixed(1)} · {bandFor(room.cvss)}
                </p>
                <p className="mt-[0.5cqw] break-all font-mono opacity-80">{room.vector}</p>
              </>
            ) : (
              <>
                <div className="uppercase">{question.prompt}</div>
                <ul className="mt-[0.5cqw] flex flex-col" aria-label="Answers">
                  {question.choices.map((c, k) => (
                    <Row key={c} selected={k === sel} onClick={() => answer(k)}>
                      {c}
                    </Row>
                  ))}
                </ul>
              </>
            )}
          </div>
          <p className="t-xs mt-[1cqw] uppercase" aria-hidden="true">
            {msg || (dead ? '' : 'A wrong answer costs a heart.')}
          </p>
        </div>
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame title="CrowdShield" right={`${progress} · ${heartRow}`} hint="D-pad: move · A: enter · Start: report" scroll={false}>
      <div className="flex h-full flex-col">
        <p className="t-xs mb-[1.5cqw] uppercase opacity-80">
          One room per finding. HP is its CVSS score. Answer the room's questions to document it. Beat the boss to finish.
        </p>
        <div className="grid flex-1 grid-cols-3 grid-rows-3 gap-[1.5cqw]" role="grid" aria-label="Dungeon map">
          {order.map((r, i) => {
            const here = i === pos
            const done = isCleared(r)
            return (
              <div
                key={r.id}
                role="gridcell"
                aria-selected={here}
                aria-label={`${r.id}, ${r.name}${done ? ', cleared' : ''}${r.boss ? ', boss' : ''}`}
                className="relative flex flex-col items-center justify-center border-2 border-current"
                style={{ background: here ? 'var(--lcd-fg)' : done ? 'var(--lcd-mid)' : 'transparent', color: here ? 'var(--lcd-bg)' : 'inherit' }}
              >
                <span className="t-xs font-bold">{r.short}</span>
                <span className="t-xs">{done ? '✓' : r.boss ? '☠' : r.cvss.toFixed(1)}</span>
                {here && (
                  <span className="t-xs absolute -top-[1.2em] left-1/2 -translate-x-1/2" style={{ color: 'var(--lcd-fg)' }} aria-hidden="true">
                    ▼
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {msg && (
          <p className="t-xs mt-[1cqw] uppercase" aria-hidden="true">
            {msg}
          </p>
        )}
      </div>
    </ScreenFrame>
  )
}
