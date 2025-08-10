"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsChart } from "@/components/dashboard/metrics-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { MetricCard } from "@/components/dashboard/metric-card"
import { apiService } from "@/lib/api-service"
import { Cpu, HardDrive, MemoryStick, Network } from "lucide-react"

interface Metrics {
  cpu: number
  memory: number
  disk: number
  network: number
}

interface Activity {
  id: string
  type: "info" | "warning" | "error"
  message: string
  timestamp: string
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, activitiesData] = await Promise.all([apiService.getMetrics(), apiService.getActivities()])
        setMetrics(metricsData)
        setActivities(activitiesData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {/* <p className="text-muted-foreground">Monitor your infrastructure metrics and system health</p> */}
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="CPU Usage" value={metrics.cpu} unit="%" icon={Cpu} color="blue" isLoading={isLoading} />
        <MetricCard
          title="Memory"
          value={metrics.memory}
          unit="%"
          icon={MemoryStick}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          title="Disk Usage"
          value={metrics.disk}
          unit="%"
          icon={HardDrive}
          color="yellow"
          isLoading={isLoading}
        />
        <MetricCard
          title="Network"
          value={metrics.network}
          unit=" MB/s"
          icon={Network}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            {/* <CardDescription>Real-time monitoring of system resources</CardDescription> */}
          </CardHeader>
          <CardContent className="pl-2">
            <MetricsChart metrics={metrics} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
