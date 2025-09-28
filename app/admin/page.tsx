"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminStats } from "@/components/admin/admin-stats"
import { QuestionsTable } from "@/components/admin/questions-table"
import { FeedbackManagement } from "@/components/admin/feedback-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/auth-modal"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  // Check if user is admin (in a real app, this would be a proper role check)
  const isAdmin = user?.email === "admin@techinterview.com"

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true)
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar o painel administrativo.
            </p>
            <Button onClick={() => setShowAuthModal(true)} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>Você não tem permissão para acessar o painel administrativo.</AlertDescription>
            </Alert>
            <Button onClick={() => (window.location.href = "/")} className="w-full mt-4">
              Voltar ao Site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-balance mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Visão geral da plataforma TechInterview</p>
            </div>
            <AdminStats />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Nova questão submetida</span>
                      <span className="text-muted-foreground">2h atrás</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Feedback pendente</span>
                      <span className="text-muted-foreground">4h atrás</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Usuário registrado</span>
                      <span className="text-muted-foreground">6h atrás</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Questões por categoria</span>
                      <span className="text-muted-foreground">Algoritmos: 3</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Empresas mais populares</span>
                      <span className="text-muted-foreground">Meta, Itaú</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Taxa de aprovação</span>
                      <span className="text-muted-foreground">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "questions":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-balance mb-2">Gerenciar Questões</h2>
              <p className="text-muted-foreground">Aprovar, editar e organizar questões da plataforma</p>
            </div>
            <QuestionsTable />
          </div>
        )
      case "feedbacks":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-balance mb-2">Gerenciar Feedbacks</h2>
              <p className="text-muted-foreground">Revisar e responder feedbacks da comunidade</p>
            </div>
            <FeedbackManagement />
          </div>
        )
      case "users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-balance mb-2">Gerenciar Usuários</h2>
              <p className="text-muted-foreground">Administrar contas de usuários e permissões</p>
            </div>
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
              </CardContent>
            </Card>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-balance mb-2">Configurações</h2>
              <p className="text-muted-foreground">Configurações gerais da plataforma</p>
            </div>
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  )
}
