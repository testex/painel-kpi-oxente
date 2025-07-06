import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button' 
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Layout } from '@/components/layout/Layout'
import { TemporalFilter } from '@/components/filters/TemporalFilter'
import { 
  Target, Users, TrendingUp, DollarSign, 
  AlertTriangle, CheckCircle, Eye, Filter,
  BarChart3, PieChart, Activity
} from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Cell, BarChart, Bar, LineChart, Line, Legend } from 'recharts'

export default function RFM() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Dados mockados para demonstração
  const rfmSummary = {
    totalClientes: 15847,
    segmentosAtivos: 8,
    valorMedioSegmento: 850.50,
    ultimaAtualizacao: new Date().toLocaleString('pt-BR')
  }

  const segmentos = [
    { nome: 'Champions', quantidade: 2847, percentual: 18, valorMedio: 2450, cor: '#10B981' },
    { nome: 'Loyal Customers', quantidade: 3251, percentual: 21, valorMedio: 1890, cor: '#3B82F6' },
    { nome: 'Potential Loyalists', quantidade: 2156, percentual: 14, valorMedio: 1245, cor: '#8B5CF6' },
    { nome: 'At Risk', quantidade: 1984, percentual: 13, valorMedio: 890, cor: '#F59E0B' },
    { nome: 'Cannot Lose Them', quantidade: 1547, percentual: 10, valorMedio: 3250, cor: '#EF4444' },
    { nome: 'New Customers', quantidade: 2456, percentual: 15, valorMedio: 450, cor: '#06B6D4' },
    { nome: 'Hibernating', quantidade: 1234, percentual: 8, valorMedio: 234, cor: '#64748B' },
    { nome: 'Lost', quantidade: 372, percentual: 2, valorMedio: 120, cor: '#94A3B8' }
  ]

  const scatterData = [
    { segmento: 'Champions', recencia: 15, frequencia: 12, valor: 2450, x: 15, y: 2450 },
    { segmento: 'Loyal', recencia: 45, frequencia: 8, valor: 1890, x: 45, y: 1890 },
    { segmento: 'Potential', recencia: 30, frequencia: 5, valor: 1245, x: 30, y: 1245 },
    { segmento: 'At Risk', recencia: 120, frequencia: 3, valor: 890, x: 120, y: 890 },
    { segmento: 'Cannot Lose', recencia: 180, frequencia: 10, valor: 3250, x: 180, y: 3250 },
    { segmento: 'New', recencia: 10, frequencia: 1, valor: 450, x: 10, y: 450 },
    { segmento: 'Hibernating', recencia: 365, frequencia: 2, valor: 234, x: 365, y: 234 },
    { segmento: 'Lost', recencia: 500, frequencia: 1, valor: 120, x: 500, y: 120 }
  ]

  const evolutionData = [
    { mes: 'Jan', Champions: 2650, Loyal: 3100, AtRisk: 2100, Lost: 400 },
    { mes: 'Fev', Champions: 2720, Loyal: 3180, AtRisk: 2050, Lost: 380 },
    { mes: 'Mar', Champions: 2800, Loyal: 3220, AtRisk: 2000, Lost: 375 },
    { mes: 'Abr', Champions: 2847, Loyal: 3251, AtRisk: 1984, Lost: 372 }
  ]

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#64748B', '#94A3B8']

  return (
    <Layout title="Análise RFM">
      {/* Header Explicativo */}
      <div className="bg-gradient-header rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              🎯 Análise RFM de Clientes
            </h2>
            <p className="text-lg text-primary-light">
              Segmentação inteligente baseada em Recência, Frequência e Valor Monetário
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-primary-light">Última atualização</p>
              <p className="font-semibold">{rfmSummary.ultimaAtualizacao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro Temporal */}
      <div className="mb-8">
        <TemporalFilter 
          onPeriodChange={(period) => console.log('Período RFM selecionado:', period)}
          defaultPeriod="ultimo-trimestre"
        />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {rfmSummary.totalClientes.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{rfmSummary.segmentosAtivos}</p>
                <p className="text-sm text-muted-foreground">Segmentos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-info/10">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  R$ {rfmSummary.valorMedioSegmento.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-warning/10">
                <Activity className="h-6 w-6 text-warning" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">94.2%</p>
                <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📈 Visão Geral</TabsTrigger>
          <TabsTrigger value="segmentation">👥 Segmentação</TabsTrigger>
          <TabsTrigger value="charts">📊 Gráficos</TabsTrigger>
          <TabsTrigger value="analysis">🔍 Análise</TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Scatter Plot */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-primary" />
                  Distribuição RFM - Recência vs Valor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      name="Recência (dias)"
                      type="number"
                      domain={[0, 600]}
                    />
                    <YAxis 
                      dataKey="y" 
                      name="Valor (R$)"
                      type="number"
                      domain={[0, 4000]}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ payload }) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border rounded-xl shadow-card">
                              <p className="font-semibold">{data.segmento}</p>
                              <p>Recência: {data.recencia} dias</p>
                              <p>Frequência: {data.frequencia} compras</p>
                              <p>Valor: R$ {data.valor.toFixed(2)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    {scatterData.map((entry, index) => (
                      <Scatter 
                        key={entry.segmento}
                        data={[entry]} 
                        fill={COLORS[index % COLORS.length]}
                        shape="circle"
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alertas e Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3 text-warning" />
                    Alertas Críticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-destructive mr-3" />
                      <div>
                        <h4 className="font-semibold text-destructive">Clientes em Risco</h4>
                        <p className="text-sm text-muted-foreground">
                          372 clientes não compram há mais de 180 dias
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-warning/5 border border-warning/20 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-warning mr-3" />
                      <div>
                        <h4 className="font-semibold text-warning">Atenção Necessária</h4>
                        <p className="text-sm text-muted-foreground">
                          1.984 clientes com baixa frequência recente
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-success" />
                    Oportunidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-success/5 border border-success/20 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-success mr-3" />
                      <div>
                        <h4 className="font-semibold text-success">Champions</h4>
                        <p className="text-sm text-muted-foreground">
                          2.847 clientes premium - potencial para upselling
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-info/5 border border-info/20 rounded-xl">
                      <Users className="h-6 w-6 text-info mr-3" />
                      <div>
                        <h4 className="font-semibold text-info">Novos Clientes</h4>
                        <p className="text-sm text-muted-foreground">
                          2.456 novos clientes - foco em retenção
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Aba Segmentação */}
        <TabsContent value="segmentation">
          <div className="space-y-6">
            {/* Tabela de Segmentos */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Segmentos RFM Detalhados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Segmento</th>
                        <th className="text-right py-3 px-4 font-semibold">Clientes</th>
                        <th className="text-right py-3 px-4 font-semibold">Percentual</th>
                        <th className="text-right py-3 px-4 font-semibold">Valor Médio</th>
                        <th className="text-center py-3 px-4 font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segmentos.map((segmento, index) => (
                        <tr key={segmento.nome} className="border-b border-border hover:bg-muted/30">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3" 
                                style={{ backgroundColor: segmento.cor }}
                              />
                              <span className="font-medium">{segmento.nome}</span>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 font-medium">
                            {segmento.quantidade.toLocaleString('pt-BR')}
                          </td>
                          <td className="text-right py-4 px-4">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                              {segmento.percentual}%
                            </span>
                          </td>
                          <td className="text-right py-4 px-4 font-medium">
                            R$ {segmento.valorMedio.toFixed(2)}
                          </td>
                          <td className="text-center py-4 px-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Clientes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Gráficos */}
        <TabsContent value="charts">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-6 w-6 mr-3 text-primary" />
                    Distribuição por Segmentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <RechartsPie
                        data={segmentos}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="quantidade"
                      >
                        {segmentos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </RechartsPie>
                      <Tooltip 
                        formatter={(value, name) => [value.toLocaleString('pt-BR'), 'Clientes']}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Barras */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3 text-primary" />
                    Valor por Segmento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="nome" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valorMedio" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Evolução Temporal */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-primary" />
                  Evolução dos Segmentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Champions" stroke="#10B981" strokeWidth={3} />
                    <Line type="monotone" dataKey="Loyal" stroke="#3B82F6" strokeWidth={3} />
                    <Line type="monotone" dataKey="AtRisk" stroke="#F59E0B" strokeWidth={3} />
                    <Line type="monotone" dataKey="Lost" stroke="#EF4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Análise */}
        <TabsContent value="analysis">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Estratégia Champions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Seus melhores clientes. Mantenha o excelente relacionamento.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Ações Recomendadas:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Programas VIP exclusivos</li>
                        <li>• Produtos premium</li>
                        <li>• Atendimento prioritário</li>
                      </ul>
                    </div>
                    <Button size="sm" className="w-full">Ver Estratégia</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">⚠️ Estratégia At Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Clientes valiosos que podem ser perdidos. Reengajamento urgente.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Ações Recomendadas:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Campanhas de reativação</li>
                        <li>• Ofertas especiais</li>
                        <li>• Contato personalizado</li>
                      </ul>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">Ação Urgente</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">🆕 Estratégia Novos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Novos clientes com potencial. Foque na retenção.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Ações Recomendadas:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Onboarding eficiente</li>
                        <li>• Suporte dedicado</li>
                        <li>• Incentivos de segunda compra</li>
                      </ul>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">Implementar</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Recomendações Estratégicas Baseadas em RFM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-success mb-3">💚 Pontos Fortes</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                        39% dos clientes são Champions ou Loyal (base sólida)
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                        Valor médio por segmento está crescendo
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                        Alto número de novos clientes (2.456)
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-destructive mb-3">🔴 Áreas de Atenção</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                        23% dos clientes estão em risco ou inativos
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                        Segmento "Lost" precisa de reativação
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                        Hibernating (8%) - potencial não explorado
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  )
}