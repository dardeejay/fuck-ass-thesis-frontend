import { getServerAuthSession } from "@/auth"
import {
  simulateWeatherRecommendation,
  weatherSimulationInputSchema,
} from "@/lib/weather-simulation"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const json = await request.json()
  const parsed = weatherSimulationInputSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid weather inputs",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  const result = simulateWeatherRecommendation(parsed.data)

  return NextResponse.json({
    input: parsed.data,
    result,
    simulatedAt: new Date().toISOString(),
  })
}
