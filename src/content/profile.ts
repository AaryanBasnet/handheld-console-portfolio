/**
 * Everything about the person. Edit freely; nothing here is used by logic
 * beyond being displayed.
 */
export const profile = {
  name: 'Aaryan Basnet',
  shortName: 'Aaryan',
  location: 'Kathmandu, Nepal',
  degree: 'BSc (Hons) Computing, First Class',
  college: 'Softwarica College of IT & E-Commerce',
  affiliation: 'affiliated with Coventry University',
  areas: ['Full-stack development', 'AI/ML systems', 'Cybersecurity', 'Game dev'],
  saveSlot: 'SAVE 01',
  /** The save-file screen is small: short forms of the facts above, one line each. */
  save: {
    class: ['BSc (Hons) Computing', 'First Class'],
    guild: 'Softwarica · Coventry Univ.',
    abilities: ['Full-stack · AI/ML', 'Security · Game dev'],
    /** A flavour line, not a claim. Change it to "Open to opportunities" only if that is true. */
    status: 'Building new things',
  },
  otherPortfolio: { label: 'Editorial portfolio', url: 'https://aaryanbasnet.com.np/' },
}

export const contact = {
  intro: 'Plug in to reach me.',
  links: [
    { label: 'Email', value: 'basnetaryan1011@gmail.com', href: 'mailto:basnetaryan1011@gmail.com' },
    { label: 'GitHub', value: 'github.com/AaryanBasnet', href: 'https://github.com/AaryanBasnet' },
    { label: 'LinkedIn', value: 'linkedin.com/in/aaryan-basnet-4511a22a4', href: 'https://www.linkedin.com/in/aaryan-basnet-4511a22a4/' },
  ],
}

export const colophon = {
  deviceName: 'KHEL·1',
  deviceTagline: 'khel (खेल): play',
  stack: [
    { part: 'CPU', value: 'React 19' },
    { part: 'BUS', value: 'React Router 8' },
    { part: 'BUILD', value: 'Vite 8 + TypeScript' },
    { part: 'PAINT', value: 'Tailwind CSS 4 + CSS 3D transforms' },
    { part: 'SOUND', value: 'Web Audio API, synthesized at runtime' },
    { part: 'SAVE', value: 'localStorage' },
    { part: 'PAD', value: 'Gamepad API' },
  ],
  fonts: [
    { role: 'Device branding', value: 'Bagel Fat One' },
    { role: 'Screen', value: 'Pixelify Sans' },
    { role: 'Labels', value: 'Silkscreen' },
    { role: 'Manuals', value: 'IBM Plex Sans / IBM Plex Mono' },
    { role: 'Nepali', value: 'Noto Sans Devanagari' },
    { role: 'Served via', value: 'Fontsource, self-hosted' },
  ],
  credits: [
    'Design and code: Aaryan Basnet',
    'No audio files. No 3D model files. No canvas outside mini-games.',
    'The device is an original design.',
  ],
  secretHint: 'SEQ ↓↓↑↑BBA',
}
