"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Eye,
  LoaderCircle,
  Radio,
  TestTube2,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react"

type SimulationResponse = {
  input: {
    temperature: number
    rainfall: number
    windSpeed: number
    humidity: number
    floodRisk: "low" | "moderate" | "high"
    visibility: "good" | "reduced" | "poor"
    stormSignal: "none" | "signal-1" | "signal-2" | "signal-3"
    tideLevel: "low" | "normal" | "high" | "storm-surge"
    notes?: string
  }
  result: {
    score: number
    level: "low" | "medium" | "high"
    confidence: number
    recommendation: "NO SUSPEND" | "PARTIAL SUSPEND" | "SUSPEND"
    summary: string
    affectedLevels: string[]
    factors: Array<{
      name: string
      value: string
      impact: "normal" | "warning" | "critical"
    }>
  }
  simulatedAt: string
}

// Mirrors PAGASA's hourly Rainfall Warning System bands used by
// getRainfallImpact() in lib/weather-simulation.ts — shown live so the
// admin sees the classification before running the simulation.
function rainfallBand(mmPerHour: number) {
  if (Number.isNaN(mmPerHour)) return null
  if (mmPerHour >= 30) return { label: "Red — Torrential", className: "text-destructive" }
  if (mmPerHour >= 15) return { label: "Orange — Intense", className: "text-destructive" }
  if (mmPerHour >= 7.5) return { label: "Yellow — Moderate", className: "text-warning" }
  return { label: "Light", className: "text-muted-foreground" }
}

const initialForm = {
  temperature: "28",
  rainfall: "16",
  windSpeed: "45",
  humidity: "85",
  floodRisk: "moderate",
  visibility: "reduced",
  stormSignal: "signal-1",
  tideLevel: "high",
  notes: "Simulated morning conditions for Olongapo City.",
}

export default function SimulationClient() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const recommendationTone =
    result?.result.level === "high"
      ? {
          shell: "border-destructive/30 bg-destructive/5",
          badge: "bg-destructive text-destructive-foreground",
        }
      : result?.result.level === "medium"
        ? {
            shell: "border-warning/30 bg-warning/5",
            badge: "bg-warning text-warning-foreground",
          }
        : {
            shell: "border-success/30 bg-success/5",
            badge: "bg-success text-success-foreground",
          }

  async function handleSimulate() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature: form.temperature,
          rainfall: form.rainfall,
          windSpeed: form.windSpeed,
          humidity: form.humidity,
          floodRisk: form.floodRisk,
          visibility: form.visibility,
          stormSignal: form.stormSignal,
          tideLevel: form.tideLevel,
          notes: form.notes,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error ?? "Simulation failed.")
        setResult(null)
        return
      }

      setResult(payload)
    } catch {
      setError("Unable to run the simulation right now.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  function setPreset(preset: typeof initialForm) {
    setForm(preset)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5 text-primary" />
              Weather Scenario Input
            </CardTitle>
            <CardDescription>
              Enter manual weather conditions and trigger a simulated machine
              learning response.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPreset({
                    temperature: "27",
                    rainfall: "5",
                    windSpeed: "18",
                    humidity: "72",
                    floodRisk: "low",
                    visibility: "good",
                    stormSignal: "none",
                    tideLevel: "low",
                    notes: "Low-risk baseline scenario.",
                  })
                }
              >
                Low Risk Preset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPreset({
                    temperature: "29",
                    rainfall: "14",
                    windSpeed: "38",
                    humidity: "84",
                    floodRisk: "moderate",
                    visibility: "reduced",
                    stormSignal: "signal-1",
                    tideLevel: "normal",
                    notes: "Moderate rainfall with visibility issues.",
                  })
                }
              >
                Medium Risk Preset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setPreset({
                    temperature: "30",
                    rainfall: "35",
                    windSpeed: "76",
                    humidity: "93",
                    floodRisk: "high",
                    visibility: "poor",
                    stormSignal: "signal-2",
                    tideLevel: "storm-surge",
                    notes: "Severe afternoon weather conditions.",
                  })
                }
              >
                High Risk Preset
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Atmospheric Conditions
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={form.temperature}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        temperature: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity" className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5" />
                    Humidity (%)
                  </Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={form.humidity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        humidity: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="windSpeed" className="flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5" />
                    Wind Speed (km/h)
                  </Label>
                  <Input
                    id="windSpeed"
                    type="number"
                    value={form.windSpeed}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        windSpeed: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Rainfall &amp; Coastal
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="rainfall" className="flex items-center gap-1.5">
                    <CloudRain className="h-3.5 w-3.5" />
                    Rainfall (mm/hr)
                  </Label>
                  <Input
                    id="rainfall"
                    type="number"
                    value={form.rainfall}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        rainfall: event.target.value,
                      }))
                    }
                  />
                  {(() => {
                    const band = rainfallBand(Number.parseFloat(form.rainfall))
                    return band ? (
                      <p className={`text-xs ${band.className}`}>PAGASA band: {band.label}</p>
                    ) : null
                  })()}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Waves className="h-3.5 w-3.5" />
                    Tide Level
                  </Label>
                  <Select
                    value={form.tideLevel}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, tideLevel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tide level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Tide</SelectItem>
                      <SelectItem value="normal">Normal Tide</SelectItem>
                      <SelectItem value="high">High Tide</SelectItem>
                      <SelectItem value="storm-surge">Storm Surge Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Flood Risk</Label>
                  <Select
                    value={form.floodRisk}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, floodRisk: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select flood risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Advisories &amp; Notes
              </p>
              <div className="grid gap-4 sm:grid-cols-[0.6fr_0.6fr_1.2fr]">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5" />
                    Storm Signal
                  </Label>
                  <Select
                    value={form.stormSignal}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, stormSignal: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storm signal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="signal-1">Signal #1</SelectItem>
                      <SelectItem value="signal-2">Signal #2</SelectItem>
                      <SelectItem value="signal-3">Signal #3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Visibility
                  </Label>
                  <Select
                    value={form.visibility}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, visibility: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="reduced">Reduced</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Scenario Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    className="min-h-24"
                    placeholder="Add context for the scenario"
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              className="w-full sm:w-auto"
              onClick={handleSimulate}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${recommendationTone?.shell ?? "border-border"}`}
        >
          <CardHeader>
            <CardTitle>Simulated Model Response</CardTitle>
            <CardDescription>
              The result panel updates after the admin submits a weather
              scenario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={recommendationTone?.badge}>
                      {result.result.recommendation}
                    </Badge>
                    <Badge variant="outline">Risk: {result.result.level}</Badge>
                    <Badge variant="outline">
                      Confidence: {result.result.confidence}%
                    </Badge>
                    <Badge variant="outline">
                      Score: {result.result.score}/100
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {result.result.summary}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Thermometer className="h-4 w-4" />
                        Temperature
                      </div>
                      <p className="mt-2 text-2xl font-semibold">
                        {result.input.temperature}°C
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CloudRain className="h-4 w-4" />
                        Rainfall
                      </div>
                      <p className="mt-2 text-2xl font-semibold">
                        {result.input.rainfall} mm/hr
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wind className="h-4 w-4" />
                        Wind Speed
                      </div>
                      <p className="mt-2 text-2xl font-semibold">
                        {result.input.windSpeed} km/h
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Waves className="h-4 w-4" />
                        Tide Level
                      </div>
                      <p className="mt-2 text-2xl font-semibold capitalize">
                        {result.input.tideLevel.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Affected School Levels
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.result.affectedLevels.map((level) => (
                      <Badge key={level} variant="secondary">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Risk Drivers
                  </p>
                  <div className="mt-3 space-y-3">
                    {result.result.factors.map((factor) => (
                      <div
                        key={factor.name}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {factor.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {factor.value}
                          </p>
                        </div>
                        <Badge
                          variant={
                            factor.impact === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            factor.impact === "warning"
                              ? "bg-warning text-warning-foreground"
                              : undefined
                          }
                        >
                          {factor.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Simulated at {new Date(result.simulatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 p-6 text-center">
                <div className="max-w-sm">
                  <TestTube2 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium text-foreground">
                    No simulation result yet
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Submit a custom weather scenario to preview how the model
                    would respond.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
