import LabelModal from "@/components/dashboard/label-modal"
import { getLivePrediction } from "@/lib/handa-api"

export const dynamic = "force-dynamic"

export default async function LabelModalPage() {
  const live = await getLivePrediction()
  return <LabelModal live={live} />
}
