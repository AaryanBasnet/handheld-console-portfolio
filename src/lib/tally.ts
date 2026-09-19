import type { Cartridge } from '../content/cartridges'

/**
 * How many cartridges have been booted, out of every listed one (the hidden
 * dev kit only counts once it's unlocked and shelved). The save file and the
 * Game cases panel both use this, so they always show the same numbers.
 */
export function cartTally(available: Cartridge[], booted: string[]) {
  const listed = available.filter((c) => c.bin !== 'hidden')
  return { played: listed.filter((c) => booted.includes(c.id)).length, total: listed.length }
}
