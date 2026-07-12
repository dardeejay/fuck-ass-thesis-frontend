import { getServerAuthSession } from "@/auth"
import { getModelVersions } from "@/lib/handa-api"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const versions = await getModelVersions()
  return NextResponse.json(versions)
}
