"use client"

import { Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockQuestions } from "@/lib/mock-data"
import { useFeedback } from "@/lib/feedback"

export function AdminStats() {
  const { feedbacks } = useFeedback()

  const stats = [
    {
      title: "Total de Questões",
      value: mockQuestions.length,
      description: `${mockQuestions.filter((q) => q.approved).length} aprovadas`,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      title: "Feedbacks Pendentes",
      value: feedbacks.filter((f) => f.status === "pending").length,
      description: "Aguardando revisão",
      icon: MessageSquare,
      color: "text-yellow-400",
    },
    {
      title: "Usuários Ativos",
      value: 127,
      description: "+12% este mês",
      icon: Users,
      color: "text-green-400",
    },
    {
      title: "Taxa de Aprovação",
      value: "94%",
      description: "Questões aprovadas",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
