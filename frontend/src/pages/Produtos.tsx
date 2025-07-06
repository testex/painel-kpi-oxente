import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout/Layout'
import { TemporalFilter } from '@/components/filters/TemporalFilter'
import { 
  Package, TrendingUp, BarChart, Target,
  Calendar, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart as RechartsBar, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter
} from 'recharts'
import { ProdutosService } from '@/lib/api'

// Interfaces
interface Produto {
  nome: string
  vendas: number
  receita: number
  ticketMedio: number
  crescimento?: number
}

interface SazonalidadeItem {
  produto: string
  coeficienteVariacao: number
  totalVendas: number
  totalReceita: number
  tendencia: string
  status: string
}

interface MatrizABCItem {
  nome: string
  vendas: number
  receita: number
  frequencia: number
  classificacaoReceita: 'A' | 'B' | 'C'
  classificacaoFrequencia: 'A' | 'B' | 'C'
  quadrante: string
  prioridade: string
  percentualReceita: number
}

interface MatrizABCResponse {
  data: MatrizABCItem[]
  quadrantes: Record<string, MatrizABCItem[]>
}

interface PaginacaoMeta {
  total: number
  totalPaginas: number
  hasNextPage: boolean
  hasPrevPage: boolean
  startIndex: number
  endIndex: number
}

// Cores dos gráficos
const CORES = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
const CORES_QUADRANTE = {
  'AA': '#22c55e', // Verde - Muito Alta prioridade
  'AB': '#3b82f6', // Azul - Alta prioridade
  'AC': '#f59e0b', // Amarelo - Alta prioridade
  'BC': '#ef4444', // Vermelho - Baixa prioridade
  'CC': '#6b7280'  // Cinza - Baixa prioridade
}

export default function Produtos() {
  // Estados principais
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [sazonalidade, setSazonalidade] = useState<SazonalidadeItem[]>([])
  const [matrizABC, setMatrizABC] = useState<MatrizABCResponse | null>(null)
  
  // Estados de controle
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'produtos' | 'sazonalidade' | 'matriz-abc'>('produtos')
  
  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(30)
  const [meta, setMeta] = useState<PaginacaoMeta>({
    total: 0,
    totalPaginas: 1,
    hasNextPage: false,
    hasPrevPage: false,
    startIndex: 0,
    endIndex: 0
  })

  // Estado do filtro temporal
  const [periodoSelecionado, setPeriodoSelecionado] = useState('todos')

  // Funções de fetch
  const fetchProdutos = async (periodo?: string, filtros?: { dataInicio?: string; dataFim?: string }, page = 1, limit = 30) => {
    try {
      setLoading(true)
      setError('')
      const service = new ProdutosService()
      const filtrosApi: any = { page, limit }
      if (periodo && periodo !== 'todos') filtrosApi.periodo = periodo
      if (filtros?.dataInicio && filtros?.dataFim && periodo === 'personalizado') {
        filtrosApi.dataInicio = filtros.dataInicio
        filtrosApi.dataFim = filtros.dataFim
      }
      const response = await service.getProdutos(filtrosApi)
      setProdutos(response.data)
      setMeta({
        total: response.pagination.total,
        totalPaginas: response.pagination.totalPaginas,
        hasNextPage: page < response.pagination.totalPaginas,
        hasPrevPage: page > 1,
        startIndex: (page - 1) * limit,
        endIndex: Math.min(page * limit, response.pagination.total)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSazonalidade = async () => {
    try {
      const service = new ProdutosService()
      const response = await service.getSazonalidade()
      setSazonalidade(response.data)
    } catch (err) {
      setSazonalidade([])
    }
  }

  const fetchMatrizABC = async () => {
    try {
      const service = new ProdutosService()
      const response = await service.getMatrizABC()
      setMatrizABC(response.data)
    } catch (err) {
      setMatrizABC(null)
    }
  }

  // Efeitos
  useEffect(() => {
    if (abaAtiva === 'produtos') {
      fetchProdutos(periodoSelecionado, undefined, paginaAtual, itensPorPagina)
    } else if (abaAtiva === 'sazonalidade') {
      fetchSazonalidade()
    } else if (abaAtiva === 'matriz-abc') {
      fetchMatrizABC()
    }
  }, [abaAtiva, periodoSelecionado, paginaAtual, itensPorPagina])

  // Funções de manipulação
  const handleMudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina)
  }

  const handleMudarLimite = (novoLimite: number) => {
    setItensPorPagina(novoLimite)
    setPaginaAtual(1)
  }

  // Dados para gráficos
  const dadosLinha = produtos.slice(0, 10).map(p => ({
    nome: p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome,
    vendas: p.vendas,
    receita: p.receita
  }))

  const dadosPizza = produtos.slice(0, 8).map(p => ({
    nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
    receita: p.receita
  }))

  const dadosSazonalidade = sazonalidade.map(s => ({
    produto: s.produto.length > 12 ? s.produto.substring(0, 12) + '...' : s.produto,
    coeficiente: s.coeficienteVariacao,
    vendas: s.totalVendas
  }))

  const dadosMatrizScatter = matrizABC?.data.map(item => ({
    nome: item.nome,
    receita: item.receita,
    frequencia: item.frequencia,
    quadrante: item.quadrante
  })) || []

  if (loading && produtos.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Carregando produtos...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao Carregar</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => fetchProdutos()} className="mt-4">
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">📦 Análise de Produtos</h2>
            <p className="text-muted-foreground">Análise avançada de produtos com segmentação ABC</p>
          </div>
        </div>

        {/* Filtro Temporal */}
        <div className="mb-6">
          <TemporalFilter 
            onPeriodChange={(period) => {
              console.log('Período selecionado:', period)
              // Reset paginação ao mudar filtro
              setPaginaAtual(1)
            }}
            defaultPeriod="mes-atual"
          />
        </div>

        {/* Sistema de Abas */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setAbaAtiva('produtos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaAtiva === 'produtos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              📊 Produtos Top
            </button>
            <button
              onClick={() => setAbaAtiva('sazonalidade')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaAtiva === 'sazonalidade'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              📅 Sazonalidade
            </button>
            <button
              onClick={() => setAbaAtiva('matriz-abc')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaAtiva === 'matriz-abc'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              🎯 Matriz ABC
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'produtos' && (
          <>
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total de Produtos</h3>
                <p className="text-2xl font-bold text-primary">{meta.total}</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Receita Total</h3>
                <p className="text-2xl font-bold text-success">
                  R$ {produtos.reduce((acc, p) => acc + p.receita, 0).toLocaleString('pt-BR')}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Vendas Total</h3>
                <p className="text-2xl font-bold text-warning">
                  {produtos.reduce((acc, p) => acc + p.vendas, 0).toLocaleString('pt-BR')}
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Ticket Médio</h3>
                <p className="text-2xl font-bold text-info">
                  R$ {produtos.length > 0 
                    ? (produtos.reduce((acc, p) => acc + p.receita, 0) / produtos.reduce((acc, p) => acc + p.vendas, 0) || 0).toFixed(2)
                    : '0.00'
                  }
                </p>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Linha */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">📈 Top 10 - Vendas por Produto</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosLinha}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'vendas' ? `${value} vendas` : `R$ ${Number(value).toLocaleString('pt-BR')}`,
                      name === 'vendas' ? 'Vendas' : 'Receita'
                    ]} />
                    <Legend />
                    <Line type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" name="Vendas" strokeWidth={2} />
                    <Line type="monotone" dataKey="receita" stroke="hsl(var(--success))" name="Receita" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Gráfico de Pizza */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">🥧 Participação na Receita (Top 8)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="receita"
                      label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Tabela de Produtos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Lista de Produtos</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Vendas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Receita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Ticket Médio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Crescimento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {produtos.map((produto, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {produto.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {produto.vendas.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          R$ {produto.receita.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          R$ {(produto.receita / produto.vendas).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={produto.crescimento && produto.crescimento > 0 ? 'text-success' : 'text-destructive'}>
                            {produto.crescimento ? `${produto.crescimento > 0 ? '+' : ''}${produto.crescimento.toFixed(1)}%` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Aba Sazonalidade */}
        {abaAtiva === 'sazonalidade' && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">📅 Análise de Sazonalidade</h3>
              <p className="text-muted-foreground mb-6">Produtos com maior variação sazonal (coeficiente de variação)</p>
              
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBar data={dadosSazonalidade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="produto" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'coeficiente' ? `${Number(value).toFixed(1)}%` : `${value} vendas`,
                      name === 'coeficiente' ? 'Coef. Variação' : 'Total Vendas'
                    ]} 
                  />
                  <Legend />
                  <Bar dataKey="coeficiente" fill="hsl(var(--warning))" name="Coef. Variação (%)" />
                  <Bar dataKey="vendas" fill="hsl(var(--primary))" name="Total Vendas" />
                </RechartsBar>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Coef. Variação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tendência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Vendas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {sazonalidade.slice(0, 15).map((item, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {item.produto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {item.coeficienteVariacao.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.tendencia === 'Alta Sazonalidade' 
                              ? 'bg-destructive/10 text-destructive' 
                              : 'bg-success/10 text-success'
                          }`}>
                            {item.tendencia}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'atencao' 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-success/10 text-success'
                          }`}>
                            {item.status === 'atencao' ? 'Atenção' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {item.totalVendas.toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Aba Matriz ABC */}
        {abaAtiva === 'matriz-abc' && matrizABC && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Dispersão */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">🎯 Matriz ABC - Receita vs Frequência</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={dadosMatrizScatter}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="receita" 
                      name="Receita"
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="frequencia" 
                      name="Frequência"
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'receita' ? `R$ ${Number(value).toLocaleString('pt-BR')}` : value,
                        name === 'receita' ? 'Receita' : 'Frequência'
                      ]}
                    />
                    <Scatter 
                      name="Produtos" 
                      data={dadosMatrizScatter} 
                      fill="hsl(var(--primary))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>

              {/* Resumo por Quadrantes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Resumo por Quadrantes</h3>
                <div className="space-y-4">
                  {Object.entries(matrizABC.quadrantes).map(([quadrante, produtos]) => (
                    produtos.length > 0 && (
                      <div key={quadrante} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: CORES_QUADRANTE[quadrante as keyof typeof CORES_QUADRANTE] }}
                          ></div>
                          <div>
                            <p className="font-medium text-foreground">{quadrante}</p>
                            <p className="text-sm text-muted-foreground">
                              {produtos[0]?.prioridade || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{produtos.length}</p>
                          <p className="text-sm text-muted-foreground">produtos</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </Card>
            </div>

            {/* Tabela detalhada da Matriz ABC */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Matriz ABC Detalhada</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quadrante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prioridade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Receita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Frequência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        % Receita
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {matrizABC.data.slice(0, 20).map((produto, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {produto.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                            style={{ backgroundColor: CORES_QUADRANTE[produto.quadrante as keyof typeof CORES_QUADRANTE] }}
                          >
                            {produto.quadrante}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            produto.prioridade === 'Muito Alta' ? 'bg-success/10 text-success' :
                            produto.prioridade === 'Alta' ? 'bg-primary/10 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {produto.prioridade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          R$ {produto.receita.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {produto.frequencia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {produto.percentualReceita.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  )
}