import type { ForecastStep, PredictionRequest, PredictionResponse } from "@/lib/handa-api"
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
    // The form collects an hourly rain-rate (mm/hr), but the trained model
    // was fit on daily accumulation (see backend analysis.py RAIN_THRESHOLDS,
    // mm/24h) — naively projecting the hourly rate across a day so the value
    // lands on the same scale the model was validated on. Tide level isn't a
    // trained feature, so it can't be passed through to this real model; it
    // only affects the local fallback in weather-simulation.ts.
    rainfall: input.rainfall * 24,
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

export type ForecastOutlook = {
  peak: ForecastStep
  windowHours: number
  level: "low" | "medium" | "high"
  recommendation: "SUSPEND" | "PARTIAL SUSPEND" | "NO SUSPEND"
  confidence: number
}

const FORECAST_STEP_HOURS = 3

// Pools the per-step forecast into one headline suggestion for the window.
// Uses worst-case (peak probability), not the average — mirrors how
// TCWS/PAGASA warnings are read: plan for the peak risk in the window, not
// its mean, since a single severe step justifies suspension regardless of
// calmer steps around it.
export function poolForecastOutlook(steps: ForecastStep[], windowHours = 24): ForecastOutlook | null {
  const stepCount = Math.max(1, Math.round(windowHours / FORECAST_STEP_HOURS))
  const window = steps.slice(0, stepCount)
  if (window.length === 0) return null

  const peak = window.reduce((worst, step) => (step.probability > worst.probability ? step : worst))

  const level = peak.riskLevel === "moderate" ? "medium" : peak.riskLevel
  const recommendation =
    peak.riskLevel === "high" ? "SUSPEND" : peak.riskLevel === "moderate" ? "PARTIAL SUSPEND" : "NO SUSPEND"
  const confidence = Math.round(50 + Math.abs(peak.probability - 0.5) * 100)

  return { peak, windowHours: window.length * FORECAST_STEP_HOURS, level, recommendation, confidence }
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
