"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label as FormLabel } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, CloudRain, Save } from "lucide-react"
import type { LivePredictionResponse } from "@/lib/handa-api"

const LEVELS = [
  { key: "preSchool" as const, label: "Pre-school" },
  { key: "elementary" as const, label: "Elementary" },
  { key: "highSchool" as const, label: "High School" },
  { key: "college" as const, label: "College" },
]

export default function LabelClient({ live }: { live: LivePredictionResponse }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    preSchool: false,
    elementary: false,
    highSchool: false,
    college: false,
  })
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          preSchool: checked.preSchool,
          elementary: checked.elementary,
          highSchool: checked.highSchool,
          college: checked.college,
          rainfall: live.conditionsUsed.rainfall,
          tmax: live.conditionsUsed.tmax,
          tmin: live.conditionsUsed.tmin,
          rh: live.conditionsUsed.rh,
          windSpeed: live.conditionsUsed.windSpeed,
          pagasaLevel: live.pagasaWarning.level,
          tcwsSignal: live.tcws.signal,
          notes,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.error ?? "Failed to save label.")
        return
      }
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const anySuspended = Object.values(checked).some(Boolean)

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Today&apos;s Conditions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Captured live from PAGASA and OpenWeatherMap — this is exactly what gets saved
            alongside your label as training data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Rainfall</p>
              <p className="text-xl font-semibold text-foreground">{Math.round(live.conditionsUsed.rainfall)}mm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-xl font-semibold text-foreground">{Math.round(live.conditionsUsed.tmax)}°C</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-xl font-semibold text-foreground">{Math.round(live.conditionsUsed.rh)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PAGASA Warning</p>
              <p className="text-xl font-semibold text-foreground">{live.pagasaWarning.level ?? "None"}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {live.tcws.signal !== null && (
              <Badge variant="destructive">Wind Signal No. {live.tcws.signal} in effect</Badge>
            )}
            <Badge
              variant={
                live.heatIndex.category === "Danger" || live.heatIndex.category === "Extreme Danger"
                  ? "destructive"
                  : "secondary"
              }
            >
              Heat Index: {live.heatIndex.category} ({Math.round(live.heatIndex.heatIndexCelsius)}°C)
            </Badge>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
            <CloudRain className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Model recommendation right now: <strong className="text-foreground">{live.recommendation}</strong>
              {" "}(p={live.probability.toFixed(2)})
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">What actually happened today?</CardTitle>
          <CardDescription className="text-muted-foreground">
            Tick every level that was actually suspended. This becomes a training example the next
            time the model is retrained — it won&apos;t affect live predictions until an admin
            reviews and promotes the retrained model on the Model Training page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {LEVELS.map((level) => (
              <label
                key={level.key}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground"
              >
                <Checkbox
                  checked={checked[level.key]}
                  onCheckedChange={(value) =>
                    setChecked((prev) => ({ ...prev, [level.key]: value === true }))
                  }
                />
                {level.label}
              </label>
            ))}
          </div>

          <div>
            <FormLabel htmlFor="notes">Notes (optional)</FormLabel>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Suspension announced 6PM due to Orange rainfall warning"
              className="mt-2 bg-input border-border text-foreground"
            />
          </div>

          {!anySuspended && (
            <p className="text-xs text-muted-foreground">
              No levels checked will be saved as a normal (non-suspended) day.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && (
            <p className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" /> Saved as training data.
            </p>
          )}

          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save as training data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
