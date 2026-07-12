import { getServerAuthSession } from "@/auth"
import { getLabels, submitLabel } from "@/lib/handa-api"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const labels = await getLabels()
  return NextResponse.json(labels)
}

export async function POST(request: Request) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  try {
    const label = await submitLabel({ ...body, createdBy: session.user.email ?? undefined })
    return NextResponse.json(label)
  } catch (error) {
    return NextResponse.json({ error: `Failed to save label: ${error}` }, { status: 502 })
  }
}
