import { z } from "zod"

export const weatherSimulationInputSchema = z.object({
  temperature: z.coerce.number().min(15).max(45),
  // Rain-rate in mm/hr, not a daily accumulation — see getRainfallImpact()
  // for PAGASA's hourly rainfall-warning bands. 305mm/hr is the highest
  // 1-hour rate ever recorded, used as a generous upper bound.
  rainfall: z.coerce.number().min(0).max(305),
  windSpeed: z.coerce.number().min(0).max(250),
  humidity: z.coerce.number().min(0).max(100),
  floodRisk: z.enum(["low", "moderate", "high"]),
  visibility: z.enum(["good", "reduced", "poor"]),
  stormSignal: z.enum(["none", "signal-1", "signal-2", "signal-3"]),
  tideLevel: z.enum(["low", "normal", "high", "storm-surge"]).default("normal"),
  notes: z.string().max(500).optional().default(""),
})

export type WeatherSimulationInput = z.infer<
  typeof weatherSimulationInputSchema
>

type ImpactLevel = "normal" | "warning" | "critical"
type RecommendationLevel = "low" | "medium" | "high"
type RecommendationAction = "NO SUSPEND" | "PARTIAL SUSPEND" | "SUSPEND"

export type WeatherSimulationResult = {
  score: number
  level: RecommendationLevel
  confidence: number
  recommendation: RecommendationAction
  summary: string
  affectedLevels: string[]
  factors: Array<{
    name: string
    value: string
    impact: ImpactLevel
  }>
}

const impactOrder: Record<ImpactLevel, number> = {
  normal: 0,
  warning: 1,
  critical: 2,
}

// Bands mirror PAGASA's hourly Rainfall Warning System (Yellow >=7.5mm/hr,
// Orange >=15mm/hr, Red >=30mm/hr), not the daily-accumulation thresholds
// used elsewhere for the trained suspension model.
function getRainfallImpact(rainfall: number) {
  if (rainfall >= 30) {
    return { score: 38, impact: "critical" as const, value: "Red (Torrential)" }
  }

  if (rainfall >= 15) {
    return { score: 28, impact: "critical" as const, value: "Orange (Intense)" }
  }

  if (rainfall >= 7.5) {
    return { score: 16, impact: "warning" as const, value: "Yellow (Moderate)" }
  }

  return { score: 4, impact: "normal" as const, value: "Light" }
}

function getTideImpact(tideLevel: WeatherSimulationInput["tideLevel"]) {
  switch (tideLevel) {
    case "storm-surge":
      return { score: 16, impact: "critical" as const, value: "Storm Surge Risk" }
    case "high":
      return { score: 9, impact: "warning" as const, value: "High Tide" }
    case "low":
      return { score: 0, impact: "normal" as const, value: "Low Tide" }
    default:
      return { score: 2, impact: "normal" as const, value: "Normal Tide" }
  }
}

function getWindImpact(windSpeed: number) {
  if (windSpeed >= 70) {
    return { score: 26, impact: "critical" as const, value: "Very Strong" }
  }

  if (windSpeed >= 45) {
    return { score: 18, impact: "warning" as const, value: "Strong" }
  }

  if (windSpeed >= 25) {
    return { score: 10, impact: "warning" as const, value: "Elevated" }
  }

  return { score: 3, impact: "normal" as const, value: "Calm" }
}

function getHumidityImpact(humidity: number) {
  if (humidity >= 90) {
    return { score: 12, impact: "warning" as const, value: "Very High" }
  }

  if (humidity >= 75) {
    return { score: 7, impact: "warning" as const, value: "High" }
  }

  return { score: 2, impact: "normal" as const, value: "Stable" }
}

function getFloodRiskImpact(floodRisk: WeatherSimulationInput["floodRisk"]) {
  switch (floodRisk) {
    case "high":
      return { score: 22, impact: "critical" as const, value: "High" }
    case "moderate":
      return { score: 12, impact: "warning" as const, value: "Moderate" }
    default:
      return { score: 3, impact: "normal" as const, value: "Low" }
  }
}

function getVisibilityImpact(visibility: WeatherSimulationInput["visibility"]) {
  switch (visibility) {
    case "poor":
      return { score: 14, impact: "critical" as const, value: "Poor" }
    case "reduced":
      return { score: 8, impact: "warning" as const, value: "Reduced" }
    default:
      return { score: 2, impact: "normal" as const, value: "Good" }
  }
}

function getStormSignalImpact(
  stormSignal: WeatherSimulationInput["stormSignal"]
) {
  switch (stormSignal) {
    case "signal-3":
      return { score: 28, impact: "critical" as const, value: "Signal #3" }
    case "signal-2":
      return { score: 18, impact: "critical" as const, value: "Signal #2" }
    case "signal-1":
      return { score: 10, impact: "warning" as const, value: "Signal #1" }
    default:
      return { score: 0, impact: "normal" as const, value: "No signal" }
  }
}

function buildAffectedLevels(level: RecommendationLevel, score: number) {
  if (level === "high") {
    return ["Pre-school", "Elementary", "High School"]
  }

  if (level === "medium") {
    return score >= 55
      ? ["Pre-school", "Elementary", "High School"]
      : ["Pre-school", "Elementary"]
  }

  return ["None"]
}

export function simulateWeatherRecommendation(
  input: WeatherSimulationInput
): WeatherSimulationResult {
  const rainfall = getRainfallImpact(input.rainfall)
  const wind = getWindImpact(input.windSpeed)
  const humidity = getHumidityImpact(input.humidity)
  const floodRisk = getFloodRiskImpact(input.floodRisk)
  const visibility = getVisibilityImpact(input.visibility)
  const stormSignal = getStormSignalImpact(input.stormSignal)
  const tide = getTideImpact(input.tideLevel)

  const heatPenalty = input.temperature >= 34 ? 4 : 0
  const combinedRiskBoost =
    input.rainfall >= 15 && input.windSpeed >= 45 ? 10 : 0
  // Heavy rain draining into a high tide or storm surge can't run off to
  // sea, so coastal flooding compounds faster than either factor alone.
  const coastalFloodBoost =
    input.rainfall >= 7.5 &&
    (input.tideLevel === "high" || input.tideLevel === "storm-surge")
      ? 12
      : 0

  const score = Math.min(
    100,
    rainfall.score +
      wind.score +
      humidity.score +
      floodRisk.score +
      visibility.score +
      stormSignal.score +
      tide.score +
      heatPenalty +
      combinedRiskBoost +
      coastalFloodBoost
  )

  const level: RecommendationLevel =
    score >= 70 ? "high" : score >= 40 ? "medium" : "low"

  const recommendation: RecommendationAction =
    level === "high"
      ? "SUSPEND"
      : level === "medium"
        ? "PARTIAL SUSPEND"
        : "NO SUSPEND"

  const confidence = Math.min(
    98,
    Math.max(62, Math.round(65 + score * 0.28 + combinedRiskBoost * 0.3))
  )

  const factors = [
    {
      name: "Rainfall Intensity",
      value: `${input.rainfall} mm/hr (${rainfall.value})`,
      impact: rainfall.impact,
    },
    {
      name: "Tide Level",
      value: tide.value,
      impact: tide.impact,
    },
    {
      name: "Wind Speed",
      value: `${input.windSpeed} km/h (${wind.value})`,
      impact: wind.impact,
    },
    {
      name: "Flood Risk",
      value: floodRisk.value,
      impact: floodRisk.impact,
    },
    {
      name: "Visibility",
      value: visibility.value,
      impact: visibility.impact,
    },
    {
      name: "Humidity",
      value: `${input.humidity}% (${humidity.value})`,
      impact: humidity.impact,
    },
    {
      name: "Storm Signal",
      value: stormSignal.value,
      impact: stormSignal.impact,
    },
  ].sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])

  const reasons = [
    rainfall.impact !== "normal" ? `rainfall is at ${input.rainfall} mm/hr` : null,
    wind.impact !== "normal" ? `wind speed is ${input.windSpeed} km/h` : null,
    floodRisk.impact !== "normal" ? `flood risk is ${input.floodRisk}` : null,
    visibility.impact !== "normal" ? `visibility is ${input.visibility}` : null,
    input.stormSignal !== "none"
      ? `storm advisory is ${stormSignal.value.toLowerCase()}`
      : null,
    coastalFloodBoost > 0
      ? `${tide.value.toLowerCase()} is compounding coastal flood risk`
      : tide.impact !== "normal"
        ? `tide level is ${tide.value.toLowerCase()}`
        : null,
  ].filter(Boolean)

  const summary =
    recommendation === "NO SUSPEND"
      ? "Conditions remain within manageable limits. Continued monitoring is recommended, but the simulated model does not advise suspension."
      : recommendation === "PARTIAL SUSPEND"
        ? `The simulated model suggests a partial suspension because ${reasons.slice(0, 3).join(", ")}. Lower school levels are most exposed under these conditions.`
        : `The simulated model recommends suspension because ${reasons.slice(0, 4).join(", ")}. Combined weather signals indicate elevated risk for travel and on-site safety.`

  return {
    score,
    level,
    confidence,
    recommendation,
    summary,
    affectedLevels: buildAffectedLevels(level, score),
    factors,
  }
}
