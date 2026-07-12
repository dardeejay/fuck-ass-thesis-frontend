import HistoricalClient from "@/components/dashboard/historical-client"
import { getSuspensionHistory } from "@/lib/handa-api"

export const dynamic = "force-dynamic"

export default async function HistoricalDataPage() {
  const records = await getSuspensionHistory()
  return <HistoricalClient records={records} />
}
