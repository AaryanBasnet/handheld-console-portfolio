/**
 * The 9 rooms of the CrowdShield dungeon, one per finding in the report.
 * Scores and vectors are copied from the report's findings table.
 * Never put payloads here. Findings and method only.
 */
export interface Room {
  /** the report's own id for the finding */
  id: string
  name: string
  /** label on the map tile */
  short: string
  cvss: number
  /** CVSS 3.1 vector string, as reported */
  vector: string
  boss?: boolean
}

export const rooms: Room[] = [
  { id: 'CVE-001', name: 'Local File Inclusion leading to Remote Code Execution', short: 'RCE', cvss: 10.0, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', boss: true },
  { id: 'CVE-002', name: 'Bounty Amount Manipulation', short: 'BOUNTY', cvss: 9.3, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:N/I:H/A:H' },
  { id: 'CVE-003', name: 'Server-Side Request Forgery with Arbitrary File Read', short: 'SSRF', cvss: 9.1, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:L/A:L' },
  { id: 'CVE-004', name: 'SQL Injection in OTP Verification', short: 'SQLI', cvss: 9.8, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
  { id: 'CVE-005', name: 'Mass Assignment Privilege Escalation', short: 'MASS', cvss: 9.3, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:L/I:H/A:L' },
  { id: 'CVE-006', name: 'Insecure Direct Object Reference', short: 'IDOR', cvss: 8.1, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N' },
  { id: 'CVE-007', name: 'Stored XSS in Bio Field', short: 'XSS·BIO', cvss: 7.1, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:L' },
  { id: 'CVE-008', name: 'Stored XSS in Comments', short: 'XSS·CMT', cvss: 7.1, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:L' },
  { id: 'CVE-009', name: 'Reflected XSS in Search', short: 'XSS·SRCH', cvss: 6.1, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N' },
]

export const ptesPhases = [
  'Pre-engagement',
  'Intelligence gathering',
  'Threat modelling',
  'Vulnerability analysis',
  'Exploitation',
  'Post-exploitation',
  'Reporting',
]

/** CVSS v3 qualitative severity rating scale. */
export const severityBands = [
  { name: 'Low', min: 0.1, max: 3.9 },
  { name: 'Medium', min: 4.0, max: 6.9 },
  { name: 'High', min: 7.0, max: 8.9 },
  { name: 'Critical', min: 9.0, max: 10 },
]

export const bandFor = (cvss: number): string => severityBands.find((b) => cvss >= b.min && cvss <= b.max)?.name ?? 'None'

/** The CVSS 3.1 base metrics the rooms quiz you on, with their spelled-out values. */
export const vectorMetrics = {
  AV: { label: 'Attack vector', values: { N: 'Network', A: 'Adjacent', L: 'Local', P: 'Physical' } },
  PR: { label: 'Privileges required', values: { N: 'None', L: 'Low', H: 'High' } },
  UI: { label: 'User interaction', values: { N: 'None', R: 'Required' } },
  S: { label: 'Scope', values: { U: 'Unchanged', C: 'Changed' } },
} as const

export type MetricKey = keyof typeof vectorMetrics

/** Read one metric out of a vector string: metric('…/PR:L/…', 'PR') → 'Low'. */
export function metric(vector: string, key: MetricKey): string {
  const code = vector.split('/').find((p) => p.startsWith(`${key}:`))?.slice(key.length + 1) ?? ''
  const values = vectorMetrics[key].values as Record<string, string>
  return values[code] ?? code
}
