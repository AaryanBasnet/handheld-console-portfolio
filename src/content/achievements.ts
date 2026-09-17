export interface Achievement {
  id: string
  title: string
  how: string
}

export const achievements: Achievement[] = [
  { id: 'power', title: 'First light', how: 'Turn the device on.' },
  { id: 'insert', title: 'Click', how: 'Insert a cartridge.' },
  { id: 'manual', title: 'Read the manual', how: 'Open a manual with SELECT.' },
  { id: 'flip', title: 'Flipped', how: 'Look at the back of the device.' },
  { id: 'link', title: 'Linked', how: 'Open the link cable port.' },
  { id: 'collector', title: 'Collector', how: 'Boot every shelf cartridge.' },
  { id: 'bargain', title: 'Bargain hunter', how: 'Read a bargain bin manual.' },
  { id: 'bilingual', title: 'दुई भाषा', how: 'Switch TIA to Nepali.' },
  { id: 'boss', title: 'Patched', how: 'Clear the RCE room in CrowdShield.' },
  { id: 'dungeon', title: 'Full report', how: 'Clear all 9 rooms in CrowdShield.' },
  { id: 'harvest', title: 'First harvest', how: 'Harvest a tomato in Ripe.' },
  { id: 'booked', title: 'Reservation', how: 'Complete a booking in Venure.' },
  { id: 'order', title: 'Wound up', how: 'Place an order in CrownHour.' },
  { id: 'baked', title: 'Baked', how: 'Bake a cake in SweetNest.' },
  { id: 'secret', title: 'Dev kit', how: 'Enter the secret sequence.' },
  { id: 'gamepad', title: 'Wired', how: 'Use a physical controller.' },
  { id: 'palette', title: 'Contrast', how: 'Turn the contrast wheel.' },
]
