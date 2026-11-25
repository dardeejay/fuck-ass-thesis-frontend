import { getServerAuthSession } from "@/auth"
import { ReplayDayCard } from "@/components/dashboard/replay-day-card"
import SimulationClient from "@/components/dashboard/simulation-client"
import { getReplayDays } from "@/lib/handa-api"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SimulationPage() {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Restricted Access
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only administrators can run weather scenario simulations.
        </p>
      </div>
    )
  }

  // The manual simulator works offline (it falls back to a local estimate),
  // so a backend outage only hides the replay card rather than the page.
  const replayDays = await getReplayDays().catch(() => null)

  return (
    <div className="space-y-6">
      {replayDays && replayDays.length > 0 && <ReplayDayCard days={replayDays} />}
      <SimulationClient />
    </div>
  )
}
