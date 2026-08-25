'use client'

import { Circle, CircleCheck, CircleDot, MapPin, TriangleAlert } from 'lucide-react'
import { formatDuration, formatRange, formatTime } from '@/lib/time'
import type { TimelineEntry } from '@/lib/types'

const REASON_COPY: Record<string, string> = {
  DEADLINE_RISK: 'pulled early — deadline risk',
  BEFORE_DEPENDENT_EVENT: 'placed before the Northwind call',
  MOVED_FROM_MORNING: 'moved out of the morning',
  FIXED_EVENT_OVERLAP: 'shifted around a fixed event',
}

/** Above this height a block has room for the engine's reasoning line. */
const ROOMY_HEIGHT = 84

export function TimelineBlock({
  entry,
  onToggleComplete,
}: {
  entry: TimelineEntry
  onToggleComplete: (taskId: string) => void
}) {
  if (entry.kind === 'event') {
    const { event } = entry
    return (
      <article className="group flex h-full overflow-hidden rounded-xl border border-fixed/25 bg-fixed/8 backdrop-blur-sm transition-colors hover:bg-fixed/12">
        <span aria-hidden="true" className="w-[3px] shrink-0 bg-fixed" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 overflow-hidden px-3 py-2">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-sm font-medium leading-snug">
              {event.title}
            </h3>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-fixed/80">
              fixed
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] leading-none text-muted-foreground">
            <span className="shrink-0">{formatRange(entry.start, entry.end)}</span>
            {event.location ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{event.location}</span>
                </span>
              </>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  const { task } = entry
  const done = task.status === 'COMPLETED'
  const active = task.status === 'IN_PROGRESS'
  const roomy = (entry.end - entry.start) * 1.35 >= ROOMY_HEIGHT
  const atRisk =
    !done &&
    task.deadline?.strict === true &&
    task.deadline.dueDayOffset === 0 &&
    task.deadline.dueAt - entry.end < 90

  return (
    <article
      className={`group flex h-full overflow-hidden rounded-xl border backdrop-blur-sm transition-colors ${
        done
          ? 'border-glass-border bg-glass'
          : active
            ? 'border-flex/45 bg-flex/14 ring-1 ring-flex/25'
            : 'border-flex/22 bg-flex/8 hover:bg-flex/12'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-[3px] shrink-0 ${done ? 'bg-muted-foreground/30' : 'bg-flex'}`}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden px-3 py-2">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-pressed={done}
          aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
          className={`shrink-0 rounded-full transition-colors ${
            done
              ? 'text-muted-foreground hover:text-foreground'
              : 'text-flex/60 hover:text-flex'
          }`}
        >
          {done ? (
            <CircleCheck className="h-4 w-4" aria-hidden="true" />
          ) : active ? (
            <CircleDot className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Circle className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
          <div className="flex items-baseline gap-2">
            <h3
              className={`truncate text-sm font-medium leading-snug ${
                done ? 'text-muted-foreground line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            {active ? (
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-flex">
                now
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 overflow-hidden font-mono text-[11px] leading-none text-muted-foreground">
            <span className="shrink-0">{formatRange(entry.start, entry.end)}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">
              {formatDuration(task.estimatedMinutes)}
            </span>
            {atRisk ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex shrink-0 items-center gap-1 text-fixed">
                  <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                  due {formatTime(task.deadline!.dueAt)}
                </span>
              </>
            ) : null}
          </div>

          {roomy && task.scheduleReason && !done ? (
            <p className="truncate text-[11px] leading-none text-muted-foreground/70">
              {REASON_COPY[task.scheduleReason] ?? task.scheduleReason}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
