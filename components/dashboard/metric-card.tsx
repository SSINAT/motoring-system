import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: number
  unit: string
  icon: LucideIcon
  color: "blue" | "green" | "yellow" | "purple"
  isLoading?: boolean
}

export function MetricCard({ title, value, unit, icon: Icon, color, isLoading }: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? "..." : `${value}${unit}`}</div>
        <p className="text-xs text-muted-foreground">Real-time monitoring</p>
      </CardContent>
    </Card>
  )
}
