import { Fragment, useEffect, useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { ScreenFrame } from '../../screens/ScreenFrame'
import { tiaAccuracy, tiaExchanges } from '../../content/tia-transcript'
import { sfx } from '../../audio/synth'
import type { CartProps } from '../index'

type Lang = 'en' | 'ne'
type Phase = 'ask' | 'answer'

/**
 * One line of text as split-flap board pieces, each flipping in once. English
 * flips letter by letter. Nepali flips word by word (byWord): a Devanagari
 * letter can't be drawn on its own, because vowel signs and the virama attach
 * to the consonant before them, so a word is the smallest piece that holds.
 * `shown` counts letters, or words when byWord.
 */
function FlapText({ id, text, shown, byWord }: { id: string; text: string; shown: number; byWord: boolean }) {
  if (byWord) {
    const words = text.split(' ').slice(0, shown)
    return (
      <>
        {words.map((word, i) => (
          <Fragment key={`${id}-${i}`}>
            <span className="flap-word" style={{ animationDelay: `${(i % 6) * 30}ms` }}>
              {word}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </>
    )
  }
  // Each word is its own unbreakable box, so a line can only wrap between
  // words. Without that, every letter was a break point and words split
  // mid-word ("The g / ates").
  const words = text.slice(0, shown).split(' ')
  let idx = 0
  return (
    <>
      {words.map((word, w) => {
        const cells = word.split('').map((ch) => {
          const i = idx++
          return (
            <span key={`${id}-${i}`} className="flap-char px-[0.06em]" style={{ animationDelay: `${(i % 10) * 14}ms` }}>
              {ch}
            </span>
          )
        })
        idx++ // the space after this word keeps the numbering of the text
        return (
          <Fragment key={`${id}-w${w}`}>
            <span className="inline-block whitespace-nowrap">{cells}</span>
            {/* a real space between the word boxes: it is the line-break point,
                and keeps the text selectable and readable by screen readers */}
            {w < words.length - 1 ? ' ' : ''}
          </Fragment>
        )
      })}
    </>
  )
}

/**
 * TIA's screen is an airport split-flap departure board. A passenger
 * question flaps in, A posts the answer, and under the answer the board
 * notes which tool the ReAct agent called for it. Start (or left/right)
 * re-flips the board into the other language.
 */
export default function TiaCart({ cart }: CartProps) {
  const { unlock, reducedMotion, nudgeNow, unlocked } = useDevice()
  const [i, setI] = useState(0)
  const [lang, setLang] = useState<Lang>('en')
  const [phase, setPhase] = useState<Phase>('ask')
  const [shown, setShown] = useState(0)

  const ex = tiaExchanges[i]
  const text = phase === 'ask' ? ex.question[lang] : ex.answer[lang]
  const byWord = lang === 'ne'
  const total = byWord ? text.split(' ').length : text.length
  const done = shown >= total

  useEffect(() => {
    setShown(reducedMotion ? total : 0)
  }, [text, total, reducedMotion])

  useEffect(() => {
    if (done) return
    const t = window.setInterval(() => setShown((s) => s + 1), byWord ? 90 : 26)
    return () => window.clearInterval(t)
  }, [done, text, byWord])

  // a new row is being posted to the board: give it the mechanical flip sound
  useEffect(() => {
    sfx.flip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, lang, phase])

  useAnnounce(phase === 'ask' ? `Passenger: ${ex.question[lang]}` : `TIA: ${ex.answer[lang]} Tool called: ${ex.tool}.`)

  const advance = () => {
    if (!done) {
      setShown(total)
      return
    }
    if (phase === 'ask') {
      setPhase('answer')
      sfx.confirm()
    } else {
      // the demo has now looped once: point at the manual
      if (i + 1 >= tiaExchanges.length) nudgeNow()
      setI((n) => (n + 1) % tiaExchanges.length)
      setPhase('ask')
      sfx.click()
    }
  }

  useCartInput((b) => {
    if (b === 'start' || b === 'left' || b === 'right') {
      const nextLang: Lang = lang === 'en' ? 'ne' : 'en'
      setLang(nextLang)
      if (nextLang === 'ne') unlock('bilingual')
      return true
    }
    if (b === 'a') {
      advance()
      return true
    }
    return false
  })

  return (
    <ScreenFrame title="TIA · Tribhuvan Intl" right={`${lang === 'en' ? 'EN' : 'NE'} · ${i + 1}/${tiaExchanges.length}`} hint={cart.controls} scroll={false}>
      <div className="flex h-full flex-col">
        <button
          type="button"
          onClick={advance}
          aria-label={phase === 'ask' ? 'Show the answer' : 'Next question'}
          className="flex flex-1 flex-col border-[3px] border-current p-[2cqw] text-left focus-visible:outline-2 focus-visible:outline-current"
          style={{ background: 'var(--lcd-bg)' }}
        >
          <div className="flex items-start gap-[2cqw]">
            <span className="t-xs shrink-0 border border-current px-[1cqw] py-[0.3cqw] text-center uppercase" style={{ minWidth: '18cqw' }}>
              Passenger
            </span>
            <p className={`t-xs flex-1 leading-snug ${byWord ? 'ne-text' : ''}`} lang={lang}>
              {phase === 'ask' ? <FlapText id={`q${i}-${lang}`} text={text} shown={shown} byWord={byWord} /> : ex.question[lang]}
              {phase === 'ask' && !done && <span className="blink">▌</span>}
            </p>
          </div>

          {phase === 'answer' && (
            <>
              <div className="mt-[2cqw] flex items-start gap-[2cqw]">
                <span className="t-xs shrink-0 border border-current px-[1cqw] py-[0.3cqw] text-center uppercase" style={{ minWidth: '18cqw' }}>
                  TIA
                </span>
                <p className={`t-xs flex-1 leading-snug ${byWord ? 'ne-text' : ''}`} lang={lang}>
                  <FlapText id={`a${i}-${lang}`} text={text} shown={shown} byWord={byWord} />
                  {!done && <span className="blink">▌</span>}
                </p>
              </div>
              {done && (
                <div className="t-xs mt-[2cqw] border-t border-dotted border-current pt-[1.5cqw] uppercase opacity-80">
                  <div>Tool called: {ex.tool}</div>
                </div>
              )}
            </>
          )}

          {done && (
            <div className="blink t-xs mt-auto self-end pt-[1cqw]" aria-hidden="true">
              ▼ {phase === 'ask' ? 'A: answer' : 'A: next'}
            </div>
          )}
        </button>

        {phase === 'answer' && done && !unlocked.includes('manual') ? (
          // the interesting moment: stop on it and point at the manual, which
          // explains how the agent picked the tool. Gone once a manual has been read.
          <div className="nudge-pulse t-xs mt-[1.5cqw] font-bold uppercase leading-tight">
            <div>Answer delivered. {tiaAccuracy} tool accuracy.</div>
            <div>How? ▶ Select</div>
          </div>
        ) : (
          <div className="t-xs mt-[1.5cqw] flex justify-between uppercase opacity-70">
            <span>Scripted sample, not a live model</span>
            <span>Tool accuracy: {tiaAccuracy}</span>
          </div>
        )}
      </div>
    </ScreenFrame>
  )
}
