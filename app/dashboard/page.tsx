"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  RefreshCw,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

// Mock weather data
const currentWeather = {
  location: "Olongapo City",
  temperature: 28,
  humidity: 85,
  windSpeed: 45,
  rainfall: 32,
  condition: "Heavy Rain",
  lastUpdated: "5 mins ago",
}

// Mock forecast data
const forecastData = [
  { time: "6AM", rainfall: 15, temp: 26 },
  { time: "9AM", rainfall: 22, temp: 27 },
  { time: "12PM", rainfall: 35, temp: 28 },
  { time: "3PM", rainfall: 48, temp: 29 },
  { time: "6PM", rainfall: 42, temp: 27 },
  { time: "9PM", rainfall: 30, temp: 26 },
]

// Mock historical comparison
const historicalComparison = [
  { date: "Mon", current: 25, historical: 18 },
  { date: "Tue", current: 32, historical: 20 },
  { date: "Wed", current: 28, historical: 22 },
  { date: "Thu", current: 45, historical: 19 },
  { date: "Fri", current: 38, historical: 21 },
  { date: "Sat", current: 52, historical: 23 },
  { date: "Sun", current: 48, historical: 20 },
]

// AI Recommendation
const aiRecommendation = {
  level: "high", // low, medium, high
  confidence: 87,
  recommendation: "SUSPEND",
  reason: "Current rainfall (32mm) and wind speed (45 km/h) exceed safe thresholds. Historical data shows 89% of similar conditions resulted in class suspensions in Olongapo City.",
  affectedLevels: ["Pre-school", "Elementary", "High School"],
  factors: [
    { name: "Rainfall Intensity", value: "High", impact: "critical" },
    { name: "Wind Speed", value: "Moderate-High", impact: "warning" },
    { name: "Flood Risk", value: "Elevated", impact: "warning" },
    { name: "Visibility", value: "Poor", impact: "warning" },
  ],
}

export default function DashboardPage() {
  const getRecommendationColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/20 border-destructive/40 text-destructive"
      case "medium":
        return "bg-warning/20 border-warning/40 text-warning"
      default:
        return "bg-success/20 border-success/40 text-success"
    }
  }

  const recommendationTone =
    aiRecommendation.level === "high"
      ? {
          shell:
            "border-destructive/30 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--destructive)_18%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_88%,var(--destructive)_12%),var(--card))]",
          iconWrap: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20",
          eyebrow: "text-destructive",
          pulse: "bg-destructive/12 text-destructive ring-1 ring-destructive/20",
          cta: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        }
      : aiRecommendation.level === "medium"
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

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">Critical</Badge>
      case "warning":
        return <Badge className="bg-warning text-warning-foreground text-xs">Warning</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Normal</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendation Centerpiece */}
      <Card className={`overflow-hidden border-2 ${recommendationTone.shell}`}>
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="flex flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-12 lg:items-start lg:px-12 lg:text-left">
              <div className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl ${recommendationTone.iconWrap}`}>
                <AlertTriangle className="h-8 w-8" />
              </div>
              <p className={`text-sm font-semibold tracking-[0.24em] uppercase ${recommendationTone.eyebrow}`}>
                AI Suspension Recommendation
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {aiRecommendation.recommendation}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {aiRecommendation.reason}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Badge className={`border-0 px-3 py-1 text-sm ${recommendationTone.pulse}`}>
                  {aiRecommendation.confidence}% confidence
                </Badge>
                <Badge variant="outline" className="border-border/70 px-3 py-1 text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {currentWeather.location}
                </Badge>
                <Badge variant="outline" className={`px-3 py-1 text-sm ${getRecommendationColor(aiRecommendation.level)}`}>
                  Risk Level: {aiRecommendation.level}
                </Badge>
              </div>

              <div className="mt-8 w-full max-w-3xl rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                  Affected School Levels
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {aiRecommendation.affectedLevels.map((level) => (
                    <div
                      key={level}
                      className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-4 text-center shadow-sm"
                    >
                      <p className="text-sm font-semibold tracking-wide text-destructive">
                        {level}
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
                    Live Conditions
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rainfall</p>
                      <p className="text-2xl font-semibold text-foreground">{currentWeather.rainfall}mm</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="text-2xl font-semibold text-foreground">{currentWeather.windSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-xl font-semibold text-foreground">{currentWeather.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p className="text-xl font-semibold text-foreground">{currentWeather.lastUpdated}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
                  <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                    Highest Risk Drivers
                  </p>
                  <div className="mt-4 space-y-3">
                    {aiRecommendation.factors.slice(0, 3).map((factor) => (
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

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold text-foreground">{currentWeather.temperature}°C</p>
              </div>
              <div className="p-3 bg-chart-3/20 rounded-lg">
                <Thermometer className="h-5 w-5 text-chart-3" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-chart-3" />
              +2°C from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rainfall</p>
                <p className="text-2xl font-bold text-foreground">{currentWeather.rainfall}mm</p>
              </div>
              <div className="p-3 bg-chart-2/20 rounded-lg">
                <CloudRain className="h-5 w-5 text-chart-2" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-destructive">
              <TrendingUp className="h-3 w-3 mr-1" />
              Above threshold (25mm)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="text-2xl font-bold text-foreground">{currentWeather.windSpeed} km/h</p>
              </div>
              <div className="p-3 bg-chart-5/20 rounded-lg">
                <Wind className="h-5 w-5 text-chart-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-warning">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Moderate-High
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold text-foreground">{currentWeather.humidity}%</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-lg">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1" />
              -5% from morning
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall Forecast */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Rainfall Forecast</CardTitle>
                <CardDescription className="text-muted-foreground">24-hour prediction</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.15 200)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.6 0.15 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                  <XAxis dataKey="time" stroke="oklch(0.65 0 0)" fontSize={12} />
                  <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.01 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rainfall"
                    stroke="oklch(0.6 0.15 200)"
                    strokeWidth={2}
                    fill="url(#rainfallGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Historical Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Historical Comparison</CardTitle>
                <CardDescription className="text-muted-foreground">Current vs. 5-year average</CardDescription>
              </div>
              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                This Week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                  <XAxis dataKey="date" stroke="oklch(0.65 0 0)" fontSize={12} />
                  <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.01 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                  />
                  <Bar dataKey="historical" fill="oklch(0.28 0.01 260)" radius={[4, 4, 0, 0]} name="Historical Avg" />
                  <Bar dataKey="current" fill="oklch(0.65 0.2 145)" radius={[4, 4, 0, 0]} name="Current" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Factors */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Risk Assessment Factors</CardTitle>
            <CardDescription className="text-muted-foreground">
              Factors contributing to the AI recommendation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiRecommendation.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{factor.name}</p>
                    <p className="text-sm text-muted-foreground">{factor.value}</p>
                  </div>
                  {getImpactBadge(factor.impact)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">System updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Weather data updated", time: "5 mins ago", icon: RefreshCw },
                { action: "AI model recalculated", time: "10 mins ago", icon: TrendingUp },
                { action: "PAGASA signal raised", time: "1 hour ago", icon: AlertTriangle },
                { action: "Admin login detected", time: "2 hours ago", icon: CheckCircle },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
