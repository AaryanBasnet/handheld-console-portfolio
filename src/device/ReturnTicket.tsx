import { useState } from 'react'
import { profile } from '../content/profile'

const mainUrl = profile.otherPortfolio.url
const mainHost = new URL(mainUrl).hostname.replace(/^www\./, '')

/** True when the visitor followed a link here from the editorial portfolio. */
function cameFromMainPortfolio() {
  try {
    if (!document.referrer) return false
    const from = new URL(document.referrer).hostname.replace(/^www\./, '')
    return from === mainHost || from.endsWith(`.${mainHost}`)
  } catch {
    return false
  }
}

/**
 * The way back to the main portfolio, as a boarding pass pinned to the corner
 * of the screen. A page opened in a new tab has no Back button, so this stays
 * put (fixed, above the desk) however far the desk scrolls. It's a plain link:
 * same tab, so it also works as a normal "back" for anyone who came from there.
 */
export function ReturnTicket() {
  const [fromMain] = useState(cameFromMainPortfolio)
  return (
    <a
      href={mainUrl}
      aria-label={`${fromMain ? 'Return to' : 'Open'} the main portfolio, ${mainHost}`}
      className="focus-ring fixed left-3 top-3 z-40 flex items-stretch rounded-md border-[3px] border-ink bg-paper text-ink shadow-hard-sm transition-[transform,box-shadow] duration-75 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#111]"
    >
      {/* the stub: torn off along the dashed line */}
      <span className="flex flex-col items-center justify-center gap-[3px] border-r-2 border-dashed border-ink bg-tomato px-2 text-paper" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
        <span className="font-tiny text-[6px] uppercase leading-none">P01</span>
      </span>
      <span className="flex flex-col justify-center px-2.5 py-1.5 leading-none">
        <span className="font-tiny text-[6px] uppercase tracking-wide text-ink/60">{fromMain ? 'Your return ticket' : 'Main portfolio'}</span>
        <span className="mt-1 flex items-center gap-1 font-display text-[13px]">
          <span className="font-mono text-[12px] font-medium" aria-hidden="true">
            ←
          </span>
          Portfolio 01
        </span>
        <span className="mt-1 hidden font-mono text-[9px] text-ink/80 sm:block">{mainHost}</span>
      </span>
    </a>
  )
}
