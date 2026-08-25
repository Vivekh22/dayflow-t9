'use client'

import { useMemo, useState } from 'react'
import { DayHeader } from './day-header'
import { DayLoad } from './day-load'
import { DayTimeline } from './day-timeline'
import { UnscheduledPanel } from './unscheduled-panel'
import { computeDayMetrics } from '@/lib/day-metrics'
import type { DaySnapshot, FlexibleTask } from '@/lib/types'

export function TodayView({ day }: { day: DaySnapshot }) {
  const [tasks, setTasks] = useState<FlexibleTask[]>(day.tasks)

  const toggleComplete = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
            }
          : task,
      ),
    )
  }

  const metrics = useMemo(
    () =>
      computeDayMetrics({
        windowStart: day.windowStart,
        windowEnd: day.windowEnd,
        events: day.events,
        tasks,
        unavailable: day.unavailable,
      }),
    [tasks, day],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
      <DayHeader
        dayLabel={day.dayLabel}
        scheduledCount={metrics.entries.length}
        backlogCount={metrics.backlog.length}
        pendingProposal={day.pendingProposal}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <DayTimeline
          windowStart={day.windowStart}
          windowEnd={day.windowEnd}
          entries={metrics.entries}
          unavailable={day.unavailable}
          onToggleComplete={toggleComplete}
        />

        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
          <UnscheduledPanel
            tasks={metrics.backlog}
            openMinutes={metrics.openMinutes}
          />
          <DayLoad
            fixedMinutes={metrics.fixedMinutes}
            flexibleMinutes={metrics.flexibleMinutes}
            doneMinutes={metrics.doneMinutes}
            blockedMinutes={metrics.blockedMinutes}
            openMinutes={metrics.openMinutes}
          />
        </div>
      </div>
    </div>
  )
}
