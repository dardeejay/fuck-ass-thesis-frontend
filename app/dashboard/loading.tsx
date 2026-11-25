import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Card className="border-2">
        <CardContent className="flex flex-col gap-4 p-8 sm:p-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
            <Spinner />
            Fetching live PAGASA, weather and forecast data…
          </div>
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
