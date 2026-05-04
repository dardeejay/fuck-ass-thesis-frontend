"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CloudRain,
  CheckCircle,
  XCircle,
} from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

// Mock historical data for Olongapo City (city-wide suspensions)
const historicalRecords = [
  {
    id: 1,
    date: "2024-01-15",
    rainfall: 45,
    windSpeed: 65,
    suspended: true,
    levels: "All Levels",
    aiRecommendation: "SUSPEND",
    aiConfidence: 92,
    actualOutcome: "Flooding in low-lying areas",
  },
  {
    id: 2,
    date: "2024-01-10",
    rainfall: 18,
    windSpeed: 25,
    suspended: false,
    levels: "None",
    aiRecommendation: "NO SUSPEND",
    aiConfidence: 88,
    actualOutcome: "Normal operations",
  },
  {
    id: 3,
    date: "2024-01-05",
    rainfall: 52,
    windSpeed: 80,
    suspended: true,
    levels: "All Levels",
    aiRecommendation: "SUSPEND",
    aiConfidence: 95,
    actualOutcome: "Typhoon warning issued",
  },
  {
    id: 4,
    date: "2023-12-28",
    rainfall: 30,
    windSpeed: 40,
    suspended: true,
    levels: "Pre-school, Elementary",
    aiRecommendation: "SUSPEND",
    aiConfidence: 78,
    actualOutcome: "Moderate flooding",
  },
  {
    id: 5,
    date: "2023-12-20",
    rainfall: 12,
    windSpeed: 20,
    suspended: false,
    levels: "None",
    aiRecommendation: "NO SUSPEND",
    aiConfidence: 91,
    actualOutcome: "Light rain, normal day",
  },
  {
    id: 6,
    date: "2023-12-15",
    rainfall: 38,
    windSpeed: 55,
    suspended: true,
    levels: "All Levels",
    aiRecommendation: "SUSPEND",
    aiConfidence: 85,
    actualOutcome: "Heavy rain, localized flooding",
  },
  {
    id: 7,
    date: "2023-12-10",
    rainfall: 22,
    windSpeed: 35,
    suspended: false,
    levels: "None",
    aiRecommendation: "NO SUSPEND",
    aiConfidence: 72,
    actualOutcome: "Intermittent rain",
  },
  {
    id: 8,
    date: "2023-12-05",
    rainfall: 60,
    windSpeed: 90,
    suspended: true,
    levels: "All Levels",
    aiRecommendation: "SUSPEND",
    aiConfidence: 98,
    actualOutcome: "Severe weather, multiple incidents",
  },
]

// Trend data for the chart
const trendData = [
  { month: "Jul", suspensions: 2, avgRainfall: 28 },
  { month: "Aug", suspensions: 4, avgRainfall: 42 },
  { month: "Sep", suspensions: 6, avgRainfall: 55 },
  { month: "Oct", suspensions: 5, avgRainfall: 48 },
  { month: "Nov", suspensions: 3, avgRainfall: 35 },
  { month: "Dec", suspensions: 4, avgRainfall: 38 },
  { month: "Jan", suspensions: 3, avgRainfall: 32 },
]

export default function HistoricalDataPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSuspended, setFilterSuspended] = useState("all")
  const [filterLevels, setFilterLevels] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<typeof historicalRecords[0] | null>(null)

  const filteredRecords = historicalRecords.filter((record) => {
    const matchesSearch =
      record.date.includes(searchTerm) ||
      record.actualOutcome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.levels.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSuspended =
      filterSuspended === "all" ||
      (filterSuspended === "yes" && record.suspended) ||
      (filterSuspended === "no" && !record.suspended)
    const matchesLevels =
      filterLevels === "all" ||
      record.levels.includes(filterLevels)
    return matchesSearch && matchesSuspended && matchesLevels
  })

  const stats = {
    totalRecords: historicalRecords.length,
    suspensions: historicalRecords.filter((r) => r.suspended).length,
    avgAccuracy: Math.round(
      historicalRecords.reduce((sum, r) => sum + r.aiConfidence, 0) / historicalRecords.length
    ),
    avgRainfall: Math.round(
      historicalRecords.reduce((sum, r) => sum + r.rainfall, 0) / historicalRecords.length
    ),
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRecords}</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspensions</p>
                <p className="text-2xl font-bold text-foreground">{stats.suspensions}</p>
              </div>
              <div className="p-3 bg-destructive/20 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgAccuracy}%</p>
              </div>
              <div className="p-3 bg-success/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rainfall</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgRainfall}mm</p>
              </div>
              <div className="p-3 bg-chart-2/20 rounded-lg">
                <CloudRain className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Suspension Trends</CardTitle>
          <CardDescription className="text-muted-foreground">
            Monthly suspensions and average rainfall over the past 7 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.18 0.01 260)",
                    border: "1px solid oklch(0.28 0.01 260)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0 0)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="suspensions"
                  stroke="oklch(0.55 0.22 25)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.55 0.22 25)" }}
                  name="Suspensions"
                />
                <Line
                  type="monotone"
                  dataKey="avgRainfall"
                  stroke="oklch(0.6 0.15 200)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.6 0.15 200)" }}
                  name="Avg Rainfall (mm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Historical Records</CardTitle>
              <CardDescription className="text-muted-foreground">
                Weather and suspension data history
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border text-foreground">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input border-border text-foreground"
              />
            </div>
            <Select value={filterLevels} onValueChange={setFilterLevels}>
              <SelectTrigger className="w-full sm:w-[180px] bg-input border-border text-foreground">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Pre-school">Pre-school</SelectItem>
                <SelectItem value="Elementary">Elementary</SelectItem>
                <SelectItem value="High School">High School</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSuspended} onValueChange={setFilterSuspended}>
              <SelectTrigger className="w-full sm:w-[180px] bg-input border-border text-foreground">
                <SelectValue placeholder="Suspension" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="yes">Suspended</SelectItem>
                <SelectItem value="no">Not Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Rainfall</TableHead>
                  <TableHead className="text-muted-foreground">Wind</TableHead>
                  <TableHead className="text-muted-foreground">Levels</TableHead>
                  <TableHead className="text-muted-foreground">AI Rec.</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="border-border hover:bg-secondary/30">
                    <TableCell className="font-medium text-foreground">{record.date}</TableCell>
                    <TableCell className="text-foreground">{record.rainfall}mm</TableCell>
                    <TableCell className="text-foreground">{record.windSpeed} km/h</TableCell>
                    <TableCell className="text-foreground text-xs">{record.levels}</TableCell>
                    <TableCell>
                      <Badge
                        variant={record.aiRecommendation === "SUSPEND" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {record.aiRecommendation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.suspended ? (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge className="bg-success/20 text-success border-success/30 text-xs">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Record Details</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Full details for {record.date}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Date</p>
                                  <p className="font-medium text-foreground">{record.date}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Levels Suspended</p>
                                  <p className="font-medium text-foreground">{record.levels}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Rainfall</p>
                                  <p className="font-medium text-foreground">{record.rainfall}mm</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                                  <p className="font-medium text-foreground">{record.windSpeed} km/h</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">AI Recommendation</p>
                                  <p className="font-medium text-foreground">{record.aiRecommendation}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">AI Confidence</p>
                                  <p className="font-medium text-foreground">{record.aiConfidence}%</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Actual Outcome</p>
                                <p className="font-medium text-foreground">{record.actualOutcome}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination hint */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredRecords.length} of {historicalRecords.length} records</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="border-border">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="border-border">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
