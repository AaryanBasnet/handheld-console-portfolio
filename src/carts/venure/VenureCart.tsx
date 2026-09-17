import { useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { Row, ScreenFrame } from '../../screens/ScreenFrame'
import { FILTERS_TILE, OWNER_TILE, TOWN_COLS, TOWN_TILES, filterNames, venues, type Venue } from '../../content/venure'
import { sfx } from '../../audio/synth'
import type { CartProps } from '../index'

type View = 'town' | 'venue' | 'date' | 'confirm' | 'booked' | 'owner' | 'filters'
type Status = 'Pending' | 'Confirmed'
interface Booking {
  venue: string
  date: string
  status: Status
}

const today = new Date()
const YEAR = today.getFullYear()
const MONTH = today.getMonth()
const DAYS = new Date(YEAR, MONTH + 1, 0).getDate()
const FIRST_WEEKDAY = new Date(YEAR, MONTH, 1).getDay()
const MONTH_NAME = today.toLocaleString('en', { month: 'short' })
const fmt = (day: number) => `${day} ${MONTH_NAME} ${YEAR}`

function Building() {
  return (
    <svg viewBox="0 0 24 24" className="h-[8cqw] w-[8cqw]" aria-hidden="true">
      <path d="M3 10 L12 3 L21 10 Z" fill="currentColor" />
      <rect x="5" y="10" width="14" height="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="14" width="4" height="7" fill="currentColor" />
    </svg>
  )
}

function Tree() {
  return (
    <svg viewBox="0 0 24 24" className="h-[7cqw] w-[7cqw]" aria-hidden="true">
      <circle cx="12" cy="9" r="7" fill="var(--lcd-mid)" stroke="currentColor" strokeWidth="2" />
      <rect x="10.5" y="14" width="3" height="8" fill="currentColor" />
    </svg>
  )
}

/**
 * Two sides of the product. Guest: walk the town, filter venues, open one,
 * pick a real date and book it. Owner: the desk where those bookings arrive
 * for approval. The venues are samples written for this cartridge.
 */
export default function VenureCart({ cart }: CartProps) {
  const { unlock } = useDevice()
  const [view, setView] = useState<View>('town')
  const [cur, setCur] = useState(0)
  const [vsel, setVsel] = useState(0)
  const [filters, setFilters] = useState<boolean[]>(() => filterNames.map(() => false))
  const [fsel, setFsel] = useState(0)
  const [day, setDay] = useState(today.getDate())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bsel, setBsel] = useState(0)

  const venue = venues[vsel]
  const venueAt = (tile: number) => venues.find((v) => v.tile === tile)
  const anyFilter = filters.some(Boolean)
  const matches = (v: Venue) => filterNames.every((f, i) => !filters[i] || v.tags.includes(f))
  const under = venueAt(cur)
  const tileName = (tile: number) => {
    const v = venueAt(tile)
    if (v) return `${v.name} · ${v.price}${anyFilter && !matches(v) ? ' · filtered out' : ''}`
    if (tile === FILTERS_TILE) return `Filters · ${filters.filter(Boolean).length} on`
    if (tile === OWNER_TILE) return 'Owner desk'
    return 'Park'
  }

  useAnnounce(
    view === 'town'
      ? `Town. ${tileName(cur)}.`
      : view === 'venue'
        ? `${venue.name}. Press A to pick a date.`
        : view === 'date'
          ? `Pick a date: ${fmt(day)}.`
          : view === 'confirm'
            ? `Book ${venue.name} on ${fmt(day)}?`
            : view === 'booked'
              ? 'Booked. It is now waiting at the owner desk.'
              : view === 'owner'
                ? `Owner desk. ${bookings.length} booking${bookings.length === 1 ? '' : 's'}.`
                : 'Filters.',
  )

  const openTile = () => {
    const v = venueAt(cur)
    if (v) {
      setVsel(venues.indexOf(v))
      setView('venue')
      sfx.confirm()
    } else if (cur === FILTERS_TILE) {
      setView('filters')
      sfx.click()
    } else if (cur === OWNER_TILE) {
      setView('owner')
      sfx.click()
    } else sfx.tick()
  }

  const book = () => {
    setBookings((b) => [...b, { venue: venue.name, date: fmt(day), status: 'Pending' }])
    setView('booked')
    sfx.jingle([64, 68, 71, 76])
    unlock('booked')
  }

  useCartInput((b) => {
    switch (view) {
      case 'town': {
        const row = Math.floor(cur / TOWN_COLS)
        const col = cur % TOWN_COLS
        const move = (r: number, c: number) => {
          if (r < 0 || c < 0 || c >= TOWN_COLS || r * TOWN_COLS + c >= TOWN_TILES) {
            sfx.error()
            return
          }
          setCur(r * TOWN_COLS + c)
          sfx.tick()
        }
        if (b === 'up') move(row - 1, col)
        else if (b === 'down') move(row + 1, col)
        else if (b === 'left') move(row, col - 1)
        else if (b === 'right') move(row, col + 1)
        else if (b === 'a') openTile()
        else if (b === 'start') {
          setView('owner')
          sfx.click()
        } else return false
        return true
      }
      case 'venue':
        if (b === 'a') {
          setDay(today.getDate())
          setView('date')
          sfx.confirm()
        } else if (b === 'b') {
          setView('town')
          sfx.back()
        }
        return true
      case 'date':
        if (b === 'left' || b === 'right' || b === 'up' || b === 'down') {
          const delta = b === 'left' ? -1 : b === 'right' ? 1 : b === 'up' ? -7 : 7
          const next = day + delta
          if (next < 1 || next > DAYS) sfx.error()
          else {
            setDay(next)
            sfx.tick()
          }
        } else if (b === 'a') {
          setView('confirm')
          sfx.confirm()
        } else if (b === 'b') {
          setView('venue')
          sfx.back()
        }
        return true
      case 'confirm':
        if (b === 'a') book()
        else if (b === 'b') {
          setView('date')
          sfx.back()
        }
        return true
      case 'booked':
        if (b === 'start') {
          setView('owner')
          sfx.click()
        } else if (b === 'a' || b === 'b') {
          setView('town')
          sfx.back()
        }
        return true
      case 'owner':
        if (b === 'up' || b === 'down') {
          if (bookings.length) setBsel((s) => (s + (b === 'up' ? -1 : 1) + bookings.length) % bookings.length)
          sfx.tick()
        } else if (b === 'a') {
          const bk = bookings[bsel]
          if (bk && bk.status === 'Pending') {
            setBookings((list) => list.map((x, i) => (i === bsel ? { ...x, status: 'Confirmed' } : x)))
            sfx.confirm()
          } else sfx.tick()
        } else if (b === 'b' || b === 'start') {
          setView('town')
          sfx.back()
        }
        return true
      case 'filters':
        if (b === 'up' || b === 'down') {
          setFsel((s) => (s + (b === 'up' ? -1 : 1) + filterNames.length) % filterNames.length)
          sfx.tick()
        } else if (b === 'a') {
          setFilters((f) => f.map((v, i) => (i === fsel ? !v : v)))
          sfx.click()
        } else if (b === 'b' || b === 'start') {
          setView('town')
          sfx.back()
        }
        return true
    }
  })

  if (view === 'filters') {
    return (
      <ScreenFrame title="Filters" right={`${filters.filter(Boolean).length} on`} hint="A: toggle · B: town">
        <p className="t-xs mb-[1cqw] uppercase opacity-70">Venues that don't match go dark on the map.</p>
        <ul>
          {filterNames.map((f, i) => (
            <Row key={f} selected={i === fsel} onClick={() => { setFsel(i); setFilters((x) => x.map((v, k) => (k === i ? !v : v))) }} right={filters[i] ? '[x]' : '[ ]'}>
              {f}
            </Row>
          ))}
        </ul>
      </ScreenFrame>
    )
  }

  if (view === 'venue') {
    return (
      <ScreenFrame title={venue.name} right={venue.kind} hint="A: pick a date · B: town">
        <dl className="t-xs grid grid-cols-[auto_1fr] gap-x-[3cqw] gap-y-[1cqw] uppercase">
          <dt className="opacity-70">Type</dt>
          <dd>{venue.kind}</dd>
          <dt className="opacity-70">Capacity</dt>
          <dd>{venue.capacity}</dd>
          <dt className="opacity-70">Price</dt>
          <dd>{venue.price}</dd>
          <dt className="opacity-70">Matches</dt>
          <dd>{venue.tags.join(', ')}</dd>
        </dl>
      </ScreenFrame>
    )
  }

  if (view === 'date') {
    const cells = [...Array.from({ length: FIRST_WEEKDAY }, () => 0), ...Array.from({ length: DAYS }, (_, i) => i + 1)]
    return (
      <ScreenFrame title={`${MONTH_NAME} ${YEAR}`} right={venue.name} hint="D-pad: day · A: choose · B: back" scroll={false}>
        <div className="grid grid-cols-7 gap-[0.5cqw] text-center" role="grid" aria-label="Calendar">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="t-xs opacity-60">
              {d}
            </div>
          ))}
          {cells.map((d, i) =>
            d === 0 ? (
              <div key={`b${i}`} />
            ) : (
              <button
                key={d}
                type="button"
                role="gridcell"
                aria-selected={d === day}
                onClick={() => setDay(d)}
                className="t-xs py-[0.4cqw] focus-visible:outline-2 focus-visible:outline-current"
                style={{
                  background: d === day ? 'var(--lcd-fg)' : 'transparent',
                  color: d === day ? 'var(--lcd-bg)' : 'inherit',
                  textDecoration: d === today.getDate() ? 'underline' : 'none',
                }}
              >
                {d}
              </button>
            ),
          )}
        </div>
        <p className="t-xs mt-[2cqw] text-center uppercase">Selected: {fmt(day)}</p>
      </ScreenFrame>
    )
  }

  if (view === 'confirm') {
    return (
      <ScreenFrame title="Confirm" right="Step 3/3" hint="A: book · B: back">
        <div className="border-2 border-current p-[3cqw] text-center uppercase">
          <div className="t-md">{venue.name}</div>
          <div className="t-xs mt-[1cqw]">{fmt(day)}</div>
          <div className="t-xs mt-[1cqw] opacity-70">{venue.price}</div>
        </div>
        <p className="t-xs mt-[3cqw] uppercase opacity-80">Venue → date → confirm.</p>
      </ScreenFrame>
    )
  }

  if (view === 'booked') {
    return (
      <ScreenFrame title="Booked" right="✓" hint="Start: owner desk · A: town">
        <div className="border-2 border-current p-[3cqw] text-center uppercase">
          <div className="t-md">{venue.name}</div>
          <div className="t-xs mt-[1cqw]">{fmt(day)}</div>
        </div>
        <p className="t-xs mt-[3cqw] uppercase opacity-80">Pending until the owner approves it. Press Start to be the owner.</p>
      </ScreenFrame>
    )
  }

  if (view === 'owner') {
    return (
      <ScreenFrame title="Owner desk" right={`${bookings.length} booking${bookings.length === 1 ? '' : 's'}`} hint="A: approve · B: town">
        {bookings.length === 0 ? (
          <p className="t-xs uppercase opacity-80">No bookings yet. Book a venue as a guest and it lands here.</p>
        ) : (
          <ul className="flex flex-col gap-[0.5cqw]" aria-label="Bookings">
            {bookings.map((bk, i) => (
              <Row
                key={i}
                selected={i === bsel}
                onClick={() => {
                  setBsel(i)
                  if (bk.status === 'Pending') setBookings((list) => list.map((x, k) => (k === i ? { ...x, status: 'Confirmed' } : x)))
                }}
                right={bk.status}
                sub={bk.date}
              >
                {bk.venue}
              </Row>
            ))}
          </ul>
        )}
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame title="Venure · Town" right={anyFilter ? `${filters.filter(Boolean).length} filters` : 'Guest'} hint={cart.controls} scroll={false}>
      <div className="flex h-full flex-col">
        <div className="grid flex-1 grid-cols-3 gap-[1.5cqw]" role="grid" aria-label="Town">
          {Array.from({ length: TOWN_TILES }).map((_, tile) => {
            const v = venueAt(tile)
            const here = tile === cur
            const dark = !!v && anyFilter && !matches(v)
            return (
              <button
                key={tile}
                type="button"
                role="gridcell"
                aria-selected={here}
                aria-label={tileName(tile)}
                onClick={() => {
                  if (here) openTile()
                  else setCur(tile)
                }}
                className="t-xs flex flex-col items-center justify-center gap-[0.5cqw] border-2 border-current uppercase focus-visible:outline-2 focus-visible:outline-current"
                style={{
                  background: here ? 'var(--lcd-fg)' : 'transparent',
                  color: here ? 'var(--lcd-bg)' : 'inherit',
                  borderStyle: v || tile === FILTERS_TILE || tile === OWNER_TILE ? 'solid' : 'dotted',
                  opacity: dark ? 0.35 : 1,
                }}
              >
                {v ? (
                  <>
                    <Building />
                    <span className="truncate px-[0.5cqw]">{v.name}</span>
                  </>
                ) : tile === FILTERS_TILE ? (
                  <>
                    <span className="t-sm">⚙</span>
                    <span>Filters</span>
                  </>
                ) : tile === OWNER_TILE ? (
                  <>
                    <span className="t-sm">▤</span>
                    <span>Owner</span>
                  </>
                ) : (
                  <Tree />
                )}
              </button>
            )
          })}
        </div>
        <p className="t-xs mt-[1.5cqw] border-t-2 border-dotted border-current pt-[1cqw] uppercase" aria-hidden="true">
          {under ? `${under.name} · ${under.kind} · ${under.price}` : tileName(cur)}
        </p>
      </div>
    </ScreenFrame>
  )
}
