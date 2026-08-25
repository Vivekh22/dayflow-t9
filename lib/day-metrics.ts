import type {
  AvailabilityBlock,
  FixedEvent,
  FlexibleTask,
  MinuteOfDay,
  TimelineEntry,
} from './types'

const INACTIVE: FlexibleTask['status'][] = ['CANCELLED', 'SKIPPED']

export interface DayMetrics {
  entries: TimelineEntry[]
  backlog: FlexibleTask[]
  fixedMinutes: number
  flexibleMinutes: number
  doneMinutes: number
  blockedMinutes: number
  openMinutes: number
}

/** Total minutes covered by a set of ranges, counting overlaps only once. */
function unionMinutes(ranges: { start: number; end: number }[]): number {
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  let total = 0
  let cursor = -Infinity
  for (const range of sorted) {
    const start = Math.max(range.start, cursor)
    if (range.end > start) {
      total += range.end - start
      cursor = range.end
    }
  }
  return total
}

export function computeDayMetrics({
  windowStart,
  windowEnd,
  events,
  tasks,
  unavailable,
}: {
  windowStart: MinuteOfDay
  windowEnd: MinuteOfDay
  events: FixedEvent[]
  tasks: FlexibleTask[]
  unavailable: AvailabilityBlock[]
}): DayMetrics {
  const live = tasks.filter((t) => !INACTIVE.includes(t.status))

  const entries: TimelineEntry[] = [
    ...events.map(
      (event): TimelineEntry => ({
        kind: 'event',
        start: event.startAt,
        end: event.endAt,
        event,
      }),
    ),
    ...live
      .filter((t) => t.scheduledStartAt !== null && t.scheduledEndAt !== null)
      .map(
        (task): TimelineEntry => ({
          kind: 'task',
          start: task.scheduledStartAt as number,
          end: task.scheduledEndAt as number,
          task,
        }),
      ),
  ].sort((a, b) => a.start - b.start || a.end - b.end)

  const backlog = live.filter((t) => t.scheduledStartAt === null)

  const clamp = (r: { start: number; end: number }) => ({
    start: Math.max(r.start, windowStart),
    end: Math.min(r.end, windowEnd),
  })

  const fixedMinutes = unionMinutes(
    events.map((e) => clamp({ start: e.startAt, end: e.endAt })),
  )

  const taskRanges = entries.filter((e) => e.kind === 'task')
  const doneMinutes = unionMinutes(
    taskRanges
      .filter((e) => e.kind === 'task' && e.task.status === 'COMPLETED')
      .map(clamp),
  )
  // Flexible excludes anything already counted as fixed or done, so the
  // segments of the load bar always sum to the length of the day.
  const flexibleMinutes = Math.max(
    0,
    unionMinutes(entries.map(clamp)) - fixedMinutes - doneMinutes,
  )

  // Unavailable time that isn't already committed. Intersecting first and
  // unioning once avoids double-subtracting a stretch covered by two blocks.
  const blockedOverlap = entries.flatMap((entry) =>
    unavailable
      .map((b) => ({
        start: Math.max(entry.start, b.startAt),
        end: Math.min(entry.end, b.endAt ?? windowEnd),
      }))
      .filter((r) => r.end > r.start)
      .map(clamp),
  )
  const blockedMinutes = Math.max(
    0,
    unionMinutes(
      unavailable.map((b) =>
        clamp({ start: b.startAt, end: b.endAt ?? windowEnd }),
      ),
    ) - unionMinutes(blockedOverlap),
  )

  const openMinutes = Math.max(
    0,
    windowEnd -
      windowStart -
      fixedMinutes -
      flexibleMinutes -
      doneMinutes -
      blockedMinutes,
  )

  return {
    entries,
    backlog,
    fixedMinutes,
    flexibleMinutes,
    doneMinutes,
    blockedMinutes,
    openMinutes,
  }
}
