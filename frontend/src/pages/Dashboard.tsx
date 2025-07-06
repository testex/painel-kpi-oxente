import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout/Layout'
import { 
  BarChart3, TrendingUp, Users, Package, 
  Target, Clock, AlertTriangle, Settings 
} from 'lucide-react'
import { TemporalFilter } from '@/components/filters/TemporalFilter'
import { format } from 'date-fns'

import { DashboardService } from '@/lib/api'

interface DashboardData {
  receitaTotal: {
    valor: number
    variacao: number
    periodo: string
    formatado: string
  }
  clientesAtivos: {
    quantidade: number
    variacao: number
    novosEsteMes: number
    formatado: string
  }
  produtosVendidos: {
    quantidade: number
    variacao: number
    periodo: string
    formatado: string
  }
  taxaConversao: {
    percentual: number
    variacao: number
    periodo: string
    formatado: string
  }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })

  // Função para buscar dados do dashboard com filtro de datas
  async function fetchDashboardData(dateRangeParam?: { from: Date | undefined; to: Date | undefined }) {
    // Se não foi passado um range específico, usar o range atual
    const rangeToUse = dateRangeParam || dateRange
    
    setLoading(true)
    try {
      const service = new DashboardService()
      let params = ''
      if (rangeToUse.from && rangeToUse.to) {
        params = `?dataInicio=${format(rangeToUse.from, 'yyyy-MM-dd')}&dataFim=${format(rangeToUse.to, 'yyyy-MM-dd')}`
        console.log(`[Dashboard] Buscando dados do período: ${format(rangeToUse.from, 'dd/MM/yyyy')} até ${format(rangeToUse.to, 'dd/MM/yyyy')}`)
      }
      const response = await service.getDashboardAnalytics(params)
      setDashboardData(response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Erro ao carregar dados do dashboard')
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Inicializar com o período "mes-atual"
    const initialRange = getDateRangeFromPeriod('mes-atual')
    if (initialRange) {
      setDateRange(initialRange)
      fetchDashboardData(initialRange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handler para mudança de data
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    if (range.from && range.to) {
      fetchDashboardData(range)
    }
  }

  // Handler para mudança de período do TemporalFilter
  const handlePeriodChange = (period: string) => {
    console.log('Período selecionado:', period)
    const dateRange = getDateRangeFromPeriod(period)
    if (dateRange) {
      setDateRange(dateRange)
      fetchDashboardData(dateRange)
    }
  }

  // Função para converter período em intervalo de datas
  const getDateRangeFromPeriod = (period: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'esta-semana':
        // Esta semana: domingo (0) até hoje
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return { from: startOfWeek, to: today }
        
      case 'semana-passada':
        // Semana passada: domingo a sábado da semana anterior
        const lastWeekStart = new Date(today)
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7)
        const lastWeekEnd = new Date(lastWeekStart)
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
        return { from: lastWeekStart, to: lastWeekEnd }
        
      case 'ultimos-15-dias':
        // Últimos 15 dias: há 15 dias até hoje
        const fifteenDaysAgo = new Date(today)
        fifteenDaysAgo.setDate(today.getDate() - 15)
        return { from: fifteenDaysAgo, to: today }
        
      case 'mes-atual':
        // Mês atual: primeiro dia do mês até hoje
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        return { from: firstDay, to: today }
        
      case 'mes-passado':
        // Mês passado: primeiro ao último dia do mês anterior
        const lastMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthLast = new Date(now.getFullYear(), now.getMonth(), 0)
        return { from: lastMonthFirst, to: lastMonthLast }
        
      case 'ultimo-trimestre':
        // Último trimestre: 3 meses atrás até hoje
        const threeMonthsAgo = new Date(today)
        threeMonthsAgo.setMonth(today.getMonth() - 3)
        return { from: threeMonthsAgo, to: today }
        
      case '180-dias':
        // 180 dias: há 180 dias até hoje
        const sixMonthsAgo = new Date(today)
        sixMonthsAgo.setDate(today.getDate() - 180)
        return { from: sixMonthsAgo, to: today }
        
      case 'este-ano':
        // Este ano: primeiro dia do ano até hoje
        const yearStart = new Date(now.getFullYear(), 0, 1)
        return { from: yearStart, to: today }
        
      case 'ano-passado':
        // Ano passado: primeiro ao último dia do ano anterior
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31)
        return { from: lastYearStart, to: lastYearEnd }
        
      default:
        if (period.startsWith('custom:')) {
          const [, fromStr, toStr] = period.split(':')
          return { from: new Date(fromStr), to: new Date(toStr) }
        }
        return null
    }
  }

  const kpiCards = dashboardData ? [
    {
      title: "Receita Total",
      value: dashboardData.receitaTotal.formatado,
      change: `${dashboardData.receitaTotal.variacao >= 0 ? '+' : ''}${dashboardData.receitaTotal.variacao}%`,
      changeType: dashboardData.receitaTotal.variacao >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      description: `vs. ${dashboardData.receitaTotal.periodo}`
    },
    {
      title: "Clientes Ativos",
      value: dashboardData.clientesAtivos.formatado,
      change: `${dashboardData.clientesAtivos.variacao >= 0 ? '+' : ''}${dashboardData.clientesAtivos.variacao}%`,
      changeType: dashboardData.clientesAtivos.variacao >= 0 ? "positive" as const : "negative" as const,
      icon: Users,
      description: `${dashboardData.clientesAtivos.novosEsteMes} novos clientes este mês`
    },
    {
      title: "Produtos Vendidos",
      value: dashboardData.produtosVendidos.formatado,
      change: `${dashboardData.produtosVendidos.variacao >= 0 ? '+' : ''}${dashboardData.produtosVendidos.variacao}%`,
      changeType: dashboardData.produtosVendidos.variacao >= 0 ? "positive" as const : "negative" as const,
      icon: Package,
      description: `vs. ${dashboardData.produtosVendidos.periodo}`
    },
    {
      title: "Taxa de Conversão",
      value: dashboardData.taxaConversao.formatado,
      change: `${dashboardData.taxaConversao.variacao >= 0 ? '+' : ''}${dashboardData.taxaConversao.variacao}%`,
      changeType: dashboardData.taxaConversao.variacao >= 0 ? "positive" as const : "negative" as const,
      icon: Target,
      description: `média do ${dashboardData.taxaConversao.periodo}`
    }
  ] : [
    {
      title: "Receita Total",
      value: "R$ 0,00",
      change: "0%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Carregando..."
    },
    {
      title: "Clientes Ativos",
      value: "0",
      change: "0%",
      changeType: "positive" as const,
      icon: Users,
      description: "Carregando..."
    },
    {
      title: "Produtos Vendidos",
      value: "0",
      change: "0%",
      changeType: "positive" as const,
      icon: Package,
      description: "Carregando..."
    },
    {
      title: "Taxa de Conversão",
      value: "0%",
      change: "0%",
      changeType: "positive" as const,
      icon: Target,
      description: "Carregando..."
    }
  ]

  const quickActions = [
    {
      title: "Análise RFM",
      description: "Segmente seus clientes por comportamento de compra",
      icon: Target,
      href: "/rfm",
      color: "bg-primary"
    },
    {
      title: "Dashboard Executivo",
      description: "Visão estratégica dos indicadores principais",
      icon: BarChart3,
      href: "/executivo",
      color: "bg-info"
    },
    {
      title: "Métricas Temporais",
      description: "Análise de performance ao longo do tempo",
      icon: Clock,
      href: "/metricas",
      color: "bg-warning"
    },
    {
      title: "Alertas do Sistema",
      description: "Monitore alertas e notificações importantes",
      icon: AlertTriangle,
      href: "/alertas",
      color: "bg-destructive"
    }
  ]

  const getChangeColor = (type: "positive" | "negative") => {
    return type === "positive" ? "text-success" : "text-destructive"
  }

  return (
    <Layout title="Dashboard Principal">
      {/* Welcome Section */}
      <div className="bg-gradient-header rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Bem-vindo ao Painel KPI V2 📊
            </h2>
            <p className="text-lg text-primary-light">
              Sistema de analytics empresarial - Visão completa dos seus indicadores
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Filtro Temporal */}
      <div className="mb-8">
        <TemporalFilter 
          onPeriodChange={handlePeriodChange}
          defaultPeriod="mes-atual"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Carregando dados do dashboard...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <Card className="shadow-card border-destructive/50">
            <CardContent className="p-6">
              <div className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-primary/10`}>
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                    {kpi.change}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {kpi.value}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {kpi.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {kpi.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <div
                  key={index}
                  className="group p-6 rounded-xl border border-border hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-card"
                >
                  <div className={`p-3 rounded-xl ${action.color} w-fit mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Base de Dados</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-2" />
                  <span className="text-sm text-success">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API de Integração</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-2" />
                  <span className="text-sm text-success">Ativo</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última Sincronização</span>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alertas Críticos</span>
                <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-lg">
                  2 novos
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avisos</span>
                <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-lg">
                  5 pendentes
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Informações</span>
                <span className="px-2 py-1 bg-info/10 text-info text-xs font-medium rounded-lg">
                  12 novos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tempo de Resposta</span>
                <span className="text-sm font-medium text-success">142ms</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disponibilidade</span>
                <span className="text-sm font-medium text-success">99.8%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Consultas/min</span>
                <span className="text-sm font-medium text-primary">1.247</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}