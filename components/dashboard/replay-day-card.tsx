"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ReplayDay, ReplayPrediction, ReplayResult } from "@/lib/handa-api"
import { History, LoaderCircle } from "lucide-react"

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Manila",
})

function formatDay(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00+08:00`))
}

function riskTone(level: ReplayPrediction["riskLevel"]) {
  switch (level) {
    case "high":
      return "bg-destructive/15 border-destructive/40 text-destructive"
    case "moderate":
      return "bg-warning/15 border-warning/40 text-warning"
    default:
      return "bg-success/15 border-success/40 text-success"
  }
}

function riskLabel(level: ReplayPrediction["riskLevel"]) {
  switch (level) {
    case "high":
      return "Suspend"
    case "moderate":
      return "Partial"
    default:
      return "No Suspend"
  }
}

function verdict(heldOut: ReplayPrediction) {
  if (heldOut.riskLevel === "high") return "Without ever seeing this day, the model would have recommended suspension."
  if (heldOut.riskLevel === "moderate") return "Without ever seeing this day, the model would have flagged it as moderate risk (partial suspension)."
  return "The model misses this day. Suspensions declared ahead of a storm, with little rain recorded that day, are its known blind spot."
}

function PredictionPanel({ title, note, prediction, emphasis }: {
  title: string
  note: string
  prediction: ReplayPrediction
  emphasis: boolean
}) {
  return (
    <div className={`rounded-2xl border p-4 ${emphasis ? "border-border bg-background/80" : "border-border/60 bg-background/40"}`}>
      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">{title}</p>
      <p className={`mt-2 font-semibold text-foreground ${emphasis ? "text-4xl" : "text-2xl"}`}>
        {Math.round(prediction.probability * 100)}%
      </p>
      <Badge variant="outline" className={`mt-2 ${riskTone(prediction.riskLevel)}`}>
        {riskLabel(prediction.riskLevel)}
      </Badge>
      <p className="mt-2 text-sm text-foreground">{prediction.recommendation}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

export function ReplayDayCard({ days }: { days: ReplayDay[] }) {
  const [selected, setSelected] = useState(days[0]?.date ?? "")
  const [result, setResult] = useState<ReplayResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleReplay() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/replay/${selected}`)
      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error ?? "Replay failed.")
        setResult(null)
        return
      }
      setResult(payload)
    } catch {
      setError("Unable to replay this day right now.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const c = result?.conditions

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Replay a Real Suspension Day
        </CardTitle>
        <CardDescription>
          Run the recorded weather from a day classes were actually suspended in Olongapo (2023–2024) through the
          model. These days are part of the training data, so the main score comes from the model refit without the
          chosen day — the same leave-one-out check used in the study.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="replay-day">Suspension day</Label>
            <Select
              value={selected}
              onValueChange={(value) => {
                setSelected(value)
                setResult(null)
              }}
            >
              <SelectTrigger id="replay-day" className="w-full">
                <SelectValue placeholder="Choose a day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.date} value={day.date}>
                    {formatDay(day.date)} — {Math.round(day.conditions.rainfall)}mm rain
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleReplay} disabled={!selected || loading}>
            {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Replay this day
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && c && (
          <div className="space-y-4" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">{formatDay(result.date)}</p>
              <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
                Actual decision: classes suspended
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PredictionPanel
                title="Model without this day"
                note="Refit with this day left out — an honest, unseen prediction."
                prediction={result.heldOut}
                emphasis
              />
              <PredictionPanel
                title="Live model"
                note="Trained on this day, so it has seen the answer."
                prediction={result.liveModel}
                emphasis={false}
              />
            </div>

            <p className="text-sm text-foreground">{verdict(result.heldOut)}</p>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Recorded conditions (Cubi Point daily data)
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Rainfall (day)", `${c.rainfall}mm`],
                  ["3-day rain", `${c.rain3daySum ?? c.rainfall}mm`],
                  ["7-day rain", `${c.rain7daySum ?? c.rainfall}mm`],
                  ["Max / min temp", `${c.tmax}° / ${c.tmin}°C`],
                  ["Humidity", `${c.rh}%`],
                  ["Wind", `${Math.round(c.windSpeed * 3.6)} km/h`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-secondary/40 px-3 py-2">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
