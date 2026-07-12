import ModelVersionsClient from "@/components/dashboard/model-versions-client"
import { getModelVersions } from "@/lib/handa-api"

export const dynamic = "force-dynamic"

export default async function ModelPage() {
  const versions = await getModelVersions()
  return <ModelVersionsClient initialVersions={versions} />
}
