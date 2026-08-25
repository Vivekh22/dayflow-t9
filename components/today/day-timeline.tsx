'use client'

import { useEffect, useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import { TimelineBlock } from './timeline-block'
import { formatDuration, formatTime, minuteOfDay } from '@/lib/time'
import { layoutTimeline } from '@/lib/timeline-layout'
import type { AvailabilityBlock, MinuteOfDay, TimelineEntry } from '@/lib/types'

interface DayTimelineProps {
  windowStart: MinuteOfDay
  windowEnd: MinuteOfDay
  entries: TimelineEntry[]
  unavailable: AvailabilityBlock[]
  onToggleComplete: (taskId: string) => void
}

export function DayTimeline({
  windowStart,
  windowEnd,
  entries,
  unavailable,
  onToggleComplete,
}: DayTimelineProps) {
  // Resolved on the client only, so server and client markup stay identical.
  const [now, setNow] = useState<MinuteOfDay | null>(null)

  useEffect(() => {
    const tick = () => setNow(minuteOfDay(new Date()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const layout = useMemo(
    () => layoutTimeline({ windowStart, windowEnd, entries, unavailable }),
    [windowStart, windowEnd, entries, unavailable],
  )

  const nowVisible = now !== null && now >= windowStart && now <= windowEnd

  return (
    <section
      aria-label="Today's timeline"
      className="rounded-2xl border border-glass-border bg-glass p-4 backdrop-blur-xl sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">Committed schedule</h2>
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-[3px] rounded-full bg-fixed" />
            fixed
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-[3px] rounded-full bg-flex" />
            flexible
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Hour gutter */}
        <div
          aria-hidden="true"
          className="relative w-11 shrink-0 sm:w-12"
          style={{ height: layout.trackHeight }}
        >
          {layout.hours.map((minute) => (
            <span
              key={minute}
              className="absolute right-2 -translate-y-1/2 font-mono text-[11px] tabular-nums text-muted-foreground/60"
              style={{ top: layout.yOf(minute) }}
            >
              {formatTime(minute)}
            </span>
          ))}
        </div>

        {/* Track */}
        <div
          className="relative min-w-0 flex-1 border-l border-hairline"
          style={{ height: layout.trackHeight }}
        >
          {/* Hour rules */}
          {layout.hours.map((minute) => (
            <span
              key={minute}
              aria-hidden="true"
              className="absolute inset-x-0 h-px bg-hairline"
              style={{ top: layout.yOf(minute) }}
            />
          ))}

          {/* Unavailable stretches */}
          {layout.unavailable.map(({ block, top, height }) => (
            <div
              key={block.id}
              className="absolute inset-x-0 flex items-start justify-end overflow-hidden rounded-lg pr-2 pt-1.5"
              style={{
                top,
                height,
                backgroundImage:
                  'repeating-linear-gradient(135deg, oklch(1 0 0 / 3.5%) 0 6px, transparent 6px 12px)',
              }}
            >
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/70">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {block.reason ?? 'Unavailable'}
              </span>
            </div>
          ))}

          {/* Free gaps */}
          {layout.gaps.map((gap) => (
            <div
              key={gap.key}
              className="absolute inset-x-0 flex items-center justify-center"
              style={{ top: gap.top, height: gap.height }}
            >
              <span className="font-mono text-[11px] text-muted-foreground/40">
                {formatDuration(gap.minutes)} open
              </span>
            </div>
          ))}

          {/* Committed blocks */}
          {layout.blocks.map(({ key, entry, top, height }) => (
            <div
              key={key}
              className="absolute inset-x-0 pl-3 pr-1"
              style={{ top, height }}
            >
              <TimelineBlock entry={entry} onToggleComplete={onToggleComplete} />
            </div>
          ))}

          {/* Now marker */}
          {nowVisible ? (
            <div
              className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
              style={{ top: layout.yOf(now) }}
              aria-hidden="true"
            >
              <span className="-ml-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
              <span className="h-px flex-1 bg-foreground/40" />
              <span className="ml-1 rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-background">
                {formatTime(now)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
