/** Ripe build log, shown on the LOG sign. What exists in the Godot project so far. */
export interface LogEntry {
  title: string
  note?: string
}

export const ripeLog: LogEntry[] = [
  { title: 'Shop UI', note: 'Buy seeds and tools.' },
  { title: 'Inventory', note: 'Hold seeds, water and harvested tomatoes.' },
  { title: 'Terrain system' },
  { title: 'Texture system' },
]

export const ripeStatus = 'EARLY ACCESS · NOT FINISHED'
