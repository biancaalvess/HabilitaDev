"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@techinterview.com",
    password: "admin123",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "developer",
    email: "dev@example.com",
    password: "dev123",
    created_at: "2024-01-02T00:00:00Z",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("techinterview_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("techinterview_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("techinterview_user", JSON.stringify(userWithoutPassword))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email || u.username === username)
    if (existingUser) {
      setLoading(false)
      return false
    }

    // Create new user
    const newUser: User = {
      id: mockUsers.length + 1,
      username,
      email,
      created_at: new Date().toISOString(),
    }

    mockUsers.push({ ...newUser, password })
    setUser(newUser)
    localStorage.setItem("techinterview_user", JSON.stringify(newUser))
    setLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("techinterview_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
