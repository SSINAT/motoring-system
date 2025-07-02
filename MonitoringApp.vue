<template>
  <div id="app">
    <!-- Login Page -->
    <div v-if="!isAuthenticated && currentRoute === 'login'" class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow" style="width: 400px;">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Login</h3>
          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="loginForm.email" type="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="loginForm.password" type="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
          <div class="text-center mt-3">
            <a href="#" @click="currentRoute = 'register'">Don't have an account? Register</a>
          </div>
          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Register Page -->
    <div v-if="!isAuthenticated && currentRoute === 'register'" class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow" style="width: 400px;">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Register</h3>
          <form @submit.prevent="register">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="registerForm.name" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="registerForm.email" type="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="registerForm.password" type="password" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Role</label>
              <select v-model="registerForm.role" class="form-select" required>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" class="btn btn-success w-100" :disabled="loading">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </form>
          <div class="text-center mt-3">
            <a href="#" @click="currentRoute = 'login'">Already have an account? Login</a>
          </div>
          <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Main Application Layout -->
    <div v-if="isAuthenticated" class="d-flex vh-100">
      <!-- Sidebar -->
      <nav class="bg-dark text-white" style="width: 250px;">
        <div class="p-3">
          <h4 class="mb-4">Monitoring Center</h4>
          <ul class="nav nav-pills flex-column">
            <li class="nav-item mb-2">
              <a href="#" @click="currentRoute = 'dashboard'" 
                 :class="['nav-link', currentRoute === 'dashboard' ? 'active' : 'text-white']">
                📊 Dashboard
              </a>
            </li>
            <li class="nav-item mb-2">
              <a href="#" @click="currentRoute = 'logs'" 
                 :class="['nav-link', currentRoute === 'logs' ? 'active' : 'text-white']">
                🪵 Logs
              </a>
            </li>
            <li class="nav-item mb-2">
              <a href="#" @click="currentRoute = 'alerts'" 
                 :class="['nav-link', currentRoute === 'alerts' ? 'active' : 'text-white']">
                🚨 Alerts
              </a>
            </li>
            <li class="nav-item mb-2" v-if="userRole === 'admin'">
              <a href="#" @click="currentRoute = 'reports'" 
                 :class="['nav-link', currentRoute === 'reports' ? 'active' : 'text-white']">
                📤 Reports
              </a>
            </li>
          </ul>
        </div>
        <div class="mt-auto p-3 border-top">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <small>{{ user.name }}</small><br>
              <small class="text-muted">{{ user.role }}</small>
            </div>
            <button @click="logout" class="btn btn-outline-light btn-sm">Logout</button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="flex-grow-1 d-flex flex-column">
        <!-- Top Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
          <div class="container-fluid">
            <span class="navbar-brand mb-0 h1">{{ getPageTitle() }}</span>
            <div class="navbar-nav ms-auto">
              <span class="nav-link">Welcome, {{ user.name }}</span>
            </div>
          </div>
        </nav>

        <!-- Page Content -->
        <main class="flex-grow-1 p-4 bg-light overflow-auto">
          <!-- Dashboard -->
          <div v-if="currentRoute === 'dashboard'">
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h5 class="card-title">CPU Usage</h5>
                    <h2 class="text-primary">{{ metrics.cpu }}%</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h5 class="card-title">Memory</h5>
                    <h2 class="text-success">{{ metrics.memory }}%</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h5 class="card-title">Disk Usage</h5>
                    <h2 class="text-warning">{{ metrics.disk }}%</h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h5 class="card-title">Network</h5>
                    <h2 class="text-info">{{ metrics.network }} MB/s</h2>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">System Metrics</h5>
                    <select v-model="selectedMetric" class="form-select" style="width: auto;">
                      <option value="cpu">CPU Usage</option>
                      <option value="memory">Memory Usage</option>
                      <option value="disk">Disk Usage</option>
                      <option value="network">Network Traffic</option>
                    </select>
                  </div>
                  <div class="card-body">
                    <canvas ref="metricsChart" width="400" height="200"></canvas>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Recent Activity</h5>
                  </div>
                  <div class="card-body">
                    <div v-for="activity in recentActivity" :key="activity.id" class="d-flex mb-3">
                      <div class="flex-shrink-0">
                        <span class="badge bg-primary rounded-pill">{{ activity.type }}</span>
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <small class="text-muted">{{ activity.timestamp }}</small>
                        <div>{{ activity.message }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Logs Viewer -->
          <div v-if="currentRoute === 'logs'">
            <div class="card">
              <div class="card-header">
                <div class="row">
                  <div class="col-md-6">
                    <input v-model="logSearch.keyword" @input="searchLogs" type="text" 
                           class="form-control" placeholder="Search logs...">
                  </div>
                  <div class="col-md-3">
                    <select v-model="logSearch.status" @change="searchLogs" class="form-select">
                      <option value="">All Status</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <select v-model="logSearch.timeRange" @change="searchLogs" class="form-select">
                      <option value="1h">Last Hour</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Service</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="log in filteredLogs" :key="log.id">
                        <td>{{ log.timestamp }}</td>
                        <td>
                          <span :class="getLogLevelClass(log.level)">{{ log.level }}</span>
                        </td>
                        <td>{{ log.service }}</td>
                        <td>{{ log.message }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <nav v-if="logs.length > 10">
                  <ul class="pagination justify-content-center">
                    <li class="page-item">
                      <a class="page-link" href="#" @click.prevent="currentPage--" 
                         :class="{ disabled: currentPage === 1 }">Previous</a>
                    </li>
                    <li class="page-item active">
                      <span class="page-link">{{ currentPage }}</span>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#" @click.prevent="currentPage++" 
                         :class="{ disabled: currentPage * 10 >= logs.length }">Next</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <!-- Alerts Feed -->
          <div v-if="currentRoute === 'alerts'">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4>Active Alerts</h4>
              <button @click="refreshAlerts" class="btn btn-outline-primary">
                🔄 Refresh
              </button>
            </div>
            
            <div v-if="alerts.length === 0" class="alert alert-success">
              <h5>🎉 All Clear!</h5>
              <p class="mb-0">No active alerts at this time.</p>
            </div>

            <div v-for="alert in alerts" :key="alert.id" 
                 :class="['alert', 'alert-dismissible', getAlertClass(alert.severity)]">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h6 class="alert-heading">{{ alert.title }}</h6>
                  <p class="mb-1">{{ alert.description }}</p>
                  <small class="text-muted">
                    Service: {{ alert.service }} | 
                    Started: {{ alert.timestamp }}
                  </small>
                </div>
                <button @click="dismissAlert(alert.id)" type="button" 
                        class="btn-close" aria-label="Close"></button>
              </div>
            </div>
          </div>

          <!-- Reports Page -->
          <div v-if="currentRoute === 'reports' && userRole === 'admin'">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Export System Metrics</h5>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="exportMetrics">
                      <div class="mb-3">
                        <label class="form-label">Time Range</label>
                        <select v-model="exportForm.timeRange" class="form-select">
                          <option value="1h">Last Hour</option>
                          <option value="24h">Last 24 Hours</option>
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Metrics</label>
                        <div class="form-check">
                          <input v-model="exportForm.metrics" class="form-check-input" 
                                 type="checkbox" value="cpu" id="cpu">
                          <label class="form-check-label" for="cpu">CPU Usage</label>
                        </div>
                        <div class="form-check">
                          <input v-model="exportForm.metrics" class="form-check-input" 
                                 type="checkbox" value="memory" id="memory">
                          <label class="form-check-label" for="memory">Memory Usage</label>
                        </div>
                        <div class="form-check">
                          <input v-model="exportForm.metrics" class="form-check-input" 
                                 type="checkbox" value="disk" id="disk">
                          <label class="form-check-label" for="disk">Disk Usage</label>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Format</label>
                        <select v-model="exportForm.format" class="form-select">
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                        </select>
                      </div>
                      <button type="submit" class="btn btn-primary" :disabled="loading">
                        {{ loading ? 'Exporting...' : 'Export Data' }}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Export Logs</h5>
                  </div>
                  <div class="card-body">
                    <form @submit.prevent="exportLogs">
                      <div class="mb-3">
                        <label class="form-label">Time Range</label>
                        <select v-model="logExportForm.timeRange" class="form-select">
                          <option value="1h">Last Hour</option>
                          <option value="24h">Last 24 Hours</option>
                          <option value="7d">Last 7 Days</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Log Level</label>
                        <select v-model="logExportForm.level" class="form-select">
                          <option value="">All Levels</option>
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Service</label>
                        <select v-model="logExportForm.service" class="form-select">
                          <option value="">All Services</option>
                          <option value="api">API</option>
                          <option value="database">Database</option>
                          <option value="frontend">Frontend</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Format</label>
                        <select v-model="logExportForm.format" class="form-select">
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                        </select>
                      </div>
                      <button type="submit" class="btn btn-success" :disabled="loading">
                        {{ loading ? 'Exporting...' : 'Export Logs' }}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div class="card mt-4">
              <div class="card-header">
                <h5 class="mb-0">Recent Exports</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Export Type</th>
                        <th>Format</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="export_ in recentExports" :key="export_.id">
                        <td>{{ export_.type }}</td>
                        <td>{{ export_.format.toUpperCase() }}</td>
                        <td>{{ export_.created }}</td>
                        <td>
                          <span :class="['badge', export_.status === 'completed' ? 'bg-success' : 'bg-warning']">
                            {{ export_.status }}
                          </span>
                        </td>
                        <td>
                          <button v-if="export_.status === 'completed'" 
                                  @click="downloadExport(export_.id)" 
                                  class="btn btn-sm btn-outline-primary">
                            Download
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'

// Authentication State
const isAuthenticated = ref(false)
const user = ref({})
const userRole = ref('')
const currentRoute = ref('login')

// Form States
const loginForm = reactive({
  email: 'admin@example.com',
  password: 'password123'
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'viewer'
})

// UI State
const loading = ref(false)
const error = ref('')

// Dashboard Data
const metrics = reactive({
  cpu: 45,
  memory: 67,
  disk: 23,
  network: 12.5
})

const selectedMetric = ref('cpu')
const metricsChart = ref(null)

const recentActivity = ref([
  { id: 1, type: 'INFO', timestamp: '2 min ago', message: 'System backup completed successfully' },
  { id: 2, type: 'WARN', timestamp: '15 min ago', message: 'High memory usage detected on server-01' },
  { id: 3, type: 'INFO', timestamp: '1 hour ago', message: 'New user registered: john.doe@example.com' },
  { id: 4, type: 'ERROR', timestamp: '2 hours ago', message: 'Database connection timeout' }
])

// Logs Data
const logs = ref([
  { id: 1, timestamp: '2024-01-15 10:30:25', level: 'info', service: 'api', message: 'User authentication successful' },
  { id: 2, timestamp: '2024-01-15 10:29:18', level: 'warning', service: 'database', message: 'Connection pool nearly exhausted' },
  { id: 3, timestamp: '2024-01-15 10:28:45', level: 'error', service: 'frontend', message: 'Failed to load user preferences' },
  { id: 4, timestamp: '2024-01-15 10:27:32', level: 'info', service: 'api', message: 'Cache invalidation completed' },
  { id: 5, timestamp: '2024-01-15 10:26:15', level: 'info', service: 'database', message: 'Scheduled backup started' },
  { id: 6, timestamp: '2024-01-15 10:25:08', level: 'warning', service: 'api', message: 'Rate limit exceeded for IP 192.168.1.100' },
  { id: 7, timestamp: '2024-01-15 10:24:22', level: 'error', service: 'database', message: 'Query timeout on table user_sessions' },
  { id: 8, timestamp: '2024-01-15 10:23:45', level: 'info', service: 'frontend', message: 'Static assets cache refreshed' }
])

const logSearch = reactive({
  keyword: '',
  status: '',
  timeRange: '24h'
})

const currentPage = ref(1)

// Alerts Data
const alerts = ref([
  {
    id: 1,
    title: 'High CPU Usage',
    description: 'CPU usage has exceeded 80% for the last 10 minutes on server-01',
    severity: 'warning',
    service: 'server-01',
    timestamp: '2024-01-15 10:25:00'
  },
  {
    id: 2,
    title: 'Database Connection Failed',
    description: 'Unable to establish connection to primary database',
    severity: 'critical',
    service: 'database',
    timestamp: '2024-01-15 10:20:00'
  },
  {
    id: 3,
    title: 'Disk Space Low',
    description: 'Available disk space is below 15% on /var/log partition',
    severity: 'warning',
    service: 'server-02',
    timestamp: '2024-01-15 10:15:00'
  }
])

// Export Forms
const exportForm = reactive({
  timeRange: '24h',
  metrics: ['cpu', 'memory'],
  format: 'csv'
})

const logExportForm = reactive({
  timeRange: '24h',
  level: '',
  service: '',
  format: 'csv'
})

const recentExports = ref([
  { id: 1, type: 'System Metrics', format: 'csv', created: '2024-01-15 09:30:00', status: 'completed' },
  { id: 2, type: 'Application Logs', format: 'pdf', created: '2024-01-15 08:45:00', status: 'completed' },
  { id: 3, type: 'System Metrics', format: 'pdf', created: '2024-01-15 08:00:00', status: 'processing' }
])

// Computed Properties
const filteredLogs = computed(() => {
  let filtered = logs.value

  if (logSearch.keyword) {
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(logSearch.keyword.toLowerCase()) ||
      log.service.toLowerCase().includes(logSearch.keyword.toLowerCase())
    )
  }

  if (logSearch.status) {
    filtered = filtered.filter(log => log.level === logSearch.status)
  }

  const startIndex = (currentPage.value - 1) * 10
  return filtered.slice(startIndex, startIndex + 10)
})

// API Service (Mock Implementation)
const apiService = {
  async login(credentials) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
      const token = 'mock-jwt-token-admin'
      const userData = { name: 'Admin User', email: credentials.email, role: 'admin' }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      return { token, user: userData }
    } else if (credentials.email === 'viewer@example.com' && credentials.password === 'password123') {
      const token = 'mock-jwt-token-viewer'
      const userData = { name: 'Viewer User', email: credentials.email, role: 'viewer' }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      return { token, user: userData }
    } else {
      throw new Error('Invalid credentials')
    }
  },

  async register(userData) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const token = 'mock-jwt-token-' + userData.role
    const user = { name: userData.name, email: userData.email, role: userData.role }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return { token, user }
  },

  async fetchMetrics() {
    // Mock Prometheus metrics
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      network: (Math.random() * 50).toFixed(1)
    }
  },

  async fetchLogs(filters) {
    // Mock Elasticsearch logs
    await new Promise(resolve => setTimeout(resolve, 300))
    return logs.value
  },

  async fetchAlerts() {
    // Mock Alertmanager alerts
    await new Promise(resolve => setTimeout(resolve, 300))
    return alerts.value
  },

  async exportData(type, options) {
    // Mock export functionality
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { success: true, downloadUrl: '/mock-export.csv' }
  }
}

// Methods
const login = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.login(loginForm)
    user.value = response.user
    userRole.value = response.user.role
    isAuthenticated.value = true
    currentRoute.value = 'dashboard'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const register = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.register(registerForm)
    user.value = response.user
    userRole.value = response.user.role
    isAuthenticated.value = true
    currentRoute.value = 'dashboard'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  user.value = {}
  userRole.value = ''
  currentRoute.value = 'login'
}

const checkAuth = () => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  
  if (token && userData) {
    user.value = JSON.parse(userData)
    userRole.value = user.value.role
    isAuthenticated.value = true
    currentRoute.value = 'dashboard'
  }
}

const getPageTitle = () => {
  const titles = {
    dashboard: 'Dashboard',
    logs: 'Logs Viewer',
    alerts: 'Alerts Feed',
    reports: 'Reports'
  }
  return titles[currentRoute.value] || 'Monitoring Center'
}

const searchLogs = () => {
  currentPage.value = 1
  // Trigger reactive update
}

const getLogLevelClass = (level) => {
  const classes = {
    info: 'badge bg-info',
    warning: 'badge bg-warning',
    error: 'badge bg-danger'
  }
  return classes[level] || 'badge bg-secondary'
}

const getAlertClass = (severity) => {
  const classes = {
    info: 'alert-info',
    warning: 'alert-warning',
    critical: 'alert-danger'
  }
  return classes[severity] || 'alert-secondary'
}

const dismissAlert = (alertId) => {
  alerts.value = alerts.value.filter(alert => alert.id !== alertId)
}

const refreshAlerts = async () => {
  try {
    const freshAlerts = await apiService.fetchAlerts()
    alerts.value = freshAlerts
  } catch (err) {
    console.error('Failed to refresh alerts:', err)
  }
}

const exportMetrics = async () => {
  loading.value = true
  try {
    await apiService.exportData('metrics', exportForm)
    alert('Metrics export started! Check the Recent Exports table.')
  } catch (err) {
    alert('Export failed: ' + err.message)
  } finally {
    loading.value = false
  }
}

const exportLogs = async () => {
  loading.value = true
  try {
    await apiService.exportData('logs', logExportForm)
    alert('Logs export started! Check the Recent Exports table.')
  } catch (err) {
    alert('Export failed: ' + err.message)
  } finally {
    loading.value = false
  }
}

const downloadExport = (exportId) => {
  // Mock download
  alert(`Downloading export ${exportId}...`)
}

const initChart = async () => {
  await nextTick()
  if (!metricsChart.value) return

  // Mock Chart.js implementation
  const ctx = metricsChart.value.getContext('2d')
  
  // Simple canvas drawing for demo
  ctx.clearRect(0, 0, 400, 200)
  ctx.strokeStyle = '#007bff'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const data = [30, 45, 35, 50, 40, 60, 45, 55, 50, 65]
  const width = 400
  const height = 200
  const stepX = width / (data.length - 1)
  
  data.forEach((value, index) => {
    const x = index * stepX
    const y = height - (value / 100) * height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

const updateMetrics = async () => {
  try {
    const newMetrics = await apiService.fetchMetrics()
    Object.assign(metrics, newMetrics)
  } catch (err) {
    console.error('Failed to update metrics:', err)
  }
}

// Watchers
watch(selectedMetric, () => {
  initChart()
})

watch(currentRoute, (newRoute) => {
  if (newRoute === 'dashboard') {
    nextTick(() => {
      initChart()
    })
  }
})

// Lifecycle
onMounted(() => {
  checkAuth()
  
  // Update metrics every 30 seconds
  setInterval(updateMetrics, 30000)
  
  // Initialize chart when dashboard loads
  if (currentRoute.value === 'dashboard') {
    nextTick(() => {
      initChart()
    })
  }
})
</script>

<style scoped>
.nav-link {
  cursor: pointer;
}

.table th {
  border-top: none;
}

.alert-dismissible .btn-close {
  position: static;
  margin-left: auto;
}

canvas {
  max-width: 100%;
  height: auto;
}

.sidebar {
  min-height: 100vh;
}

.form-check {
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.75em;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.navbar {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.bg-dark {
  background-color: #212529 !important;
}

.text-white {
  color: #fff !important;
}

.nav-pills .nav-link.active {
  background-color: #0d6efd;
}

.nav-pills .nav-link {
  color: rgba(255, 255, 255, 0.75);
}

.nav-pills .nav-link:hover {
  color: #fff;
}
</style>
