import { formatDuration } from '@/lib/time'
import type { DayMetrics } from '@/lib/day-metrics'

type DayLoadProps = Pick<
  DayMetrics,
  'fixedMinutes' | 'flexibleMinutes' | 'doneMinutes' | 'blockedMinutes' | 'openMinutes'
>

export function DayLoad({
  fixedMinutes,
  flexibleMinutes,
  doneMinutes,
  blockedMinutes,
  openMinutes,
}: DayLoadProps) {
  const segments = [
    { label: 'Fixed', minutes: fixedMinutes, className: 'bg-fixed' },
    { label: 'Flexible', minutes: flexibleMinutes, className: 'bg-flex' },
    { label: 'Done', minutes: doneMinutes, className: 'bg-muted-foreground/45' },
    { label: 'Blocked', minutes: blockedMinutes, className: 'bg-muted-foreground/35' },
    { label: 'Open', minutes: openMinutes, className: 'bg-muted-foreground/15' },
  ].filter((s) => s.minutes > 0)

  const total = segments.reduce((sum, s) => sum + s.minutes, 0)
  const pct = (m: number) => (total === 0 ? 0 : (m / total) * 100)

  return (
    <section
      aria-label="Day load"
      className="rounded-2xl border border-glass-border bg-glass p-4 backdrop-blur-xl"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">Day load</h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDuration(openMinutes)} open
        </span>
      </div>

      <div
        className="mt-3 flex h-1.5 gap-px overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={segments
          .map((s) => `${formatDuration(s.minutes)} ${s.label.toLowerCase()}`)
          .join(', ')}
      >
        {segments.map((s) => (
          <span
            key={s.label}
            className={s.className}
            style={{ width: `${pct(s.minutes)}%` }}
          />
        ))}
      </div>

      <dl className="mt-3.5 flex flex-col gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.className}`}
            />
            <dt className="flex-1 text-xs text-muted-foreground">{s.label}</dt>
            <dd className="font-mono text-xs tabular-nums">
              {formatDuration(s.minutes)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
