/** navigator.vibrate is absent on iOS Safari; check before calling. */
const supported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

export function vibrate(pattern: number | number[] = 8) {
  if (!supported) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* ignore */
  }
}

export const hapticsSupported = supported
