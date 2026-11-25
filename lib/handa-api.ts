import "server-only"
import { env } from "@/lib/env"

export type PredictionRequest = {
  rainfall: number
  tmax: number
  tmin: number
  rh: number
  windSpeed: number
  month: number
  rain3daySum?: number
  rain7daySum?: number
}

export type FeatureImportance = {
  feature: string
  importance: number
}

export type HeatIndex = {
  heatIndexCelsius: number
  category: "Not Hazardous" | "Caution" | "Extreme Caution" | "Danger" | "Extreme Danger"
  note: string | null
}

export type PredictionResponse = {
  probability: number
  riskLevel: "low" | "moderate" | "high"
  recommendation: string
  modelName: string
  featureImportance: FeatureImportance[]
  heatIndex: HeatIndex
}

export type PagasaWarning = {
  level: "RED" | "ORANGE" | "YELLOW" | null
  rainfallMmEstimate: number
  matchedAreasText: string | null
  bulletinTitle: string | null
  issuedAt: string | null
}

export type TcwsStatus = {
  signal: number | null
  matchedAreasText: string | null
  automaticSuspensionNote: string | null
}

export type LivePredictionResponse = PredictionResponse & {
  pagasaWarning: PagasaWarning
  tcws: TcwsStatus
  conditionsUsed: PredictionRequest
  sources: { rainfallSource: string; weatherSource: string; rainHistorySource: string }
}

export type ForecastStep = {
  timestamp: string
  tmax: number
  tmin: number
  rh: number
  windSpeed: number
  rainfall: number // this step's own 3-hour amount
  rain24h: number // trailing totals the model actually scored
  rain3daySum: number
  weatherId: number
  weatherMain: string
  probability: number
  riskLevel: "low" | "moderate" | "high"
  recommendation: string
}

export type Forecast = {
  modelName: string
  generatedAt: string
  source: string
  steps: ForecastStep[]
}

export type SuspensionRecord = {
  date: string
  rainfallLevel: string | null
  forecastRisk: string | null
  timeRisk: string | null
  suspended: boolean
  preSchool: boolean | null
  elementary: boolean | null
  highSchool: boolean | null
  college: boolean | null
}

async function handaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.HANDA_API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    // Live weather changes fast; never let Next.js cache these across requests.
    cache: "no-store",
    // The backend bounds its own upstream calls (~4s, fetched concurrently);
    // this only stops a hung backend from leaving the page loading forever.
    signal: init?.signal ?? AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`Handa API ${path} failed: ${response.status} ${body}`)
  }

  return response.json()
}

function mapHeatIndex(h: {
  heat_index_celsius: number
  category: HeatIndex["category"]
  note: string | null
}): HeatIndex {
  return { heatIndexCelsius: h.heat_index_celsius, category: h.category, note: h.note }
}

export async function predictSuspension(input: PredictionRequest): Promise<PredictionResponse> {
  const data = await handaFetch<{
    probability: number
    risk_level: "low" | "moderate" | "high"
    recommendation: string
    model_name: string
    feature_importance: FeatureImportance[]
    heat_index: Parameters<typeof mapHeatIndex>[0]
  }>("/v1/predictions", {
    method: "POST",
    body: JSON.stringify({
      rainfall: input.rainfall,
      tmax: input.tmax,
      tmin: input.tmin,
      rh: input.rh,
      wind_speed: input.windSpeed,
      month: input.month,
      rain_3day_sum: input.rain3daySum,
      rain_7day_sum: input.rain7daySum,
    }),
  })

  return {
    probability: data.probability,
    riskLevel: data.risk_level,
    recommendation: data.recommendation,
    modelName: data.model_name,
    featureImportance: data.feature_importance,
    heatIndex: mapHeatIndex(data.heat_index),
  }
}

export async function getLivePrediction(): Promise<LivePredictionResponse> {
  const data = await handaFetch<{
    probability: number
    risk_level: "low" | "moderate" | "high"
    recommendation: string
    model_name: string
    feature_importance: FeatureImportance[]
    heat_index: Parameters<typeof mapHeatIndex>[0]
    pagasa_warning: {
      level: "RED" | "ORANGE" | "YELLOW" | null
      rainfall_mm_estimate: number
      matched_areas_text: string | null
      bulletin_title: string | null
      issued_at: string | null
    }
    tcws: {
      signal: number | null
      matched_areas_text: string | null
      automatic_suspension_note: string | null
    }
    conditions_used: {
      rainfall: number
      tmax: number
      tmin: number
      rh: number
      wind_speed: number
      month: number
      rain_3day_sum: number | null
      rain_7day_sum: number | null
    }
    sources: { rainfall_source: string; weather_source: string; rain_history_source: string }
  }>("/v1/predictions/live")

  return {
    probability: data.probability,
    riskLevel: data.risk_level,
    recommendation: data.recommendation,
    modelName: data.model_name,
    featureImportance: data.feature_importance,
    heatIndex: mapHeatIndex(data.heat_index),
    pagasaWarning: {
      level: data.pagasa_warning.level,
      rainfallMmEstimate: data.pagasa_warning.rainfall_mm_estimate,
      matchedAreasText: data.pagasa_warning.matched_areas_text,
      bulletinTitle: data.pagasa_warning.bulletin_title,
      issuedAt: data.pagasa_warning.issued_at,
    },
    tcws: {
      signal: data.tcws.signal,
      matchedAreasText: data.tcws.matched_areas_text,
      automaticSuspensionNote: data.tcws.automatic_suspension_note,
    },
    conditionsUsed: {
      rainfall: data.conditions_used.rainfall,
      tmax: data.conditions_used.tmax,
      tmin: data.conditions_used.tmin,
      rh: data.conditions_used.rh,
      windSpeed: data.conditions_used.wind_speed,
      month: data.conditions_used.month,
      rain3daySum: data.conditions_used.rain_3day_sum ?? undefined,
      rain7daySum: data.conditions_used.rain_7day_sum ?? undefined,
    },
    sources: {
      rainfallSource: data.sources.rainfall_source,
      weatherSource: data.sources.weather_source,
      rainHistorySource: data.sources.rain_history_source,
    },
  }
}

export async function getForecast(): Promise<Forecast> {
  const data = await handaFetch<{
    model_name: string
    generated_at: string
    source: string
    steps: Array<{
      timestamp: string
      tmax: number
      tmin: number
      rh: number
      wind_speed: number
      rainfall: number
      rain_24h: number
      rain_3day_sum: number
      weather_id: number
      weather_main: string
      probability: number
      risk_level: "low" | "moderate" | "high"
      recommendation: string
    }>
  }>("/v1/predictions/forecast")

  return {
    modelName: data.model_name,
    generatedAt: data.generated_at,
    source: data.source,
    steps: data.steps.map((s) => ({
      timestamp: s.timestamp,
      tmax: s.tmax,
      tmin: s.tmin,
      rh: s.rh,
      windSpeed: s.wind_speed,
      rainfall: s.rainfall,
      rain24h: s.rain_24h,
      rain3daySum: s.rain_3day_sum,
      weatherId: s.weather_id,
      weatherMain: s.weather_main,
      probability: s.probability,
      riskLevel: s.risk_level,
      recommendation: s.recommendation,
    })),
  }
}

export async function getSuspensionHistory(): Promise<SuspensionRecord[]> {
  const data = await handaFetch<
    Array<{
      date: string
      rainfall_level: string | null
      forecast_risk: string | null
      time_risk: string | null
      suspended: boolean
      pre_school: boolean | null
      elementary: boolean | null
      high_school: boolean | null
      college: boolean | null
    }>
  >("/v1/history/suspensions")

  return data.map((r) => ({
    date: r.date,
    rainfallLevel: r.rainfall_level,
    forecastRisk: r.forecast_risk,
    timeRisk: r.time_risk,
    suspended: r.suspended,
    preSchool: r.pre_school,
    elementary: r.elementary,
    highSchool: r.high_school,
    college: r.college,
  }))
}

export type LabelInput = {
  date: string
  preSchool: boolean
  elementary: boolean
  highSchool: boolean
  college: boolean
  rainfall: number
  tmax: number
  tmin: number
  rh: number
  windSpeed: number
  pagasaLevel?: string | null
  tcwsSignal?: number | null
  notes?: string
  createdBy?: string
}

export type Label = LabelInput & {
  id: number
  suspended: boolean
  includedInLiveModel: boolean
  createdAt: string
  heatIndexCelsius?: number | null
  heatCategory?: string | null
}

export async function submitLabel(input: LabelInput): Promise<Label> {
  const data = await handaFetch<{
    id: number
    date: string
    pre_school: boolean
    elementary: boolean
    high_school: boolean
    college: boolean
    suspended: boolean
    included_in_live_model: boolean
    created_by: string | null
    created_at: string
    weather_snapshot: { heat_index: number | null; heat_category: string | null } | null
  }>("/v1/labels", {
    method: "POST",
    body: JSON.stringify({
      date: input.date,
      pre_school: input.preSchool,
      elementary: input.elementary,
      high_school: input.highSchool,
      college: input.college,
      rainfall: input.rainfall,
      tmax: input.tmax,
      tmin: input.tmin,
      rh: input.rh,
      wind_speed: input.windSpeed,
      pagasa_level: input.pagasaLevel,
      tcws_signal: input.tcwsSignal,
      notes: input.notes,
      created_by: input.createdBy,
    }),
  })

  return {
    id: data.id,
    date: data.date,
    preSchool: data.pre_school,
    elementary: data.elementary,
    highSchool: data.high_school,
    college: data.college,
    suspended: data.suspended,
    includedInLiveModel: data.included_in_live_model,
    createdAt: data.created_at,
    rainfall: input.rainfall,
    tmax: input.tmax,
    tmin: input.tmin,
    rh: input.rh,
    windSpeed: input.windSpeed,
    heatIndexCelsius: data.weather_snapshot?.heat_index ?? null,
    heatCategory: data.weather_snapshot?.heat_category ?? null,
  }
}

export async function getLabels(): Promise<Label[]> {
  const data = await handaFetch<
    Array<{
      id: number
      date: string
      pre_school: boolean
      elementary: boolean
      high_school: boolean
      college: boolean
      suspended: boolean
      included_in_live_model: boolean
      created_by: string | null
      created_at: string
      weather_snapshot: {
        rainfall: number
        tmax: number
        tmin: number
        rh: number
        wind_speed: number
        pagasa_level: string | null
        tcws_signal: number | null
        heat_index: number | null
        heat_category: string | null
      } | null
    }>
  >("/v1/labels")

  return data.map((l) => ({
    id: l.id,
    date: l.date,
    preSchool: l.pre_school,
    elementary: l.elementary,
    highSchool: l.high_school,
    college: l.college,
    suspended: l.suspended,
    includedInLiveModel: l.included_in_live_model,
    createdBy: l.created_by ?? undefined,
    createdAt: l.created_at,
    rainfall: l.weather_snapshot?.rainfall ?? 0,
    tmax: l.weather_snapshot?.tmax ?? 0,
    tmin: l.weather_snapshot?.tmin ?? 0,
    rh: l.weather_snapshot?.rh ?? 0,
    windSpeed: l.weather_snapshot?.wind_speed ?? 0,
    pagasaLevel: l.weather_snapshot?.pagasa_level ?? null,
    tcwsSignal: l.weather_snapshot?.tcws_signal ?? null,
    heatIndexCelsius: l.weather_snapshot?.heat_index ?? null,
    heatCategory: l.weather_snapshot?.heat_category ?? null,
  }))
}

export type ModelVersion = {
  id: number
  modelName: string
  status: "staging" | "live" | "archived"
  accuracy: number
  precision: number
  recall: number
  f1: number
  nDays: number
  nSuspensions: number
  trainedAt: string
  promotedAt: string | null
  promotedBy: string | null
}

function mapModelVersion(v: {
  id: number
  model_name: string
  status: "staging" | "live" | "archived"
  accuracy: number
  precision: number
  recall: number
  f1: number
  n_days: number
  n_suspensions: number
  trained_at: string
  promoted_at: string | null
  promoted_by: string | null
}): ModelVersion {
  return {
    id: v.id,
    modelName: v.model_name,
    status: v.status,
    accuracy: v.accuracy,
    precision: v.precision,
    recall: v.recall,
    f1: v.f1,
    nDays: v.n_days,
    nSuspensions: v.n_suspensions,
    trainedAt: v.trained_at,
    promotedAt: v.promoted_at,
    promotedBy: v.promoted_by,
  }
}

export async function getModelVersions(): Promise<ModelVersion[]> {
  const data = await handaFetch<Parameters<typeof mapModelVersion>[0][]>("/v1/model/versions")
  return data.map(mapModelVersion)
}

export async function triggerStagingRetrain(): Promise<ModelVersion> {
  const data = await handaFetch<Parameters<typeof mapModelVersion>[0]>("/v1/model/retrain-staging", {
    method: "POST",
  })
  return mapModelVersion(data)
}

export async function promoteModelVersion(versionId: number, promotedBy?: string): Promise<ModelVersion> {
  const data = await handaFetch<Parameters<typeof mapModelVersion>[0]>(
    `/v1/model/promote/${versionId}`,
    { method: "POST", body: JSON.stringify({ promoted_by: promotedBy }) }
  )
  return mapModelVersion(data)
}

export type ReplayPrediction = {
  probability: number
  riskLevel: "low" | "moderate" | "high"
  recommendation: string
}

export type ReplayDay = {
  date: string
  conditions: PredictionRequest
}

export type ReplayResult = ReplayDay & {
  actuallySuspended: boolean
  liveModel: ReplayPrediction // trained on this day
  heldOut: ReplayPrediction // refit without this day
}

type RawConditions = {
  rainfall: number
  tmax: number
  tmin: number
  rh: number
  wind_speed: number
  month: number
  rain_3day_sum: number | null
  rain_7day_sum: number | null
}

type RawReplayPrediction = { probability: number; risk_level: ReplayPrediction["riskLevel"]; recommendation: string }

function mapConditions(c: RawConditions): PredictionRequest {
  return {
    rainfall: c.rainfall,
    tmax: c.tmax,
    tmin: c.tmin,
    rh: c.rh,
    windSpeed: c.wind_speed,
    month: c.month,
    rain3daySum: c.rain_3day_sum ?? undefined,
    rain7daySum: c.rain_7day_sum ?? undefined,
  }
}

function mapReplayPrediction(p: RawReplayPrediction): ReplayPrediction {
  return { probability: p.probability, riskLevel: p.risk_level, recommendation: p.recommendation }
}

export async function getReplayDays(): Promise<ReplayDay[]> {
  const data = await handaFetch<Array<{ date: string; conditions: RawConditions }>>("/v1/replay/days")
  return data.map((d) => ({ date: d.date, conditions: mapConditions(d.conditions) }))
}

export async function replayDay(date: string): Promise<ReplayResult> {
  const data = await handaFetch<{
    date: string
    conditions: RawConditions
    actually_suspended: boolean
    live_model: RawReplayPrediction
    held_out: RawReplayPrediction
  }>(`/v1/replay/${encodeURIComponent(date)}`)
  return {
    date: data.date,
    conditions: mapConditions(data.conditions),
    actuallySuspended: data.actually_suspended,
    liveModel: mapReplayPrediction(data.live_model),
    heldOut: mapReplayPrediction(data.held_out),
  }
}
