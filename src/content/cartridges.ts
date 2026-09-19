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
  /** second line of the boot-screen tip: what this cartridge's manual holds */
  tip: string
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
    tip: 'See how TIA chooses its tools.',
    manual: [
      {
        heading: 'What it is',
        body: [
          'A virtual assistant for Tribhuvan International Airport in Kathmandu. It answers passenger questions in English or Nepali and reports flight status.',
          'Airport information is scattered across FAQs and status sources, and many passengers want answers in Nepali. The assistant pulls it together with retrieval-augmented generation and a LangGraph ReAct agent, running local models.',
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
      {
        heading: 'Role',
        bullets: ['AI system design', 'RAG pipeline', 'Backend prototyping'],
      },
      { heading: 'Year', body: ['2026'] },
    ],
    links: [{ label: 'Repository', href: 'https://github.com/AaryanBasnet/TARA' }],
  },
  {
    id: 'crowdshield',
    title: 'CrowdShield',
    tag: 'Penetration test',
    bin: 'bargain',
    status: 'Report',
    label: { bg: '#ff4a2b', fg: '#111111', accent: '#fffdf5' },
    palette: { name: 'Dungeon', bg: '#2a1f2e', fg: '#ffd9a8', mid: '#7a4b5c', accent: '#ff4a2b' },
    jingle: [55, 58, 62, 55],
    stack: ['PTES', 'CVSS', 'Formal report'],
    summary: 'Academic penetration test of a bug bounty platform. 9 findings, 5 critical, formal report.',
    controls: 'D-PAD: move · A: enter/answer · START: report',
    tip: 'Read what the pen test found.',
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
    stack: ['React', 'Flutter', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Stripe', 'Playwright', 'Tailwind', 'Redux'],
    summary: 'Marketplace for booking banquet and wedding venues by date and time slot. Customer, venue-owner and admin roles. Web and mobile.',
    controls: 'D-PAD: walk · A: open · START: owner desk',
    tip: 'See its features and stack.',
    manual: [
      {
        heading: 'What it is',
        body: [
          'A marketplace for booking banquet and wedding venues by date and time slot, with separate customer, venue-owner and admin roles. A React web app, a Flutter mobile app and a Node/Express backend.',
          'Customers need to compare venues and book a slot quickly, and owners need one place to manage listings and requests. Venure handles both.',
        ],
      },
      {
        heading: 'Features',
        bullets: [
          'Advanced filters for browsing venues.',
          'Multi-step booking flow.',
          'Owner dashboard.',
          'Role-based access, enforced on the API and in both apps.',
          'Live chat between clients and owners over Socket.io.',
          'Stripe payments. On mobile, a biometric check gates every payment.',
        ],
      },
      {
        heading: 'Testing',
        body: ['11 Playwright end-to-end tests cover auth, favorites, Stripe booking, owner venue management with image upload, and admin approval.'],
      },
      { heading: 'Role', bullets: ['Full-stack: backend, React web app, Flutter app'] },
      { heading: 'Year', body: ['2025'] },
    ],
    links: [
      { label: 'Live', href: 'https://venure-frontend.vercel.app/' },
      { label: 'Frontend repository', href: 'https://github.com/AaryanBasnet/venure-frontend' },
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
    tip: "See what's built so far.",
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
    stack: ['MongoDB', 'Express', 'React', 'Node', 'Stripe', 'Cloudinary'],
    summary: 'Luxury watch store on the MERN stack, with an admin dashboard and a security-focused login system.',
    controls: 'LEFT/RIGHT: model · A: add · START: checkout',
    tip: 'See what the store covers.',
    manual: [
      {
        heading: 'What it is',
        body: [
          'A store for luxury watches, built on MongoDB, Express, React and Node. Shoppers get carts, wishlists and order tracking. Admins get a dashboard for inventory and analytics.',
        ],
      },
      {
        heading: 'Features',
        bullets: ['Product browsing', 'Cart and wishlist', 'Checkout', 'Order tracking', 'Admin dashboard for inventory and analytics'],
      },
      {
        heading: 'Security',
        bullets: [
          'Login uses JWTs in HTTP-only cookies with session versioning, so logging out or changing a password ends every active session.',
          'TOTP multi-factor auth with backup codes.',
          'An audit log of admin actions, logins and failed attempts.',
          'Helmet headers, rate limiting and Zod validation on requests.',
        ],
      },
      { heading: 'Role', bullets: ['Full-stack development', 'Product UI', 'Admin workflows'] },
      { heading: 'Year', body: ['2025'] },
    ],
    links: [],
  },
  {
    id: 'sweetnest',
    title: 'SweetNest',
    tag: 'Custom cakes',
    bin: 'shelf',
    status: 'Released',
    label: { bg: '#ff9ecf', fg: '#111111', accent: '#34c77b' },
    palette: { name: 'Icing', bg: '#ffe3ef', fg: '#5a1f3a', mid: '#ff9ecf', accent: '#34c77b' },
    jingle: [72, 76],
    stack: ['React', 'Three.js', 'Zustand', 'React Query', 'Express', 'MongoDB'],
    summary: 'Custom cake platform. Interactive 3D cake customization, eSewa payments, loyalty rewards, order tracking.',
    controls: 'UP/DOWN: option · LEFT/RIGHT: change · A: bake',
    tip: 'See the features and my role.',
    manual: [
      {
        heading: 'What it is',
        body: [
          'A custom cake ordering platform. Ordering a custom cake needs to feel visual and flexible, and the business needs secure payments, order tracking and customer retention. SweetNest covers both.',
          'Customers build their cake in an interactive 3D customizer on the front end. Behind it sit eSewa payments, loyalty rewards and a secure Node.js and MongoDB backend.',
        ],
      },
      {
        heading: 'Features',
        bullets: [
          'Interactive 3D cake customization: size, toppers, colours and custom text, with a 3D preview and live price updates',
          'eSewa payment integration, with server-side verification at checkout',
          'Loyalty rewards, with loyalty points and coupon validation endpoints',
          'Order tracking',
          'Secure Node.js / MongoDB backend',
        ],
      },
      {
        heading: 'How it is built',
        bullets: ['UI state lives in Zustand and server data in React Query, which keeps the customizer responsive.'],
      },
      {
        heading: 'Role',
        bullets: ['Full-stack development', '3D customization', 'Payment integration'],
      },
      { heading: 'Year', body: ['2025'] },
    ],
    links: [
      { label: 'Frontend repository', href: 'https://github.com/AaryanBasnet/SweetNestFrontend' },
      { label: 'Backend repository', href: 'https://github.com/AaryanBasnet/SweetNestBackend' },
    ],
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
    tip: 'See what the dev kit does.',
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
