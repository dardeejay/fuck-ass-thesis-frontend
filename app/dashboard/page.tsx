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
      {/* AI Recommendation Banner */}
      <Card className={`border-2 ${getRecommendationColor(aiRecommendation.level)}`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-foreground">
                    AI Recommendation: {aiRecommendation.recommendation}
                  </h2>
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                    {aiRecommendation.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {aiRecommendation.reason}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Olongapo City -</span>
                  {aiRecommendation.affectedLevels.map((level) => (
                    <Badge key={level} variant="secondary" className="text-xs">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-border">
                View Details
              </Button>
              <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Issue Suspension
              </Button>
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
