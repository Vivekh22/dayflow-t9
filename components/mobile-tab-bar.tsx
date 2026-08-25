import Link from 'next/link'
import { CalendarRange, ListTodo, Sparkles, SunMedium } from 'lucide-react'

const tabs = [
  { href: '/today', label: 'Today', icon: SunMedium, active: true },
  { href: '/schedule', label: 'Schedule', icon: CalendarRange },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/replan', label: 'Re-plan', icon: Sparkles },
]

export function MobileTabBar({ pendingChanges }: { pendingChanges?: number }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-glass-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      {tabs.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? 'page' : undefined}
          className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
            active ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          {label}
          {href === '/replan' && pendingChanges ? (
            <span
              aria-hidden="true"
              className="absolute right-[calc(50%-18px)] top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
            />
          ) : null}
        </Link>
      ))}
    </nav>
  )
}
