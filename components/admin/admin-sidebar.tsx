"use client"

import { BarChart3, BookOpen, MessageSquare, Users, Settings, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const menuItems = [
    { icon: BarChart3, label: "Dashboard", id: "dashboard" },
    { icon: BookOpen, label: "Questões", id: "questions" },
    { icon: MessageSquare, label: "Feedbacks", id: "feedbacks" },
    { icon: Users, label: "Usuários", id: "users" },
    { icon: Settings, label: "Configurações", id: "settings" },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">TI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Admin Panel</h1>
            <p className="text-xs text-sidebar-foreground/60">TechInterview</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={`w-full justify-start ${
                activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="p-6 mt-auto">
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/")}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Home className="h-4 w-4 mr-3" />
          Voltar ao Site
        </Button>
      </div>
    </aside>
  )
}
