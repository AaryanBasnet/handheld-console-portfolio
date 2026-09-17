const keys: [string, string][] = [
  ['← ↑ → ↓', 'D-pad'],
  ['Z', 'A'],
  ['X', 'B'],
  ['Enter', 'Start'],
  ['Shift', 'Select'],
  ['Esc', 'Close'],
]

export function KeyLegend({ className = '' }: { className?: string }) {
  return (
    <dl className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] ${className}`} aria-label="Keyboard controls">
      {keys.map(([k, v]) => (
        <div key={k} className="flex items-center gap-1">
          <dt className="rounded-sm border-2 border-ink bg-paper px-1.5 py-0.5 font-medium shadow-hard-sm">{k}</dt>
          <dd className="text-ink/80">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
