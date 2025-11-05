"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  pendingQuestions: number;
  approvedQuestions: number;
  totalFeedback: number;
  totalAnswers: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const approvalRate = stats.totalQuestions > 0
    ? Math.round((stats.approvedQuestions / stats.totalQuestions) * 100)
    : 0;

  const statsCards = [
    {
      title: "Total de Questões",
      value: stats.totalQuestions,
      description: `${stats.approvedQuestions} aprovadas`,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      title: "Feedbacks Pendentes",
      value: stats.totalFeedback,
      description: "Total de feedbacks",
      icon: MessageSquare,
      color: "text-yellow-400",
    },
    {
      title: "Usuários",
      value: stats.totalUsers,
      description: "Total de usuários",
      icon: Users,
      color: "text-green-400",
    },
    {
      title: "Taxa de Aprovação",
      value: `${approvalRate}%`,
      description: "Questões aprovadas",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
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
  );
}
