import LabelClient from "@/components/dashboard/label-client"
import { getLivePrediction } from "@/lib/handa-api"

export const dynamic = "force-dynamic"

export default async function LabelPage() {
  const live = await getLivePrediction()
  return <LabelClient live={live} />
}
