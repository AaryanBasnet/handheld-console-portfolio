/**
 * All sound is synthesized here with the Web Audio API. No audio files.
 * The context is created and resumed on the first user gesture (unlockAudio).
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null
let volume = 0.6

export function unlockAudio() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = volume * volume
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export function audioReady() {
  return !!ctx && ctx.state === 'running'
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (master && ctx) master.gain.setTargetAtTime(volume * volume, ctx.currentTime, 0.01)
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

type Wave = OscillatorType

function tone(
  freq: number,
  at: number,
  dur: number,
  opts: { type?: Wave; gain?: number; slideTo?: number; attack?: number } = {},
) {
  if (!ctx || !master) return
  const { type = 'square', gain = 0.18, slideTo, attack = 0.004 } = opts
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur)
  g.gain.setValueAtTime(0.0001, at)
  g.gain.linearRampToValueAtTime(gain, at + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(g).connect(master)
  osc.start(at)
  osc.stop(at + dur + 0.02)
}

function noise(at: number, dur: number, gain = 0.25, hp = 800) {
  if (!ctx || !master) return
  const len = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = hp
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(f).connect(g).connect(master)
  src.start(at)
}

const now = () => (ctx ? ctx.currentTime : 0)

export const sfx = {
  /** D-pad tick */
  tick() {
    tone(1200, now(), 0.03, { type: 'square', gain: 0.08 })
  },
  /** A / confirm */
  confirm() {
    const t = now()
    tone(660, t, 0.05, { gain: 0.14 })
    tone(990, t + 0.05, 0.08, { gain: 0.14 })
  },
  /** B / back */
  back() {
    const t = now()
    tone(520, t, 0.05, { gain: 0.12 })
    tone(380, t + 0.05, 0.08, { gain: 0.12 })
  },
  /** Start / Select physical click */
  click() {
    noise(now(), 0.03, 0.2, 2000)
    tone(300, now(), 0.03, { type: 'triangle', gain: 0.1 })
  },
  error() {
    const t = now()
    tone(200, t, 0.12, { type: 'sawtooth', gain: 0.12 })
    tone(150, t + 0.1, 0.16, { type: 'sawtooth', gain: 0.12 })
  },
  /** Power switch + boot chime */
  power() {
    const t = now()
    noise(t, 0.05, 0.25, 1500)
    tone(220, t + 0.15, 0.25, { type: 'triangle', gain: 0.12, slideTo: 440 })
    tone(880, t + 0.45, 0.12, { gain: 0.14 })
    tone(1320, t + 0.58, 0.28, { gain: 0.14 })
  },
  powerOff() {
    const t = now()
    tone(880, t, 0.25, { type: 'triangle', gain: 0.12, slideTo: 110 })
    noise(t, 0.05, 0.15, 1000)
  },
  /** Cartridge seating: slide, then a hard click */
  cartIn() {
    const t = now()
    noise(t, 0.12, 0.12, 400)
    tone(140, t + 0.12, 0.05, { type: 'square', gain: 0.25 })
    noise(t + 0.12, 0.04, 0.35, 3000)
  },
  cartOut() {
    const t = now()
    tone(180, t, 0.04, { type: 'square', gain: 0.2 })
    noise(t + 0.04, 0.1, 0.12, 400)
  },
  /** split-flap board flipping a row into place: a quick mechanical rattle */
  flip() {
    const t = now()
    for (let i = 0; i < 5; i++) {
      noise(t + i * 0.026, 0.018, 0.13, 2600)
    }
  },
  /** Per-cartridge boot jingle from MIDI note numbers */
  jingle(notes: number[]) {
    const t = now()
    notes.forEach((n, i) => {
      tone(midi(n), t + i * 0.09, 0.16, { gain: 0.14 })
      tone(midi(n) / 2, t + i * 0.09, 0.16, { type: 'triangle', gain: 0.08 })
    })
  },
  achieve() {
    const t = now()
    ;[76, 80, 83, 88].forEach((n, i) => tone(midi(n), t + i * 0.06, 0.2, { gain: 0.12 }))
  },
  /** Generic note for the sound test / mini-games */
  note(n: number, dur = 0.15, type: Wave = 'square') {
    tone(midi(n), now(), dur, { type, gain: 0.14 })
  },
  hit() {
    const t = now()
    noise(t, 0.08, 0.3, 600)
    tone(160, t, 0.08, { type: 'square', gain: 0.18, slideTo: 60 })
  },
  water() {
    const t = now()
    tone(900, t, 0.12, { type: 'sine', gain: 0.12, slideTo: 300 })
  },
  wheel() {
    noise(now(), 0.02, 0.12, 4000)
  },
}
