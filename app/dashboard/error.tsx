"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

// Every dashboard page reads from the Handa API; if it is down or slow this
// replaces Next's raw error screen with a recoverable message.
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()
  const [retrying, startTransition] = useTransition()

  // The failure happened in a server component, so re-fetch on the server
  // (refresh) before clearing the boundary — reset() alone re-renders the
  // same failed payload.
  const retry = () =>
    startTransition(() => {
      router.refresh()
      reset()
    })

  return (
    <Card className="border-2 border-warning/40 bg-warning/10">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div className="rounded-2xl bg-warning p-3 text-warning-foreground">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Prediction service unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The Handa API could not be reached or returned an error. Check that the backend is running, then
            try again.
          </p>
        </div>
        <Button onClick={retry} disabled={retrying}>
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      </CardContent>
    </Card>
  )
}
