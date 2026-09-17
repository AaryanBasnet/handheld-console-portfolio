/**
 * Cartridge data. One entry per project. Edit text here, not in components.
 * Any value written as 'TODO' is a placeholder to fill in.
 */
export type CartId =
  | 'tia'
  | 'crowdshield'
  | 'venure'
  | 'ripe'
  | 'crownhour'
  | 'sweetnest'
  | 'devkit'

export interface Palette {
  name: string
  bg: string
  fg: string
  mid: string
  accent: string
}

export interface ManualSection {
  heading: string
  /** paragraphs */
  body?: string[]
  /** bullet points */
  bullets?: string[]
}

export interface Cartridge {
  id: CartId
  title: string
  /** shown under the title on labels and in the menu */
  tag: string
  /** shelf = main shelf, bargain = bargain bin (small programs), hidden = unlock by combo */
  bin: 'shelf' | 'bargain' | 'hidden'
  status: 'Released' | 'Early access' | 'Concept' | 'Thesis' | 'Report' | 'System'
  /** label art colours */
  label: { bg: string; fg: string; accent: string }
  palette: Palette
  /** jingle as MIDI note numbers, played on boot */
  jingle: number[]
  stack: string[]
  summary: string
  /** one-line hint for the controls on the cart's screen */
  controls: string
  manual: ManualSection[]
  links: { label: string; href: string }[]
}

export const cartridges: Cartridge[] = [
  {
    id: 'tia',
    title: 'TIA',
    tag: 'Virtual Assistant',
    bin: 'shelf',
    status: 'Thesis',
    label: { bg: '#2d3bff', fg: '#fffdf5', accent: '#ffe45e' },
    palette: { name: 'Departure Board', bg: '#0d0d0d', fg: '#ffb703', mid: '#6b5124', accent: '#ff4a2b' },
    jingle: [67, 71, 74, 79],
    stack: ['Python', 'LangGraph', 'ChromaDB', 'Ollama'],
    summary: 'Bilingual English/Nepali chatbot for Tribhuvan International Airport. Final-year thesis.',
    controls: 'A: answer / next · START: EN/NE',
    manual: [
      {
        heading: 'What it is',
        body: [
          'A virtual assistant for Tribhuvan International Airport in Kathmandu. It answers passenger questions in English and Nepali.',
          'Built as the final-year thesis for a BSc (Hons) Computing degree.',
        ],
      },
      {
        heading: 'How it works',
        bullets: [
          'LangGraph ReAct agents decide which tool to call for each question.',
          'Retrieval-augmented generation over airport documents stored in ChromaDB.',
          'A local LLM served by Ollama. No external API calls.',
          'Written in Python.',
        ],
      },
      {
        heading: 'Result',
        bullets: ['93.75% tool selection accuracy on the evaluation set.'],
      },
      {
        heading: 'Tools',
        bullets: [
          'get_general_airport_info: RAG over airport documents. Facilities, customs and immigration, baggage, visas, transport.',
          'get_flight_status_from_json: status of one flight by its code, such as RA205 or FZ575.',
          'search_flights_by_route: flights by city or route, such as flights from Dubai.',
          'get_kathmandu_weather_openmeteo: current Kathmandu weather.',
          'process_sim_card_kyc: SIM card KYC when the module is available. Validates the passport MRZ and runs face recognition.',
        ],
      },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/AaryanBasnet/TARA' }],
  },
  {
    id: 'crowdshield',
    title: 'CrowdShield',
    tag: 'Penetration test',
    bin: 'shelf',
    status: 'Report',
    label: { bg: '#ff4a2b', fg: '#111111', accent: '#fffdf5' },
    palette: { name: 'Dungeon', bg: '#2a1f2e', fg: '#ffd9a8', mid: '#7a4b5c', accent: '#ff4a2b' },
    jingle: [55, 58, 62, 55],
    stack: ['PTES', 'CVSS', 'Formal report'],
    summary: 'Academic penetration test of a bug bounty platform. 9 findings, 5 critical, formal report.',
    controls: 'D-PAD: move · A: enter/answer · START: report',
    manual: [
      {
        heading: 'What it is',
        body: [
          'An academic penetration test of a bug bounty platform, carried out with the PTES methodology and written up as a formal report with CVSS scores.',
          'This cartridge shows methodology and findings only. No exploit payloads are published anywhere on this site.',
        ],
      },
      {
        heading: 'Findings',
        body: ['9 findings, scored with CVSS 3.1:'],
        bullets: [
          'CVE-001 · Local File Inclusion leading to Remote Code Execution · 10.0 Critical',
          'CVE-002 · Bounty Amount Manipulation · 9.3 Critical',
          'CVE-003 · Server-Side Request Forgery with Arbitrary File Read · 9.1 Critical',
          'CVE-004 · SQL Injection in OTP Verification · 9.8 Critical',
          'CVE-005 · Mass Assignment Privilege Escalation · 9.3 Critical',
          'CVE-006 · Insecure Direct Object Reference · 8.1 High',
          'CVE-007 · Stored XSS in Bio Field · 7.1 High',
          'CVE-008 · Stored XSS in Comments · 7.1 High',
          'CVE-009 · Reflected XSS in Search · 6.1 Medium',
        ],
      },
      {
        heading: 'Method',
        bullets: [
          'PTES phases: pre-engagement, intelligence gathering, threat modelling, vulnerability analysis, exploitation, post-exploitation, reporting.',
          'Each finding scored with CVSS 3.1, with a full vector string.',
          'Formal report delivered.',
        ],
      },
    ],
    links: [],
  },
  {
    id: 'venure',
    title: 'Venure',
    tag: 'Venue booking',
    bin: 'shelf',
    status: 'Released',
    label: { bg: '#111111', fg: '#ffe45e', accent: '#ff9ecf' },
    palette: { name: 'Deco', bg: '#1c1f26', fg: '#ffe45e', mid: '#6b6a5a', accent: '#ff9ecf' },
    jingle: [64, 68, 71, 76],
    stack: ['React', 'Tailwind', 'Redux'],
    summary: 'Venue booking platform. Advanced filters, multi-step booking, owner dashboard.',
    controls: 'D-PAD: walk · A: open · START: owner desk',
    manual: [
      {
        heading: 'What it is',
        body: ['A platform for finding and booking venues. Two sides: people who book, and owners who list and manage venues.'],
      },
      {
        heading: 'Features',
        bullets: [
          'Advanced filters for browsing venues.',
          'Multi-step booking flow.',
          'Owner dashboard.',
        ],
      },
      { heading: 'Stack', bullets: ['React', 'Tailwind CSS', 'Redux'] },
    ],
    links: [
      { label: 'Live', href: 'https://venure-frontend.vercel.app/' },
    ],
  },
  {
    id: 'ripe',
    title: 'Ripe',
    tag: 'Tomato farming',
    bin: 'shelf',
    status: 'Early access',
    label: { bg: '#34c77b', fg: '#111111', accent: '#ff4a2b' },
    palette: { name: 'Tomato', bg: '#ffe9dc', fg: '#4a1a0b', mid: '#ff8a6a', accent: '#34c77b' },
    jingle: [62, 66, 69, 74, 78],
    stack: ['Godot 4', 'GDScript'],
    summary: 'Solo tomato farming simulator. In development. Not finished.',
    controls: 'LEFT/RIGHT: plot · A: act · START: shop',
    manual: [
      {
        heading: 'Status: not finished',
        body: ['Ripe is in development and is not a finished game. This cartridge is an early-access preview built for this site, not a Godot export.'],
      },
      {
        heading: 'What it is',
        body: ['A tomato farming simulator, made solo in Godot 4 with GDScript.'],
      },
      {
        heading: 'Built so far',
        bullets: ['Shop UI', 'Inventory', 'Terrain system', 'Texture system'],
      },
    ],
    links: [],
  },
  {
    id: 'crownhour',
    title: 'CrownHour',
    tag: 'Watch store',
    bin: 'bargain',
    status: 'Released',
    label: { bg: '#111111', fg: '#e8d8a8', accent: '#ffe45e' },
    palette: { name: 'Brass', bg: '#111111', fg: '#e8d8a8', mid: '#6a5a3a', accent: '#ffe45e' },
    jingle: [60, 67],
    stack: ['MongoDB', 'Express', 'React', 'Node'],
    summary: 'Luxury watch e-commerce site on the MERN stack.',
    controls: 'LEFT/RIGHT: model · A: add · START: checkout',
    manual: [
      {
        heading: 'What it is',
        body: ['An e-commerce site for luxury watches, built on MongoDB, Express, React and Node.'],
      },
      {
        heading: 'Features',
        bullets: ['Product browsing', 'Cart', 'Checkout', 'Order tracking', 'Admin dashboard'],
      },
    ],
    links: [],
  },
  {
    id: 'sweetnest',
    title: 'SweetNest',
    tag: 'Cake configurator',
    bin: 'bargain',
    status: 'Concept',
    label: { bg: '#ff9ecf', fg: '#111111', accent: '#34c77b' },
    palette: { name: 'Icing', bg: '#ffe3ef', fg: '#5a1f3a', mid: '#ff9ecf', accent: '#34c77b' },
    jingle: [72, 76],
    stack: ['Concept'],
    summary: '3D cake customization configurator. Concept only.',
    controls: 'UP/DOWN: option · LEFT/RIGHT: change · A: bake',
    manual: [
      {
        heading: 'What it is',
        body: ['A concept for a 3D cake customization tool: pick a shape, tiers, flavours and decoration, and see the cake update in 3D.'],
      },
      { heading: 'Status', body: ['Concept only. Nothing has been built.'] },
    ],
    links: [],
  },
  {
    id: 'devkit',
    title: 'DEV KIT',
    tag: 'System cartridge',
    bin: 'hidden',
    status: 'System',
    label: { bg: '#111111', fg: '#34c77b', accent: '#ffe45e' },
    palette: { name: 'Terminal', bg: '#0d1a12', fg: '#34c77b', mid: '#1f5a3a', accent: '#ffe45e' },
    jingle: [48, 60, 72, 84],
    stack: ['KHEL·1'],
    summary: 'Hidden system cartridge. Sound test, palette test, input monitor.',
    controls: 'UP/DOWN: page · A: run',
    manual: [
      {
        heading: 'Unlocked',
        body: ['You entered the sequence. This cartridge exposes the hardware: a sound test, a palette test and an input monitor.'],
      },
    ],
    links: [],
  },
]

export const cartById = (id: string | undefined): Cartridge | undefined =>
  cartridges.find((c) => c.id === id)

/** Screen palettes cycled by the contrast wheel */
export const devicePalettes: Palette[] = [
  { name: 'Pea', bg: '#d9e8a8', fg: '#1a2c14', mid: '#7ea35b', accent: '#3a5a2a' },
  { name: 'Butter', bg: '#ffe45e', fg: '#111111', mid: '#c9a800', accent: '#2d3bff' },
  { name: 'Cobalt', bg: '#2d3bff', fg: '#fffdf5', mid: '#7d86ff', accent: '#ffe45e' },
  { name: 'Ink', bg: '#111111', fg: '#fffdf5', mid: '#555555', accent: '#ff4a2b' },
  { name: 'Pink', bg: '#ff9ecf', fg: '#111111', mid: '#d66aa3', accent: '#2d3bff' },
]

export const shellColors = [
  { name: 'Butter', value: '#ffe45e', ink: '#111111' },
  { name: 'Cobalt', value: '#2d3bff', ink: '#fffdf5' },
  { name: 'Tomato', value: '#ff4a2b', ink: '#111111' },
  { name: 'Pink', value: '#ff9ecf', ink: '#111111' },
  { name: 'Leaf', value: '#34c77b', ink: '#111111' },
  { name: 'Paper', value: '#fffdf5', ink: '#111111' },
] as const

/** Secret sequence that unlocks the hidden cartridge */
export const secretSequence = ['down', 'down', 'up', 'up', 'b', 'b', 'a'] as const
