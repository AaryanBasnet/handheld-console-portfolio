/** CrownHour shop data. Sample models written for this cartridge, not catalogue items. */
export interface Watch {
  name: string
  line: string
  price: string
  /** case outline drawn on screen */
  shape: 'round' | 'square' | 'cushion'
}

export const watches: Watch[] = [
  { name: 'Meridian 40', line: 'Classic', price: 'NPR 185,000', shape: 'round' },
  { name: 'Everest Chrono', line: 'Sport', price: 'NPR 240,000', shape: 'cushion' },
  { name: 'Kumari Petite', line: 'Dress', price: 'NPR 150,000', shape: 'square' },
]

/** Generic checkout steps for the cartridge. */
export const checkoutSteps = ['Cart', 'Address', 'Payment', 'Place order']

/** Generic tracking stages for the cartridge. */
export const trackingStages = ['Placed', 'Packed', 'Shipped', 'Delivered']
