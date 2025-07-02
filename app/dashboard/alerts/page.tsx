"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api-service"
import { AlertTriangle, CheckCircle, RefreshCw, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AlertItem {
  id: string
  title: string
  description: string
  severity: "info" | "warning" | "critical"
  service: string
  timestamp: string
  status: "active" | "resolved"
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchAlerts = async () => {
    try {
      const data = await apiService.getAlerts()
      setAlerts(data)
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAlerts()
  }

  const handleDismissAlert = async (alertId: string) => {
    try {
      await apiService.dismissAlert(alertId)
      setAlerts(alerts.filter((alert) => alert.id !== alertId))
      toast({
        title: "Success",
        description: "Alert dismissed successfully",
      })
    } catch (error) {
      console.error("Failed to dismiss alert:", error)
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "secondary"
      default:
        return "default"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts from Alertmanager</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {activeAlerts.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground text-center">
              No active alerts at this time. Your systems are running smoothly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <Badge variant={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDismissAlert(alert.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">{alert.description}</CardDescription>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Service: {alert.service}</span>
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
