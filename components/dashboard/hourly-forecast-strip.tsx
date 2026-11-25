import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ForecastStep } from "@/lib/handa-api"
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from "lucide-react"

function iconForWeather(weatherId: number) {
  if (weatherId >= 200 && weatherId < 300) return CloudLightning
  if (weatherId >= 300 && weatherId < 400) return CloudDrizzle
  if (weatherId >= 500 && weatherId < 600) return CloudRain
  if (weatherId >= 600 && weatherId < 700) return CloudSnow
  if (weatherId >= 700 && weatherId < 800) return CloudFog
  if (weatherId === 800) return Sun
  return Cloud
}

function riskBadgeClass(level: ForecastStep["riskLevel"]) {
  switch (level) {
    case "high":
      return "bg-destructive/15 border-destructive/40 text-destructive"
    case "moderate":
      return "bg-warning/15 border-warning/40 text-warning"
    default:
      return "bg-success/15 border-success/40 text-success"
  }
}

function riskLabel(level: ForecastStep["riskLevel"]) {
  switch (level) {
    case "high":
      return "Suspend"
    case "moderate":
      return "Partial"
    default:
      return "No Suspend"
  }
}

const dayFormatter = new Intl.DateTimeFormat("en-PH", { weekday: "short", timeZone: "Asia/Manila" })
const hourFormatter = new Intl.DateTimeFormat("en-PH", { hour: "numeric", hour12: true, timeZone: "Asia/Manila" })

const FORECAST_STEP_HOURS = 3
const FORECAST_DAYS = 5
const MAX_STEPS = (FORECAST_DAYS * 24) / FORECAST_STEP_HOURS

export function HourlyForecastStrip({ steps }: { steps: ForecastStep[] }) {
  if (steps.length === 0) return null

  const visibleSteps = steps.slice(0, MAX_STEPS)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Upcoming Forecast</CardTitle>
        <CardDescription>
          {FORECAST_DAYS}-day, 3-hour forecast steps from OpenWeatherMap, run through the same
          suspension model as today&apos;s recommendation. Each step is scored on the rain
          accumulated over the 24 hours and 3 days ending at that step. That model was validated on daily
          conditions, so treat these per-step suggestions as indicative — not a substitute for the
          recommendation above.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {visibleSteps.map((step) => {
            const Icon = iconForWeather(step.weatherId)
            return (
              <div
                key={step.timestamp}
                className="flex min-w-[112px] flex-none flex-col items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-3 text-center"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {dayFormatter.format(new Date(step.timestamp))} {hourFormatter.format(new Date(step.timestamp))}
                </p>
                <Icon className="h-6 w-6 text-chart-3" />
                <p className="text-lg font-semibold text-foreground">{Math.round(step.tmax)}°C</p>
                <p className="text-xs text-muted-foreground">{Math.round(step.rainfall)}mm (3h)</p>
                <p className="text-[11px] text-muted-foreground">{Math.round(step.rain24h)}mm past 24h</p>
                <Badge variant="outline" className={`px-2 py-0.5 text-[11px] ${riskBadgeClass(step.riskLevel)}`}>
                  {riskLabel(step.riskLevel)}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
