import { useEffect, useState } from 'react'
import { useAnnounce, useCartInput, useDevice } from '../../device/DeviceProvider'
import { ScreenFrame } from '../../screens/ScreenFrame'
import { tiaAccuracy, tiaExchanges } from '../../content/tia-transcript'
import { sfx } from '../../audio/synth'
import type { CartProps } from '../index'

type Lang = 'en' | 'ne'
type Phase = 'ask' | 'answer'

/** One line of text as split-flap board characters, each flipping in once. */
function FlapText({ id, text, shown }: { id: string; text: string; shown: number }) {
  return (
    <>
      {text
        .slice(0, shown)
        .split('')
        .map((ch, idx) =>
          ch === ' ' ? (
            <span key={`${id}-${idx}`} className="inline-block" style={{ width: '0.5em' }}>
              {' '}
            </span>
          ) : (
            <span key={`${id}-${idx}`} className="flap-char px-[0.06em]" style={{ animationDelay: `${(idx % 10) * 14}ms` }}>
              {ch}
            </span>
          ),
        )}
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
  const { unlock, reducedMotion } = useDevice()
  const [i, setI] = useState(0)
  const [lang, setLang] = useState<Lang>('en')
  const [phase, setPhase] = useState<Phase>('ask')
  const [shown, setShown] = useState(0)

  const ex = tiaExchanges[i]
  const text = phase === 'ask' ? ex.question[lang] : ex.answer[lang]
  const done = shown >= text.length

  useEffect(() => {
    setShown(reducedMotion ? text.length : 0)
  }, [text, reducedMotion])

  useEffect(() => {
    if (done) return
    const t = window.setInterval(() => setShown((s) => s + 1), 26)
    return () => window.clearInterval(t)
  }, [done, text])

  // a new row is being posted to the board: give it the mechanical flip sound
  useEffect(() => {
    sfx.flip()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, lang, phase])

  useAnnounce(phase === 'ask' ? `Passenger: ${ex.question[lang]}` : `TIA: ${ex.answer[lang]} Tool called: ${ex.tool}.`)

  const advance = () => {
    if (!done) {
      setShown(text.length)
      return
    }
    if (phase === 'ask') {
      setPhase('answer')
      sfx.confirm()
    } else {
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
            <p className="t-xs flex-1 leading-snug" lang={lang}>
              {phase === 'ask' ? <FlapText id={`q${i}-${lang}`} text={text} shown={shown} /> : ex.question[lang]}
              {phase === 'ask' && !done && <span className="blink">▌</span>}
            </p>
          </div>

          {phase === 'answer' && (
            <>
              <div className="mt-[2cqw] flex items-start gap-[2cqw]">
                <span className="t-xs shrink-0 border border-current px-[1cqw] py-[0.3cqw] text-center uppercase" style={{ minWidth: '18cqw' }}>
                  TIA
                </span>
                <p className="t-xs flex-1 leading-snug" lang={lang}>
                  <FlapText id={`a${i}-${lang}`} text={text} shown={shown} />
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

        <div className="t-xs mt-[1.5cqw] flex justify-between uppercase opacity-70">
          <span>Scripted sample, not a live model</span>
          <span>Tool accuracy: {tiaAccuracy}</span>
        </div>
      </div>
    </ScreenFrame>
  )
}
