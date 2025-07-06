import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout/Layout'
import { 
  AlertTriangle, CheckCircle, Info, XCircle,
  Bell, BellOff, Eye, Settings, Filter
} from 'lucide-react'

interface Alerta {
  id: string
  tipo: 'critico' | 'aviso' | 'info'
  titulo: string
  descricao: string
  data: string
  lido: boolean
  categoria: string
}

export default function Alertas() {
  const [filterType, setFilterType] = useState('todos')
  const [showRead, setShowRead] = useState(true)

  const alertas: Alerta[] = [
    {
      id: '1',
      tipo: 'critico',
      titulo: 'Clientes Champions em Declínio',
      descricao: '15 clientes Champions não realizam compras há mais de 60 dias. Risco de migração para segmento inferior.',
      data: '2024-01-15T10:30:00',
      lido: false,
      categoria: 'RFM'
    },
    {
      id: '2',
      tipo: 'aviso',
      titulo: 'Aumento de Clientes "At Risk"',
      descricao: 'Segmento "At Risk" cresceu 12% na última semana. Campanhas de reativação necessárias.',
      data: '2024-01-14T15:45:00',
      lido: false,
      categoria: 'RFM'
    },
    {
      id: '3',
      tipo: 'info',
      titulo: 'Meta de Receita Atingida',
      descricao: 'Parabéns! Meta mensal de receita foi atingida com 3 dias de antecedência.',
      data: '2024-01-13T09:15:00',
      lido: true,
      categoria: 'Vendas'
    },
    {
      id: '4',
      tipo: 'critico',
      titulo: 'Falha na Sincronização de Dados',
      descricao: 'Sistema de importação apresentou erro. Dados das últimas 2 horas podem estar inconsistentes.',
      data: '2024-01-12T18:20:00',
      lido: false,
      categoria: 'Sistema'
    },
    {
      id: '5',
      tipo: 'aviso',
      titulo: 'Produtos com Baixo Giro',
      descricao: '23 produtos não têm vendas há mais de 30 dias. Considere estratégias de liquidação.',
      data: '2024-01-11T11:00:00',
      lido: true,
      categoria: 'Estoque'
    }
  ]

  const filteredAlertas = alertas.filter(alerta => {
    const matchesType = filterType === 'todos' || alerta.tipo === filterType
    const matchesRead = showRead || !alerta.lido
    return matchesType && matchesRead
  })

  const alertasPorTipo = {
    critico: alertas.filter(a => a.tipo === 'critico' && !a.lido).length,
    aviso: alertas.filter(a => a.tipo === 'aviso' && !a.lido).length,
    info: alertas.filter(a => a.tipo === 'info' && !a.lido).length
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'aviso':
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case 'info':
        return <Info className="h-5 w-5 text-info" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return 'border-destructive/20 bg-destructive/5'
      case 'aviso':
        return 'border-warning/20 bg-warning/5'
      case 'info':
        return 'border-info/20 bg-info/5'
      default:
        return 'border-border bg-background'
    }
  }

  const markAsRead = (id: string) => {
    // Implementar lógica para marcar como lido
    console.log(`Marcando alerta ${id} como lido`)
  }

  return (
    <Layout title="Central de Alertas">
      {/* Header */}
      <div className="bg-gradient-header rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              🚨 Central de Alertas e Notificações
            </h2>
            <p className="text-lg text-primary-light">
              Monitore alertas críticos e mantenha-se informado sobre o seu negócio
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

      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{alertasPorTipo.critico}</p>
                <p className="text-sm text-muted-foreground">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{alertasPorTipo.aviso}</p>
                <p className="text-sm text-muted-foreground">Avisos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-info/10">
                <Info className="h-6 w-6 text-info" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{alertasPorTipo.info}</p>
                <p className="text-sm text-muted-foreground">Informativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {alertas.filter(a => a.lido).length}
                </p>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-card mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mr-2">Tipo:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="critico">Críticos</option>
                  <option value="aviso">Avisos</option>
                  <option value="info">Informativos</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showRead"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showRead" className="text-sm font-medium text-muted-foreground">
                  Mostrar alertas lidos
                </label>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredAlertas.length} alertas encontrados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlertas.map((alerta) => (
          <Card 
            key={alerta.id} 
            className={`shadow-card border-l-4 ${getAlertColor(alerta.tipo)} ${
              !alerta.lido ? 'ring-2 ring-primary/20' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alerta.tipo)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {alerta.titulo}
                      </h3>
                      {!alerta.lido && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="ml-1 text-xs text-primary font-medium">Novo</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {alerta.descricao}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        📅 {new Date(alerta.data).toLocaleString('pt-BR')}
                      </span>
                      <span className="px-2 py-1 bg-muted/50 rounded-lg">
                        {alerta.categoria}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!alerta.lido && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(alerta.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Marcar como Lido
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAlertas.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum alerta encontrado
              </h3>
              <p className="text-muted-foreground">
                Não há alertas que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configurações Rápidas */}
      <Card className="shadow-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-6 w-6 mr-3 text-primary" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">Alertas Críticos</h4>
                <Bell className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Notificações imediatas para situações críticas
              </p>
              <Button size="sm" className="w-full">
                Configurar
              </Button>
            </div>
            
            <div className="p-4 border border-border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">Relatórios Diários</h4>
                <Info className="h-5 w-5 text-info" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Resumo diário de métricas e KPIs
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Configurar
              </Button>
            </div>
            
            <div className="p-4 border border-border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">Alertas RFM</h4>
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Mudanças na segmentação de clientes
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}