/**
 * Venure town data. Three sample venues in and around Kathmandu, written for
 * this cartridge; they are not listings from the product.
 */
export interface Venue {
  name: string
  kind: string
  capacity: string
  price: string
  /** which filters this venue satisfies */
  tags: string[]
  /** where it stands in the 3×3 town */
  tile: number
}

export const filterNames = ['Catering', 'Parking', 'Outdoor']

export const venues: Venue[] = [
  { name: 'Bagmati Banquet', kind: 'Banquet hall', capacity: '400 guests', price: 'NPR 60,000 / day', tags: ['Catering', 'Parking'], tile: 0 },
  { name: 'Thamel Courtyard', kind: 'Courtyard', capacity: '120 guests', price: 'NPR 25,000 / day', tags: ['Catering', 'Outdoor'], tile: 4 },
  { name: 'Nagarkot Hill Lawn', kind: 'Resort lawn', capacity: '250 guests', price: 'NPR 85,000 / day', tags: ['Parking', 'Outdoor'], tile: 8 },
]

/** The town is a 3×3 grid. Two tiles are fixtures, not venues. */
export const TOWN_COLS = 3
export const TOWN_TILES = 9
export const FILTERS_TILE = 2
export const OWNER_TILE = 6
