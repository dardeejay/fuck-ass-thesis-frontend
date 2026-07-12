"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react"
import type { ModelVersion } from "@/lib/handa-api"

function statusBadge(status: ModelVersion["status"]) {
  switch (status) {
    case "live":
      return <Badge className="bg-success/20 text-success border-success/30">Live</Badge>
    case "staging":
      return <Badge className="bg-warning/20 text-warning border-warning/30">Staging — pending review</Badge>
    default:
      return <Badge variant="secondary">Archived</Badge>
  }
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function ModelVersionsClient({ initialVersions }: { initialVersions: ModelVersion[] }) {
  const [versions, setVersions] = useState(initialVersions)
  const [retraining, setRetraining] = useState(false)
  const [promotingId, setPromotingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const live = versions.find((v) => v.status === "live")
  const stagingCandidates = versions.filter((v) => v.status === "staging")

  async function refresh() {
    const response = await fetch("/api/model/versions")
    if (response.ok) setVersions(await response.json())
  }

  async function handleRetrain() {
    setRetraining(true)
    setError(null)
    try {
      const response = await fetch("/api/model/retrain-staging", { method: "POST" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.error ?? "Retrain failed.")
        return
      }
      await refresh()
    } finally {
      setRetraining(false)
    }
  }

  async function handlePromote(versionId: number) {
    setPromotingId(versionId)
    setError(null)
    try {
      const response = await fetch(`/api/model/promote/${versionId}`, { method: "POST" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.error ?? "Promotion failed.")
        return
      }
      await refresh()
    } finally {
      setPromotingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Currently Live Model</CardTitle>
              <CardDescription className="text-muted-foreground">
                What&apos;s actually serving predictions right now
              </CardDescription>
            </div>
            <Button onClick={handleRetrain} disabled={retraining} variant="outline" className="border-border">
              {retraining ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {retraining ? "Retraining (~1-2 min)..." : "Retrain now"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {live ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-xl font-semibold text-foreground">{pct(live.accuracy)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precision</p>
                <p className="text-xl font-semibold text-foreground">{pct(live.precision)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recall</p>
                <p className="text-xl font-semibold text-foreground">{pct(live.recall)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">F1</p>
                <p className="text-xl font-semibold text-foreground">{pct(live.f1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training days</p>
                <p className="text-xl font-semibold text-foreground">
                  {live.nDays} ({live.nSuspensions} suspensions)
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No promoted version on record yet — the model is training from the base historical CSVs.
            </p>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {stagingCandidates.length > 0 && (
        <Card className="border-2 border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-foreground">Pending Review</CardTitle>
            <CardDescription className="text-muted-foreground">
              Retrained with newly submitted labels included. Won&apos;t affect live predictions until promoted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stagingCandidates.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Trained {new Date(v.trainedAt).toLocaleString()}</span>
                  <span>F1 <strong className="text-foreground">{pct(v.f1)}</strong></span>
                  <span>Precision <strong className="text-foreground">{pct(v.precision)}</strong></span>
                  <span>Recall <strong className="text-foreground">{pct(v.recall)}</strong></span>
                  <span className="text-muted-foreground">{v.nDays} days, {v.nSuspensions} suspensions</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handlePromote(v.id)}
                  disabled={promotingId === v.id}
                  className="bg-primary text-primary-foreground"
                >
                  {promotingId === v.id ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Promote to live
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Version History</CardTitle>
          <CardDescription className="text-muted-foreground">All staging/live/archived retrains</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-border">
                <TableHead className="text-muted-foreground">Trained</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">F1</TableHead>
                <TableHead className="text-muted-foreground">Precision</TableHead>
                <TableHead className="text-muted-foreground">Recall</TableHead>
                <TableHead className="text-muted-foreground">Days</TableHead>
                <TableHead className="text-muted-foreground">Promoted by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((v) => (
                <TableRow key={v.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="text-foreground">{new Date(v.trainedAt).toLocaleString()}</TableCell>
                  <TableCell>{statusBadge(v.status)}</TableCell>
                  <TableCell className="text-foreground">{pct(v.f1)}</TableCell>
                  <TableCell className="text-foreground">{pct(v.precision)}</TableCell>
                  <TableCell className="text-foreground">{pct(v.recall)}</TableCell>
                  <TableCell className="text-foreground">{v.nDays}</TableCell>
                  <TableCell className="text-foreground">{v.promotedBy ?? "—"}</TableCell>
                </TableRow>
              ))}
              {versions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No retrains yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
