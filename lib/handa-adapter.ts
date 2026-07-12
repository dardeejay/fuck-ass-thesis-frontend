import type { PredictionRequest, PredictionResponse } from "@/lib/handa-api"
import type {
  WeatherSimulationInput,
  WeatherSimulationResult,
} from "@/lib/weather-simulation"

export type ImpactLevel = "normal" | "warning" | "critical"

// The manual simulator form only collects one "temperature" field, but the
// model was trained on separate daily TMAX/TMIN — using the same value for
// both is a simplification, not a real daily range.
export function simulationInputToPredictionRequest(
  input: WeatherSimulationInput
): PredictionRequest {
  return {
    rainfall: input.rainfall,
    tmax: input.temperature,
    tmin: input.temperature,
    rh: input.humidity,
    windSpeed: input.windSpeed / 3.6, // km/h -> m/s, matches the training data's unit
    month: new Date().getMonth() + 1,
  }
}

export const FEATURE_LABELS: Record<string, string> = {
  RAINFALL: "Rainfall Intensity",
  RAIN_3DAY_SUM: "3-Day Rainfall Trend",
  RAIN_7DAY_SUM: "7-Day Rainfall Trend",
  TMAX: "Max Temperature",
  TMIN: "Min Temperature",
  RH: "Humidity",
  WIND_SPEED: "Wind Speed",
  MONTH: "Month (Seasonality)",
}

// Rainfall bands mirror PAGASA's own warning thresholds (see this project's
// backend analysis.py RAIN_THRESHOLDS) rather than arbitrary cutoffs.
function rainfallImpact(mm: number): { value: string; impact: ImpactLevel } {
  if (mm >= 65) return { value: `${mm}mm (Intense)`, impact: "critical" }
  if (mm >= 30) return { value: `${mm}mm (Heavy)`, impact: "warning" }
  if (mm >= 7.5) return { value: `${mm}mm (Moderate)`, impact: "warning" }
  return { value: `${mm}mm (Light)`, impact: "normal" }
}

function humidityImpact(rh: number): { value: string; impact: ImpactLevel } {
  if (rh >= 90) return { value: `${rh}% (Very High)`, impact: "warning" }
  if (rh >= 75) return { value: `${rh}% (High)`, impact: "normal" }
  return { value: `${rh}% (Stable)`, impact: "normal" }
}

function windImpact(ms: number): { value: string; impact: ImpactLevel } {
  const kmh = Math.round(ms * 3.6)
  if (kmh >= 60) return { value: `${kmh} km/h (Strong)`, impact: "critical" }
  if (kmh >= 30) return { value: `${kmh} km/h (Elevated)`, impact: "warning" }
  return { value: `${kmh} km/h (Calm)`, impact: "normal" }
}

function tempImpact(celsius: number): { value: string; impact: ImpactLevel } {
  return { value: `${celsius}°C`, impact: celsius >= 34 ? "warning" : "normal" }
}

export function factorForFeature(feature: string, request: PredictionRequest) {
  switch (feature) {
    case "RAINFALL":
      return rainfallImpact(request.rainfall)
    case "RAIN_3DAY_SUM":
      return rainfallImpact(request.rain3daySum ?? request.rainfall)
    case "RAIN_7DAY_SUM":
      return rainfallImpact(request.rain7daySum ?? request.rainfall)
    case "TMAX":
      return tempImpact(request.tmax)
    case "TMIN":
      return tempImpact(request.tmin)
    case "RH":
      return humidityImpact(request.rh)
    case "WIND_SPEED":
      return windImpact(request.windSpeed)
    default:
      return { value: "—", impact: "normal" as ImpactLevel }
  }
}

export const impactOrder: Record<ImpactLevel, number> = { normal: 0, warning: 1, critical: 2 }

export function affectedLevelsFor(riskLevel: "low" | "moderate" | "high"): string[] {
  // Heuristic banding for display only — the model predicts one combined
  // suspension outcome, not per-school-level decisions.
  if (riskLevel === "high") return ["Pre-school", "Elementary", "High School"]
  if (riskLevel === "moderate") return ["Pre-school", "Elementary"]
  return ["None"]
}

export function predictionResponseToSimulationResult(
  response: PredictionResponse,
  request: PredictionRequest
): WeatherSimulationResult {
  const score = Math.round(response.probability * 100)
  const level = response.riskLevel === "moderate" ? "medium" : response.riskLevel
  const recommendation =
    response.riskLevel === "high"
      ? ("SUSPEND" as const)
      : response.riskLevel === "moderate"
        ? ("PARTIAL SUSPEND" as const)
        : ("NO SUSPEND" as const)

  // Distance from the 0.5 decision boundary, not the risk score itself —
  // a probability near 0 or 1 means the model is more decisive either way.
  const confidence = Math.round(50 + Math.abs(response.probability - 0.5) * 100)

  const factors = response.featureImportance
    .slice(0, 6)
    .map(({ feature }) => ({
      name: FEATURE_LABELS[feature] ?? feature,
      ...factorForFeature(feature, request),
    }))
    .sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])

  return {
    score,
    level,
    confidence,
    recommendation,
    summary: response.recommendation,
    affectedLevels: affectedLevelsFor(response.riskLevel),
    factors,
  }
}
