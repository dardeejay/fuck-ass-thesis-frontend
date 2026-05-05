import { getServerAuthSession } from "@/auth"
import SimulationClient from "@/components/dashboard/simulation-client"
import { redirect } from "next/navigation"

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

  return <SimulationClient />
}
