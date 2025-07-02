import { create } from "zustand"
import { apiService } from "@/lib/api-service"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "viewer"
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "admin" | "viewer") => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await apiService.login(email, password)
    set({ user: response.user })
  },

  register: async (name: string, email: string, password: string, role: "admin" | "viewer") => {
    const response = await apiService.register(name, email, password, role)
    set({ user: response.user })
  },

  logout: () => {
    apiService.logout()
    set({ user: null })
  },

  checkAuth: () => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        set({ user, isLoading: false })
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        set({ user: null, isLoading: false })
      }
    } else {
      set({ user: null, isLoading: false })
    }
  },
}))
