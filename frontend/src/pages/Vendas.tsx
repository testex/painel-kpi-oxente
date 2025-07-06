import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Layout } from '@/components/layout/Layout'
import { TemporalFilter } from '@/components/filters/TemporalFilter'
import ResumoVendasPeriodo from '@/components/ResumoVendasPeriodo'
import { 
  TrendingUp, DollarSign, Target, Users,
  Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart as RechartsBar, Bar, PieChart, Pie, Cell
} from 'recharts'

// Interfaces
interface Venda {
  id: string
  numero: string
  data: string
  cliente: {
    id: string
    nome: string
    email: string
    telefone: string
  }
  valorTotal: number
  valorLiquido: number
  status: string
  formaPagamento: string
  itens: Array<{
    id: string
    produto: {
      id: string
      nome: string
      codigo: string
      categoria: string
    }
    quantidade: number
    valorUnitario: number
    valorTotal: number
    desconto: number
  }>
  vendedor: string
  desconto: number
  frete: number
  observacoes?: string
}

interface VendaMetricas {
  totalVendas: number
  receitaTotal: number
  ticketMedio: number
  crescimentoMensal: number
  vendasPorMes: Array<{
    mes: string
    vendas: number
    receita: number
  }>
  topVendedores: Array<{
    nome: string
    vendas: number
    receita: number
  }>
  statusDistribuicao: Array<{
    status: string
    quantidade: number
    valor: number
  }>
}

const CORES_GRAFICO = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [metricas, setMetricas] = useState<VendaMetricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalItens, setTotalItens] = useState(0)
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes-atual')
  const itensPorPagina = 20

  const formatarValor = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
  const formatarData = (data: string) => 
    new Date(data).toLocaleDateString('pt-BR')

  const carregarDados = async (periodo?: string) => {
    try {
      setLoading(true)
      
      // Determinar datas baseado no período
      let dataInicio = ''
      let dataFim = ''
      
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      
      switch (periodo || periodoSelecionado) {
        case 'mes-atual':
          dataInicio = inicioMes.toISOString().split('T')[0]
          dataFim = hoje.toISOString().split('T')[0]
          break
        case 'mes-anterior':
          const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
          const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
          dataInicio = mesAnterior.toISOString().split('T')[0]
          dataFim = fimMesAnterior.toISOString().split('T')[0]
          break
        case 'ultimos-3-meses':
          const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1)
          dataInicio = tresMesesAtras.toISOString().split('T')[0]
          dataFim = hoje.toISOString().split('T')[0]
          break
        default:
          dataInicio = inicioMes.toISOString().split('T')[0]
          dataFim = hoje.toISOString().split('T')[0]
      }

      // Buscar dados reais do backend
      const response = await fetch(
        `http://localhost:3001/api/vendas?data_inicio=${dataInicio}&data_fim=${dataFim}&pagina=${paginaAtual}&limite_por_pagina=${itensPorPagina}`
      )
      
      if (!response.ok) {
        throw new Error('Erro ao carregar vendas')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setVendas(result.data)
        setTotalItens(result.pagination?.total || result.data.length)
        
        // Calcular métricas baseadas nos dados reais
        const vendasData = result.data
        const totalVendas = vendasData.length
        const receitaTotal = vendasData.reduce((sum: number, venda: Venda) => sum + venda.valorTotal, 0)
        const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0
        
        // Agrupar por vendedor
        const vendedoresMap = new Map<string, { vendas: number; receita: number }>()
        vendasData.forEach((venda: Venda) => {
          const vendedor = venda.vendedor
          const atual = vendedoresMap.get(vendedor) || { vendas: 0, receita: 0 }
          vendedoresMap.set(vendedor, {
            vendas: atual.vendas + 1,
            receita: atual.receita + venda.valorTotal
          })
        })
        
        const topVendedores = Array.from(vendedoresMap.entries())
          .map(([nome, dados]) => ({ nome, ...dados }))
          .sort((a, b) => b.receita - a.receita)
          .slice(0, 5)
        
        // Agrupar por status
        const statusMap = new Map<string, { quantidade: number; valor: number }>()
        vendasData.forEach((venda: Venda) => {
          const status = venda.status
          const atual = statusMap.get(status) || { quantidade: 0, valor: 0 }
          statusMap.set(status, {
            quantidade: atual.quantidade + 1,
            valor: atual.valor + venda.valorTotal
          })
        })
        
        const statusDistribuicao = Array.from(statusMap.entries())
          .map(([status, dados]) => ({ status, ...dados }))
        
        setMetricas({
          totalVendas,
          receitaTotal,
          ticketMedio,
          crescimentoMensal: 0, // Será calculado quando tivermos dados históricos
          vendasPorMes: [], // Será calculado quando tivermos dados históricos
          topVendedores,
          statusDistribuicao
        })
      } else {
        throw new Error('Erro na resposta da API')
      }
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [paginaAtual])

  const handlePeriodoChange = (periodo: string) => {
    setPeriodoSelecionado(periodo)
    setPaginaAtual(1)
    carregarDados(periodo)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando vendas...</span>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => carregarDados()}>Tentar novamente</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-background rounded-lg shadow-sm p-6 border">
          <h2 className="text-2xl font-bold text-foreground">💰 Vendas Avançado</h2>
          <p className="text-muted-foreground">Sistema completo de análise de vendas</p>
        </div>

        {/* Filtro Temporal */}
        <div className="mb-6">
          <TemporalFilter 
            onPeriodChange={handlePeriodoChange}
            defaultPeriod="mes-atual"
          />
        </div>

        {/* Componente de Resumo de Vendas */}
        <div className="mb-6">
          <ResumoVendasPeriodo />
        </div>

        {/* Filtros adicionais */}
        <div className="bg-background rounded-lg shadow-sm p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar vendas..."
                className="pl-10"
              />
            </div>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="todos">Todos os Status</option>
              <option value="Concretizada">Concretizada</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Cards de Métricas */}
        {metricas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <h3 className="text-sm font-medium opacity-90">Total de Vendas</h3>
              <p className="text-3xl font-bold mt-2">{metricas.totalVendas.toLocaleString()}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-r from-success to-success/80 text-success-foreground">
              <h3 className="text-sm font-medium opacity-90">Receita Total</h3>
              <p className="text-3xl font-bold mt-2">{formatarValor(metricas.receitaTotal)}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-r from-warning to-warning/80 text-warning-foreground">
              <h3 className="text-sm font-medium opacity-90">Ticket Médio</h3>
              <p className="text-3xl font-bold mt-2">{formatarValor(metricas.ticketMedio)}</p>
            </Card>
            <Card className="p-6 bg-gradient-to-r from-info to-info/80 text-info-foreground">
              <h3 className="text-sm font-medium opacity-90">Clientes Únicos</h3>
              <p className="text-3xl font-bold mt-2">
                {new Set(vendas.map(v => v.cliente.nome)).size}
              </p>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        {metricas && metricas.topVendedores.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">🏆 Top Vendedores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={metricas.topVendedores} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={80} />
                  <Tooltip formatter={(value) => formatarValor(Number(value))} />
                  <Bar dataKey="receita" fill="hsl(var(--success))" />
                </RechartsBar>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Distribuição por Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metricas.statusDistribuicao}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, quantidade }) => `${status}: ${quantidade}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {metricas.statusDistribuicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Lista de Vendas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Lista de Vendas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Número</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Vendedor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Forma Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {vendas
                  .filter(venda => 
                    statusFiltro === 'todos' || venda.status === statusFiltro
                  )
                  .filter(venda =>
                    busca === '' || 
                    venda.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                    venda.numero.includes(busca)
                  )
                  .map((venda) => (
                  <tr key={venda.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-sm">{formatarData(venda.data)}</td>
                    <td className="p-3 font-medium">{venda.numero}</td>
                    <td className="p-3 font-medium">{venda.cliente.nome}</td>
                    <td className="p-3 font-semibold text-success">{formatarValor(venda.valorTotal)}</td>
                    <td className="p-3 text-sm">{venda.vendedor}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.status === 'Concretizada' ? 'bg-success/10 text-success' :
                        venda.status === 'Pendente' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{venda.formaPagamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {totalItens > itensPorPagina && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a {Math.min(paginaAtual * itensPorPagina, totalItens)} de {totalItens} vendas
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(p => p + 1)}
                  disabled={paginaAtual * itensPorPagina >= totalItens}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}