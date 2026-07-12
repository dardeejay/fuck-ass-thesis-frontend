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
import { Search, Filter, Download, Calendar, CloudRain, CheckCircle, Eye } from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import type { SuspensionRecord } from "@/lib/handa-api"
import { suspensionsByMonth } from "@/lib/suspension-aggregates"

type LevelFilter = "all" | "preSchool" | "elementary" | "highSchool" | "college"

const LEVEL_FILTERS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "preSchool", label: "Pre-school" },
  { value: "elementary", label: "Elementary" },
  { value: "highSchool", label: "High School" },
  { value: "college", label: "College" },
]

function affectedLevelsLabel(record: SuspensionRecord): string {
  if (record.preSchool === null) return "Not specified"
  const levels = [
    record.preSchool && "Pre-school",
    record.elementary && "Elementary",
    record.highSchool && "High School",
    record.college && "College",
  ].filter(Boolean)
  return levels.length > 0 ? levels.join(", ") : "None"
}

export default function HistoricalClient({ records }: { records: SuspensionRecord[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<LevelFilter>("all")

  const filteredRecords = records.filter((record) => {
    const haystack = `${record.date} ${record.rainfallLevel ?? ""} ${record.forecastRisk ?? ""}`.toLowerCase()
    const matchesSearch = haystack.includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || record[filterLevel] === true
    return matchesSearch && matchesLevel
  })

  const rainfallLevelCounts = new Map<string, number>()
  for (const r of records) {
    const key = r.rainfallLevel ?? "Unspecified"
    rainfallLevelCounts.set(key, (rainfallLevelCounts.get(key) ?? 0) + 1)
  }
  const mostCommonTrigger =
    [...rainfallLevelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"

  const stats = {
    totalRecords: records.length,
    withLevelBreakdown: records.filter((r) => r.preSchool !== null).length,
    mostCommonTrigger,
    latestDate: records[0]?.date ?? "N/A",
  }

  const trendData = suspensionsByMonth(records)

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
                <p className="text-sm text-muted-foreground">Most Recent</p>
                <p className="text-2xl font-bold text-foreground">{stats.latestDate}</p>
              </div>
              <div className="p-3 bg-destructive/20 rounded-lg">
                <CloudRain className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Level Breakdown</p>
                <p className="text-2xl font-bold text-foreground">{stats.withLevelBreakdown}</p>
              </div>
              <div className="p-3 bg-success/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Most Common Trigger</p>
              <p className="text-lg font-bold text-foreground truncate" title={stats.mostCommonTrigger}>
                {stats.mostCommonTrigger}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Suspension Trends</CardTitle>
          <CardDescription className="text-muted-foreground">
            Scraped suspension announcements by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} allowDecimals={false} />
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
                Suspension announcements scraped from the mayor&apos;s Facebook page. This list only
                contains days a suspension was actually declared.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date, rainfall level, or risk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input border-border text-foreground"
              />
            </div>
            <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as LevelFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-input border-border text-foreground">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {LEVEL_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Rainfall Level</TableHead>
                  <TableHead className="text-muted-foreground">Forecast Risk</TableHead>
                  <TableHead className="text-muted-foreground">Levels Affected</TableHead>
                  <TableHead className="text-muted-foreground text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.date} className="border-border hover:bg-secondary/30">
                    <TableCell className="font-medium text-foreground">{record.date}</TableCell>
                    <TableCell className="text-foreground">{record.rainfallLevel ?? "—"}</TableCell>
                    <TableCell className="text-foreground">{record.forecastRisk ?? "—"}</TableCell>
                    <TableCell className="text-foreground text-xs">{affectedLevelsLabel(record)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                                <p className="text-sm text-muted-foreground">Levels Affected</p>
                                <p className="font-medium text-foreground">{affectedLevelsLabel(record)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Rainfall Level</p>
                                <p className="font-medium text-foreground">{record.rainfallLevel ?? "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Forecast Risk</p>
                                <p className="font-medium text-foreground">{record.forecastRisk ?? "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Time Risk</p>
                                <p className="font-medium text-foreground">{record.timeRisk ?? "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Suspended</p>
                                <p className="font-medium text-foreground">{record.suspended ? "Yes" : "No"}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredRecords.length} of {records.length} records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
