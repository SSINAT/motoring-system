import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const apiService = {
  // Authentication
  async login(email: string, password: string) {
    // Mock implementation - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "admin@example.com" && password === "password123") {
      const token = "mock-jwt-token-admin"
      const user = { id: "1", name: "Admin User", email, role: "admin" as const }
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      return { token, user }
    } else if (email === "viewer@example.com" && password === "password123") {
      const token = "mock-jwt-token-viewer"
      const user = { id: "2", name: "Viewer User", email, role: "viewer" as const }
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      return { token, user }
    } else {
      throw new Error("Invalid credentials")
    }
  },

  async register(name: string, email: string, password: string, role: "admin" | "viewer") {
    // Mock implementation - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const token = `mock-jwt-token-${role}`
    const user = { id: Date.now().toString(), name, email, role }
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    return { token, user }
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  // Dashboard
  async getMetrics() {
    // Mock Prometheus metrics
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 50),
    }
  },

  async getActivities() {
    // Mock activity data
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [
      {
        id: "1",
        type: "info" as const,
        message: "System backup completed successfully",
        timestamp: "2 minutes ago",
      },
      {
        id: "2",
        type: "warning" as const,
        message: "High memory usage detected on server-01",
        timestamp: "15 minutes ago",
      },
      {
        id: "3",
        type: "info" as const,
        message: "New user registered: john.doe@example.com",
        timestamp: "1 hour ago",
      },
      {
        id: "4",
        type: "error" as const,
        message: "Database connection timeout",
        timestamp: "2 hours ago",
      },
    ]
  },

  // Alerts
  async getAlerts() {
    // Mock Alertmanager alerts
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [
      {
        id: "1",
        title: "High CPU Usage",
        description: "CPU usage has exceeded 80% for the last 10 minutes on server-01",
        severity: "warning" as const,
        service: "server-01",
        timestamp: "2024-01-15T10:25:00Z",
        status: "active" as const,
      },
      {
        id: "2",
        title: "Database Connection Failed",
        description: "Unable to establish connection to primary database",
        severity: "critical" as const,
        service: "database",
        timestamp: "2024-01-15T10:20:00Z",
        status: "active" as const,
      },
      {
        id: "3",
        title: "Disk Space Low",
        description: "Available disk space is below 15% on /var/log partition",
        severity: "warning" as const,
        service: "server-02",
        timestamp: "2024-01-15T10:15:00Z",
        status: "active" as const,
      },
    ]
  },

  async dismissAlert(alertId: string) {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },

  // Logs
  async getLogs(filters: {
    timeRange?: string
    level?: string
    service?: string
    search?: string
  }) {
    // Mock Elasticsearch logs
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockLogs = [
      {
        id: "1",
        timestamp: "2024-01-15T10:30:25Z",
        level: "info" as const,
        service: "api",
        message: "User authentication successful for user@example.com",
        source: "auth-service",
      },
      {
        id: "2",
        timestamp: "2024-01-15T10:29:18Z",
        level: "warning" as const,
        service: "database",
        message: "Connection pool nearly exhausted (95% utilization)",
        source: "db-pool-manager",
      },
      {
        id: "3",
        timestamp: "2024-01-15T10:28:45Z",
        level: "error" as const,
        service: "frontend",
        message: "Failed to load user preferences: timeout after 5000ms",
        source: "preferences-service",
      },
      {
        id: "4",
        timestamp: "2024-01-15T10:27:32Z",
        level: "info" as const,
        service: "api",
        message: "Cache invalidation completed for user sessions",
        source: "cache-manager",
      },
      {
        id: "5",
        timestamp: "2024-01-15T10:26:15Z",
        level: "info" as const,
        service: "database",
        message: "Scheduled backup started for production database",
        source: "backup-service",
      },
      {
        id: "6",
        timestamp: "2024-01-15T10:25:08Z",
        level: "warning" as const,
        service: "api",
        message: "Rate limit exceeded for IP 192.168.1.100",
        source: "rate-limiter",
      },
      {
        id: "7",
        timestamp: "2024-01-15T10:24:22Z",
        level: "error" as const,
        service: "database",
        message: "Query timeout on table user_sessions after 30s",
        source: "query-executor",
      },
      {
        id: "8",
        timestamp: "2024-01-15T10:23:45Z",
        level: "info" as const,
        service: "frontend",
        message: "Static assets cache refreshed successfully",
        source: "asset-manager",
      },
    ]

    // Apply filters
    let filteredLogs = mockLogs

    if (filters.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level)
    }

    if (filters.service) {
      filteredLogs = filteredLogs.filter((log) => log.service === filters.service)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm) ||
          log.service.toLowerCase().includes(searchTerm) ||
          log.source.toLowerCase().includes(searchTerm),
      )
    }

    return filteredLogs
  },

  // Reports
  async exportMetrics(options: {
    timeRange: string
    format: "csv" | "pdf"
    metrics: string[]
  }) {
    // Mock export job creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: Date.now().toString(),
      type: "metrics" as const,
      format: options.format,
      status: "processing" as const,
      createdAt: new Date().toISOString(),
    }
  },

  async exportLogs(options: {
    timeRange: string
    format: "csv" | "pdf"
    level?: string
    service?: string
  }) {
    // Mock export job creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: Date.now().toString(),
      type: "logs" as const,
      format: options.format,
      status: "processing" as const,
      createdAt: new Date().toISOString(),
    }
  },
}
