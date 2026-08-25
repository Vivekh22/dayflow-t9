import { AppSidebar } from '@/components/app-sidebar'
import { MobileTabBar } from '@/components/mobile-tab-bar'
import { TodayView } from '@/components/today/today-view'
import { mockDay } from '@/lib/mock-data'

export default function TodayPage() {
  // Swap `mockDay` for the repository reads (fixedEvent / flexibleTask /
  // proposal) once auth and the database are wired up.
  const day = mockDay
  const pendingChanges = day.pendingProposal?.changeCount

  return (
    <div className="flex min-h-screen">
      <AppSidebar pendingChanges={pendingChanges} />
      <main className="relative z-10 min-w-0 flex-1 pb-20 sm:pb-0">
        <TodayView day={day} />
      </main>
      <MobileTabBar pendingChanges={pendingChanges} />
    </div>
  )
}
