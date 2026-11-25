import { getServerAuthSession } from "@/auth"
import { replayDay } from "@/lib/handa-api"
import { NextResponse } from "next/server"

export async function GET(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { date } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 })
  }

  try {
    return NextResponse.json(await replayDay(date))
  } catch (error) {
    return NextResponse.json({ error: `Replay failed: ${error}` }, { status: 502 })
  }
}
