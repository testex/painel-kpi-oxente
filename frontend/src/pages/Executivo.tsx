import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout/Layout'
import { TemporalFilter } from '@/components/filters/TemporalFilter'
import { 
  TrendingUp, TrendingDown, Users, Package, 
  Target, DollarSign, Calendar, ArrowUpRight,
  ArrowDownRight, AlertTriangle, CheckCircle
} from 'lucide-react'

export default function Executivo() {
  const executiveMetrics = [
    {
      title: "Revenue Growth",
      value: "23.7%",
      trend: "up",
      icon: TrendingUp,
      description: "Crescimento trimestral",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Market Share",
      value: "18.5%",
      trend: "up",
      icon: Target,
      description: "vs. concorrência",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Customer Retention",
      value: "94.2%",
      trend: "stable",
      icon: Users,
      description: "Taxa de retenção",
      color: "text-info",
      bgColor: "bg-info/10"
    },
    {
      title: "Operational Efficiency",
      value: "87.3%",
      trend: "down",
      icon: Package,
      description: "Eficiência operacional",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-success" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-destructive" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  return (
    <Layout title="Dashboard Executivo">
      {/* Executive Summary Header */}
      <div className="bg-gradient-header rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Dashboard Executivo 📈
            </h2>
            <p className="text-lg text-primary-light">
              Visão estratégica dos indicadores de performance empresarial
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-primary-light">Período de análise</p>
              <p className="font-semibold">Q1 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro Temporal */}
      <div className="mb-8">
        <TemporalFilter 
          onPeriodChange={(period) => console.log('Período Executivo selecionado:', period)}
          defaultPeriod="ultimo-trimestre"
        />
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {executiveMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-1">
                    {metric.value}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-primary" />
              Performance Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-success/5 border border-success/20 rounded-xl">
                <CheckCircle className="h-8 w-8 text-success mr-4" />
                <div>
                  <h4 className="font-semibold text-success">Meta Superada</h4>
                  <p className="text-sm text-muted-foreground">
                    Receita trimestral 15% acima da meta estabelecida
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-warning/5 border border-warning/20 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-warning mr-4" />
                <div>
                  <h4 className="font-semibold text-warning">Atenção Necessária</h4>
                  <p className="text-sm text-muted-foreground">
                    Custos operacionais aumentaram 8% no último mês
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-info/5 border border-info/20 rounded-xl">
                <Users className="h-8 w-8 text-info mr-4" />
                <div>
                  <h4 className="font-semibold text-info">Nova Oportunidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Segmento premium mostra potencial de crescimento 40%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-6 w-6 mr-3 text-primary" />
              Objetivos Estratégicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Crescimento de Receita</span>
                  <span className="text-sm font-bold text-success">118% de 100%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-success mt-1">Meta superada! 🎯</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Redução de Custos</span>
                  <span className="text-sm font-bold text-warning">73% de 100%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Em progresso</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Expansão de Mercado</span>
                  <span className="text-sm font-bold text-info">87% de 100%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-info h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Quase lá!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Decisions & Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-6 w-6 mr-3 text-primary" />
            Decisões Estratégicas e Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center mb-4">
                <DollarSign className="h-8 w-8 text-primary mr-3" />
                <h4 className="font-semibold text-primary">Investimento</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Aprovar investimento de R$ 2.5M em nova linha de produtos premium
              </p>
              <Button size="sm" className="w-full">
                Revisar Proposta
              </Button>
            </div>
            
            <div className="p-6 bg-warning/5 border border-warning/20 rounded-xl">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-warning mr-3" />
                <h4 className="font-semibold text-warning">Recursos Humanos</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Contratar 15 especialistas para suportar expansão do Q2
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Ver Planejamento
              </Button>
            </div>
            
            <div className="p-6 bg-success/5 border border-success/20 rounded-xl">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-success mr-3" />
                <h4 className="font-semibold text-success">Operações</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Otimizar cadeia de suprimentos para reduzir custos em 12%
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Iniciar Projeto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}