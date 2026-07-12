import type { SuspensionRecord } from "@/lib/handa-api"

export type MonthlyCount = { month: string; suspensions: number }

// Groups real historical suspension records by calendar month for trend
// charts. The history endpoint only contains days suspensions actually
// happened (see suspension_model.py docstring), so this counts occurrences —
// it is not a suspension rate against total school days.
export function suspensionsByMonth(records: SuspensionRecord[]): MonthlyCount[] {
  const counts = new Map<string, number>()

  for (const record of records) {
    const key = record.date.slice(0, 7) // "YYYY-MM"
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, suspensions]) => {
      const [year, month] = key.split("-")
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      })
      return { month: label, suspensions }
    })
}
