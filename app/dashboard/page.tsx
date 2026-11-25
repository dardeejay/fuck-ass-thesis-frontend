import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HourlyForecastStrip } from "@/components/dashboard/hourly-forecast-strip"
import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { getForecast, getLivePrediction, getSuspensionHistory } from "@/lib/handa-api"
import {
  affectedLevelsFor,
  factorForFeature,
  FEATURE_LABELS,
  impactOrder,
  poolForecastOutlook,
} from "@/lib/handa-adapter"
import { suspensionsByMonth } from "@/lib/suspension-aggregates"
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  MapPin,
  ShieldAlert,
  Thermometer,
  Wind,
} from "lucide-react"

export const dynamic = "force-dynamic" // live weather/PAGASA data, never cache

const peakTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  hour: "numeric",
  hour12: true,
  timeZone: "Asia/Manila",
})

function getRecommendationColor(level: string) {
  switch (level) {
    case "high":
      return "bg-destructive/20 border-destructive/40 text-destructive"
    case "medium":
      return "bg-warning/20 border-warning/40 text-warning"
    default:
      return "bg-success/20 border-success/40 text-success"
  }
}

// What each upstream source id means on screen. Fallbacks are flagged so a
// viewer can tell live data from assumed values (e.g. no network at a venue).
const SOURCE_INFO: Record<string, { label: string; fallback: boolean }> = {
  pagasa: { label: "PAGASA warning", fallback: false },
  "open-meteo-observed": { label: "Open-Meteo observed", fallback: true },
  "pagasa-fallback": { label: "Assumed light rain", fallback: true },
  openweathermap: { label: "OpenWeatherMap", fallback: false },
  "climatology-fallback": { label: "Monthly averages", fallback: true },
  "open-meteo": { label: "Open-Meteo observed", fallback: false },
  unavailable: { label: "Unavailable", fallback: true },
}

function sourceBadges(live: { sources: { rainfallSource: string; weatherSource: string; rainHistorySource: string } }, hasForecast: boolean) {
  return [
    { name: "Rainfall", id: live.sources.rainfallSource },
    { name: "Weather", id: live.sources.weatherSource },
    { name: "Rain history", id: live.sources.rainHistorySource },
    { name: "Forecast", id: hasForecast ? "openweathermap" : "unavailable" },
  ].map(({ name, id }) => ({ name, ...(SOURCE_INFO[id] ?? { label: id, fallback: true }) }))
}

function getImpactBadge(impact: string) {
  switch (impact) {
    case "critical":
      return <Badge variant="destructive" className="text-xs">Critical</Badge>
    case "warning":
      return <Badge className="bg-warning text-warning-foreground text-xs">Warning</Badge>
    default:
      return <Badge variant="secondary" className="text-xs">Normal</Badge>
  }
}

export default async function DashboardPage() {
  const [live, history, forecast] = await Promise.all([
    getLivePrediction(),
    getSuspensionHistory(),
    // Forecast is a supplementary strip, not core to the page — an
    // OpenWeatherMap hiccup shouldn't take down the whole dashboard.
    getForecast().catch(() => null),
  ])

  // The hero card leads with the pooled forecast outlook (worst-case risk
  // over the next `outlook.windowHours`), not just current conditions — a
  // beneficiary deciding on suspensions cares more about what's coming than
  // what the weather happens to be right now. Falls back to today's live
  // prediction if the forecast pull failed.
  const outlook = forecast ? poolForecastOutlook(forecast.steps, 24) : null

  const level = outlook ? outlook.level : live.riskLevel === "moderate" ? "medium" : live.riskLevel
  const recommendation = outlook
    ? outlook.recommendation
    : live.riskLevel === "high"
      ? "SUSPEND"
      : live.riskLevel === "moderate"
        ? "PARTIAL SUSPEND"
        : "NO SUSPEND"
  const confidence = outlook ? outlook.confidence : Math.round(50 + Math.abs(live.probability - 0.5) * 100)
  const affectedLevels = affectedLevelsFor(outlook ? outlook.peak.riskLevel : live.riskLevel)

  const heroConditions = outlook
    ? {
        rainfall: outlook.peak.rain24h,
        rain3daySum: outlook.peak.rain3daySum,
        tmax: outlook.peak.tmax,
        tmin: outlook.peak.tmin,
        rh: outlook.peak.rh,
        windSpeed: outlook.peak.windSpeed,
        month: new Date(outlook.peak.timestamp).getMonth() + 1,
      }
    : live.conditionsUsed
  const windKmh = Math.round(heroConditions.windSpeed * 3.6)
  const peakTimeLabel = outlook ? peakTimeFormatter.format(new Date(outlook.peak.timestamp)) : null

  const sources = sourceBadges(live, forecast !== null)
  const usingFallback = sources.some((source) => source.fallback)

  const currentWindKmh = Math.round(live.conditionsUsed.windSpeed * 3.6)

  const factors = live.featureImportance.slice(0, 4).map(({ feature }) => ({
    name: FEATURE_LABELS[feature] ?? feature,
    ...factorForFeature(feature, heroConditions),
  })).sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])

  const recommendationTone =
    level === "high"
      ? {
          shell:
            "border-destructive/30 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--destructive)_18%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_88%,var(--destructive)_12%),var(--card))]",
          iconWrap: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20",
          eyebrow: "text-destructive",
          pulse: "bg-destructive/12 text-destructive ring-1 ring-destructive/20",
          cta: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        }
      : level === "medium"
        ? {
            shell:
              "border-warning/30 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--warning)_16%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_90%,var(--warning)_10%),var(--card))]",
            iconWrap: "bg-warning text-warning-foreground shadow-lg shadow-warning/20",
            eyebrow: "text-warning",
            pulse: "bg-warning/12 text-warning ring-1 ring-warning/20",
            cta: "bg-warning text-warning-foreground hover:bg-warning/90",
          }
        : {
            shell:
              "border-primary/30 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_16%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_90%,var(--primary)_10%),var(--card))]",
            iconWrap: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
            eyebrow: "text-primary",
            pulse: "bg-primary/12 text-primary ring-1 ring-primary/20",
            cta: "bg-primary text-primary-foreground hover:bg-primary/90",
          }

  return (
    <div className="space-y-6">
      {/* Tropical Cyclone Wind Signal — a separate, policy-driven automatic
          suspension trigger, independent of the ML model's rainfall-based
          assessment below. Deliberately not merged into the AI card. */}
      {live.tcws.signal !== null && (
        <Card className="border-2 border-destructive/40 bg-destructive/10">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-2xl bg-destructive p-3 text-destructive-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-destructive">
                Tropical Cyclone Wind Signal No. {live.tcws.signal} — Automatic Suspension Policy
              </p>
              <p className="mt-1 text-sm text-foreground">{live.tcws.automaticSuspensionNote}</p>
              {live.tcws.matchedAreasText && (
                <p className="mt-1 text-xs text-muted-foreground">Affected areas: {live.tcws.matchedAreasText}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heat Index — computed from TMAX/RH (both already model features),
          classified per PAGASA's public health-risk bands. Also policy-
          driven, not an ML output — kept separate for the same reason as
          the TCWS banner above. */}
      {(live.heatIndex.category === "Danger" || live.heatIndex.category === "Extreme Danger") && (
        <Card className="border-2 border-warning/40 bg-warning/10">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-2xl bg-warning p-3 text-warning-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-warning">
                Heat Index: {live.heatIndex.category} ({Math.round(live.heatIndex.heatIndexCelsius)}°C)
              </p>
              <p className="mt-1 text-sm text-foreground">{live.heatIndex.note}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendation Centerpiece */}
      <Card className={`overflow-hidden border-2 ${recommendationTone.shell}`}>
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="flex flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-12 lg:items-start lg:px-12 lg:text-left">
              <div className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl ${recommendationTone.iconWrap}`}>
                <AlertTriangle className="h-8 w-8" />
              </div>
              <p className={`text-sm font-semibold tracking-[0.24em] uppercase ${recommendationTone.eyebrow}`}>
                {outlook ? `${outlook.windowHours}-Hour Suspension Outlook` : "AI Suspension Recommendation"}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {recommendation}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {outlook ? (
                  <>Highest risk expected around <strong>{peakTimeLabel}</strong> — {outlook.peak.recommendation}</>
                ) : (
                  live.recommendation
                )}
                {live.pagasaWarning.level && (
                  <> PAGASA currently has a <strong>{live.pagasaWarning.level}</strong> rainfall warning covering Olongapo.</>
                )}
              </p>
              {outlook && (
                <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                  Based on forecast steps, run through the same model validated on daily conditions —
                  treat this outlook as indicative, not a substitute for on-the-ground judgment.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Badge className={`border-0 px-3 py-1 text-sm ${recommendationTone.pulse}`}>
                  {confidence}% confidence
                </Badge>
                <Badge variant="outline" className="border-border/70 px-3 py-1 text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  Olongapo City
                </Badge>
                {outlook && (
                  <Badge variant="outline" className="border-border/70 px-3 py-1 text-sm text-muted-foreground">
                    Peak: {peakTimeLabel}
                  </Badge>
                )}
                <Badge variant="outline" className={`px-3 py-1 text-sm ${getRecommendationColor(level)}`}>
                  Risk Level: {level}
                </Badge>
              </div>

              <div className="mt-8 w-full max-w-3xl rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                  Affected School Levels
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {affectedLevels.map((affectedLevel) => (
                    <div
                      key={affectedLevel}
                      className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-4 text-center shadow-sm"
                    >
                      <p className="text-sm font-semibold tracking-wide text-destructive">
                        {affectedLevel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button variant="outline" className="border-border bg-background/70">
                  View Details
                </Button>
                <Button className={recommendationTone.cta}>
                  Issue Suspension
                </Button>
              </div>
            </div>

            <div className="border-t border-border/60 bg-background/50 p-6 sm:p-8 lg:border-t-0 lg:border-l">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
                  <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                    {outlook ? `Forecasted Conditions at Peak (${peakTimeLabel})` : "Live Conditions"}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rainfall (24h)</p>
                      <p className="text-2xl font-semibold text-foreground">{Math.round(heroConditions.rainfall)}mm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="text-2xl font-semibold text-foreground">{windKmh} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-xl font-semibold text-foreground">{Math.round(heroConditions.rh)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PAGASA Warning</p>
                      <p className="text-xl font-semibold text-foreground">{live.pagasaWarning.level ?? "None"}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Data sources{usingFallback && " — some live data unavailable, using fallbacks"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sources.map((source) => (
                        <Badge
                          key={source.name}
                          variant="outline"
                          className={`px-2 py-0.5 text-[11px] ${
                            source.fallback
                              ? "border-warning/40 bg-warning/15 text-warning"
                              : "border-border/70 text-muted-foreground"
                          }`}
                        >
                          {source.name}: {source.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
                  <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                    Highest Risk Drivers
                  </p>
                  <div className="mt-4 space-y-3">
                    {factors.slice(0, 3).map((factor) => (
                      <div key={factor.name} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{factor.name}</p>
                          <p className="text-xs text-muted-foreground">{factor.value}</p>
                        </div>
                        {getImpactBadge(factor.impact)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {forecast && <HourlyForecastStrip steps={forecast.steps} />}

      {/* Current Conditions — today's actual live readings, kept distinct
          from the hero card above (which now leads with the forecast
          outlook) so the two time frames are never conflated. */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Current Conditions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(live.conditionsUsed.tmax)}°C</p>
                </div>
                <div className="p-3 bg-chart-3/20 rounded-lg">
                  <Thermometer className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rainfall</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(live.conditionsUsed.rainfall)}mm</p>
                </div>
                <div className="p-3 bg-chart-2/20 rounded-lg">
                  <CloudRain className="h-5 w-5 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-2xl font-bold text-foreground">{currentWindKmh} km/h</p>
                </div>
                <div className="p-3 bg-chart-5/20 rounded-lg">
                  <Wind className="h-5 w-5 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(live.conditionsUsed.rh)}%</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Droplets className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OverviewCharts featureImportance={live.featureImportance} monthlyTrend={suspensionsByMonth(history)} />
    </div>
  )
}
