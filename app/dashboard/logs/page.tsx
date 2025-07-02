"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api-service"
import { Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  service: string
  message: string
  source: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("24h")
  const { toast } = useToast()

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.getLogs({
        timeRange,
        level: levelFilter === "all" ? undefined : levelFilter,
        service: serviceFilter === "all" ? undefined : serviceFilter,
        search: searchTerm || undefined,
      })
      setLogs(data)
      setFilteredLogs(data)
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchLogs()
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      case "info":
        return "secondary"
      case "debug":
        return "outline"
      default:
        return "secondary"
    }
  }

  const services = Array.from(new Set(logs.map((log) => log.service)))

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">Search and analyze logs from Elasticsearch</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter logs by time range, level, service, or search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
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
              <label className="text-sm font-medium">Level</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
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
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>{filteredLogs.length} entries found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No logs found matching your criteria</div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-shrink-0">
                      <Badge variant={getLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{log.service}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">Source: {log.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
