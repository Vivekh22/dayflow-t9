'use client'

import { ChevronRight, TriangleAlert } from 'lucide-react'
import { dayOffsetLabel, formatDuration, formatTime } from '@/lib/time'
import type { FlexibleTask } from '@/lib/types'

const PRIORITY_RANK: Record<FlexibleTask['priority'], number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

function urgency(task: FlexibleTask) {
  const deadlineWeight = task.deadline
    ? task.deadline.dueDayOffset * 1440 + task.deadline.dueAt
    : Number.MAX_SAFE_INTEGER
  return [PRIORITY_RANK[task.priority], deadlineWeight] as const
}

export function UnscheduledPanel({
  tasks,
  openMinutes,
}: {
  tasks: FlexibleTask[]
  openMinutes: number
}) {
  const sorted = [...tasks].sort((a, b) => {
    const [ap, ad] = urgency(a)
    const [bp, bd] = urgency(b)
    return ap - bp || ad - bd
  })

  const required = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
  const overflow = required - openMinutes

  return (
    <section
      aria-label="Unscheduled backlog"
      className="rounded-2xl border border-glass-border bg-glass p-4 backdrop-blur-xl"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">Backlog</h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Everything you have on has a slot. Nothing is waiting.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {overflow > 0 ? (
              <>
                These need {formatDuration(required)} but only{' '}
                {formatDuration(openMinutes)} is open — about{' '}
                {formatDuration(overflow)} has to move to another day.
              </>
            ) : (
              <>
                These fit in today&apos;s remaining {formatDuration(openMinutes)}.
                Re-plan to place them.
              </>
            )}
          </p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {sorted.map((task) => {
              const urgent =
                task.deadline?.strict === true && task.deadline.dueDayOffset <= 0
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-glass-border hover:bg-glass-hover"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        urgent ? 'bg-fixed' : 'bg-muted-foreground/40'
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm leading-snug">
                        {task.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span>{formatDuration(task.estimatedMinutes)}</span>
                        {task.deadline ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`flex items-center gap-1 ${
                                urgent ? 'text-fixed' : ''
                              }`}
                            >
                              {urgent ? (
                                <TriangleAlert
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                              ) : null}
                              {dayOffsetLabel(task.deadline.dueDayOffset)}{' '}
                              {formatTime(task.deadline.dueAt)}
                            </span>
                          </>
                        ) : null}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
