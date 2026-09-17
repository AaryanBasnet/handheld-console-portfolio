/** SweetNest configurator options. Sample values for the cartridge, not the product catalogue. */
export interface CakeOption {
  id: 'shape' | 'tiers' | 'flavour' | 'icing' | 'topping'
  label: string
  values: string[]
}

export const cakeOptions: CakeOption[] = [
  { id: 'shape', label: 'Shape', values: ['Round', 'Square', 'Heart'] },
  { id: 'tiers', label: 'Tiers', values: ['1', '2', '3'] },
  { id: 'flavour', label: 'Flavour', values: ['Vanilla', 'Chocolate', 'Strawberry', 'Lemon'] },
  { id: 'icing', label: 'Icing', values: ['Pink', 'Mint', 'White'] },
  { id: 'topping', label: 'Topping', values: ['Cherries', 'Candles', 'Sprinkles', 'None'] },
]
