import { getServerAuthSession } from "@/auth"
import { promoteModelVersion } from "@/lib/handa-api"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const versionId = Number(id)
  if (!Number.isInteger(versionId)) {
    return NextResponse.json({ error: "Invalid version id" }, { status: 400 })
  }

  try {
    const version = await promoteModelVersion(versionId, session.user.email ?? undefined)
    return NextResponse.json(version)
  } catch (error) {
    return NextResponse.json({ error: `Promotion failed: ${error}` }, { status: 502 })
  }
}
