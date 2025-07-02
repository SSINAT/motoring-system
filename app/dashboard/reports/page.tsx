"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api-service"
import { Download, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth-store"

interface ExportJob {
  id: string
  type: "metrics" | "logs"
  format: "csv" | "pdf"
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
  downloadUrl?: string
}

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: "1",
      type: "metrics",
      format: "csv",
      status: "completed",
      createdAt: "2024-01-15T10:30:00Z",
      downloadUrl: "/api/exports/1/download",
    },
    {
      id: "2",
      type: "logs",
      format: "pdf",
      status: "processing",
      createdAt: "2024-01-15T10:25:00Z",
    },
  ])

  // Metrics Export Form
  const [metricsTimeRange, setMetricsTimeRange] = useState("24h")
  const [metricsFormat, setMetricsFormat] = useState<"csv" | "pdf">("csv")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["cpu", "memory"])

  // Logs Export Form
  const [logsTimeRange, setLogsTimeRange] = useState("24h")
  const [logsFormat, setLogsFormat] = useState<"csv" | "pdf">("csv")
  const [logsLevel, setLogsLevel] = useState("all")
  const [logsService, setLogsService] = useState("all")

  const { toast } = useToast()

  // Check if user has admin access
  if (user?.role !== "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Export system data and logs for analysis</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground text-center">
              You need admin privileges to access the reports section.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleMetricsExport = async () => {
    setIsExporting(true)
    try {
      const exportJob = await apiService.exportMetrics({
        timeRange: metricsTimeRange,
        format: metricsFormat,
        metrics: selectedMetrics,
      })

      setExportJobs([exportJob, ...exportJobs])
      toast({
        title: "Export Started",
        description: "Your metrics export has been queued for processing.",
      })
    } catch (error) {
      console.error("Failed to export metrics:", error)
      toast({
        title: "Export Failed",
        description: "Failed to start metrics export.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleLogsExport = async () => {
    setIsExporting(true)
    try {
      const exportJob = await apiService.exportLogs({
        timeRange: logsTimeRange,
        format: logsFormat,
        level: logsLevel === "all" ? undefined : logsLevel,
        service: logsService === "all" ? undefined : logsService,
      })

      setExportJobs([exportJob, ...exportJobs])
      toast({
        title: "Export Started",
        description: "Your logs export has been queued for processing.",
      })
    } catch (error) {
      console.error("Failed to export logs:", error)
      toast({
        title: "Export Failed",
        description: "Failed to start logs export.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = async (job: ExportJob) => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, "_blank")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "pending":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Export system data and logs for analysis</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Metrics Export */}
        <Card>
          <CardHeader>
            <CardTitle>Export Metrics</CardTitle>
            <CardDescription>Export Prometheus metrics data for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={metricsTimeRange} onValueChange={setMetricsTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Metrics</label>
              <div className="space-y-2">
                {["cpu", "memory", "disk", "network"].map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric}
                      checked={selectedMetrics.includes(metric)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMetrics([...selectedMetrics, metric])
                        } else {
                          setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
                        }
                      }}
                    />
                    <label htmlFor={metric} className="text-sm capitalize">
                      {metric} Usage
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={metricsFormat} onValueChange={(value: "csv" | "pdf") => setMetricsFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleMetricsExport}
              disabled={isExporting || selectedMetrics.length === 0}
              className="w-full"
            >
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Export Metrics
            </Button>
          </CardContent>
        </Card>

        {/* Logs Export */}
        <Card>
          <CardHeader>
            <CardTitle>Export Logs</CardTitle>
            <CardDescription>Export application logs from Elasticsearch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={logsTimeRange} onValueChange={setLogsTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Log Level</label>
              <Select value={logsLevel} onValueChange={setLogsLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Select value={logsService} onValueChange={setLogsService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={logsFormat} onValueChange={(value: "csv" | "pdf") => setLogsFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleLogsExport} disabled={isExporting} className="w-full">
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Export Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Track your recent export jobs and download completed reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No export jobs found</div>
            ) : (
              exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium capitalize">{job.type} Export</p>
                      <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                      <span className="text-sm text-muted-foreground">{job.format.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Created: {new Date(job.createdAt).toLocaleString()}</p>
                  </div>

                  {job.status === "completed" && job.downloadUrl && (
                    <Button variant="outline" size="sm" onClick={() => handleDownload(job)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
