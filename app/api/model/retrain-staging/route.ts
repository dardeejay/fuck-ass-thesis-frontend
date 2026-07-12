import { getServerAuthSession } from "@/auth"
import { triggerStagingRetrain } from "@/lib/handa-api"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const version = await triggerStagingRetrain()
    return NextResponse.json(version)
  } catch (error) {
    return NextResponse.json({ error: `Retrain failed: ${error}` }, { status: 502 })
  }
}
