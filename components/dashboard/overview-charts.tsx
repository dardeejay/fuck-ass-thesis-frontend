"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FeatureImportance } from "@/lib/handa-api"
import type { MonthlyCount } from "@/lib/suspension-aggregates"

const tooltipStyle = {
  backgroundColor: "oklch(0.18 0.01 260)",
  border: "1px solid oklch(0.28 0.01 260)",
  borderRadius: "8px",
  color: "oklch(0.95 0 0)",
}

export function OverviewCharts({
  featureImportance,
  monthlyTrend,
}: {
  featureImportance: FeatureImportance[]
  monthlyTrend: MonthlyCount[]
}) {
  const importanceData = featureImportance.slice(0, 6).map((f) => ({
    name: f.feature,
    importance: Math.round(f.importance * 1000) / 10, // fraction -> % with 1 decimal
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground">Model Risk Drivers</CardTitle>
          <CardDescription className="text-muted-foreground">
            What the Random Forest model weighs most heavily
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importanceData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={12} unit="%" />
                <YAxis type="category" dataKey="name" stroke="oklch(0.65 0 0)" fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                <Bar dataKey="importance" fill="oklch(0.6 0.15 200)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Suspension Trend</CardTitle>
              <CardDescription className="text-muted-foreground">
                Scraped suspension announcements by month
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
              Historical
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="suspensions"
                  stroke="oklch(0.55 0.22 25)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.55 0.22 25)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
