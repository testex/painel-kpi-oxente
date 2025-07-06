import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Layout } from '@/components/layout/Layout'
import { 
  Users, Search, Plus, Eye, Edit, Trash, 
  ArrowLeft, Mail, Phone, Calendar, 
  DollarSign, ShoppingBag, Target, Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { ClientesService } from '@/lib/api'

interface Cliente {
  id: string
  tipo_pessoa: string
  nome: string
  razao_social?: string | null
  cnpj?: string | null
  inscricao_estadual?: string | null
  inscricao_municipal?: string | null
  cpf?: string | null
  rg?: string | null
  data_nascimento?: string | null
  telefone: string
  celular: string
  fax?: string | null
  email: string
  ativo: string
  contatos: Array<{
    contato: {
      tipo_id?: string
      nome_tipo?: string
      nome: string
      contato: string
      cargo: string
      observacao: string
    }
  }>
  enderecos: Array<{
    endereco: {
      cep: string
      logradouro: string
      numero: string
      complemento: string | null
      bairro: string
      cidade_id: string
      nome_cidade: string
      estado: string
    }
  }>
  // Campos calculados pelo backend
  dataCadastro?: string
  ultimaCompra?: string
  totalCompras?: number
  valorTotal?: number
  rfm?: {
    recencia: number
    frequencia: number
    valor: number
    segmento: string
  }
}

export default function Clientes() {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [currentView, setCurrentView] = useState<'lista' | 'perfil'>('lista')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estado para clientes reais
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true)
      try {
        const service = new ClientesService()
        const filtros: any = {}
        if (searchTerm) filtros.nome = searchTerm
        if (statusFilter !== 'todos') filtros.situacao = statusFilter === 'ativo' ? 1 : 0
        filtros.page = currentPage
        filtros.limit = itemsPerPage
        const response = await service.getClientes(filtros)
        setClientes(response.data)
        setTotalPages(response.pagination.totalPaginas)
      } catch (err) {
        setClientes([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [searchTerm, statusFilter, currentPage])

  const filteredClientes = clientes // já filtrado pelo backend
  const paginatedClientes = filteredClientes // já paginado pelo backend

  const selectedCliente = selectedClientId ? clientes.find(c => c.id === selectedClientId) : null

  const handleViewProfile = (clienteId: string) => {
    setSelectedClientId(clienteId)
    setCurrentView('perfil')
  }

  const handleBackToList = () => {
    setCurrentView('lista')
    setSelectedClientId(null)
  }

  const getSegmentoColor = (segmento: string) => {
    const colors: Record<string, string> = {
      'Champions': 'bg-success/10 text-success',
      'Loyal Customers': 'bg-primary/10 text-primary',
      'Potential Loyalists': 'bg-info/10 text-info',
      'At Risk': 'bg-warning/10 text-warning',
      'New Customers': 'bg-info/10 text-info'
    }
    return colors[segmento] || 'bg-muted/10 text-muted-foreground'
  }

  if (currentView === 'perfil' && selectedCliente) {
    return (
      <Layout title="Perfil do Cliente">
        <div className="space-y-6">
          {/* Header com Botão Voltar */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à Lista
            </Button>
            <h2 className="text-2xl font-bold text-foreground">👤 Perfil do Cliente</h2>
          </div>

          {/* Informações Pessoais */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-3 text-primary" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <p className="text-lg font-semibold text-foreground">{selectedCliente.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedCliente.ativo === "1"
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {selectedCliente.ativo === "1" ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg text-foreground flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {selectedCliente.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-lg text-foreground flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {selectedCliente.telefone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                  <p className="text-lg text-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {selectedCliente.dataCadastro ? format(new Date(selectedCliente.dataCadastro), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Compra</label>
                  <p className="text-lg text-foreground flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                    {selectedCliente.ultimaCompra ? format(new Date(selectedCliente.ultimaCompra), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas RFM */}
          {selectedCliente.rfm && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Análise RFM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground">Recência</p>
                    <p className="text-2xl font-bold text-primary">{selectedCliente.rfm.recencia}</p>
                    <p className="text-xs text-muted-foreground">dias da última compra</p>
                  </div>
                  <div className="text-center p-4 bg-success/5 border border-success/20 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground">Frequência</p>
                    <p className="text-2xl font-bold text-success">{selectedCliente.rfm.frequencia}</p>
                    <p className="text-xs text-muted-foreground">total de compras</p>
                  </div>
                  <div className="text-center p-4 bg-info/5 border border-info/20 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground">Valor Monetário</p>
                    <p className="text-2xl font-bold text-info">
                      R$ {selectedCliente.rfm.valor.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">valor total gasto</p>
                  </div>
                  <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground">Segmento RFM</p>
                    <p className="text-lg font-bold text-warning">{selectedCliente.rfm.segmento}</p>
                    <p className="text-xs text-muted-foreground">classificação atual</p>
                  </div>
                </div>
              
              <div className="p-4 bg-muted/30 rounded-xl">
                <h4 className="font-semibold text-foreground mb-2">💡 Insights do Cliente</h4>
                {selectedCliente.rfm.segmento === 'Champions' && (
                  <p className="text-sm text-muted-foreground">
                    Cliente premium! Mantenha o relacionamento com ofertas exclusivas e atendimento VIP.
                  </p>
                )}
                {selectedCliente.rfm.segmento === 'Loyal Customers' && (
                  <p className="text-sm text-muted-foreground">
                    Cliente fiel com bom histórico. Oportunidade para aumentar o ticket médio.
                  </p>
                )}
                {selectedCliente.rfm.segmento === 'Potential Loyalists' && (
                  <p className="text-sm text-muted-foreground">
                    Cliente com potencial de fidelização. Foque em aumentar a frequência de compras.
                  </p>
                )}
                {selectedCliente.rfm.segmento === 'At Risk' && (
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Cliente em risco! Implementar campanha de reativação urgentemente.
                  </p>
                )}
                {selectedCliente.rfm.segmento === 'New Customers' && (
                  <p className="text-sm text-muted-foreground">
                    Novo cliente! Foque na experiência inicial e incentive a segunda compra.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          )}

          {/* Resumo Financeiro */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-6 w-6 mr-3 text-primary" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-card rounded-xl border">
                  <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{selectedCliente.totalCompras || 0}</p>
                  <p className="text-sm text-muted-foreground">Total de Compras</p>
                </div>
                <div className="text-center p-6 bg-gradient-card rounded-xl border">
                  <DollarSign className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    R$ {(selectedCliente.valorTotal || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor Total Gasto</p>
                </div>
                <div className="text-center p-6 bg-gradient-card rounded-xl border">
                  <Target className="h-8 w-8 text-info mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">
                    R$ {selectedCliente.totalCompras && selectedCliente.valorTotal ? (selectedCliente.valorTotal / selectedCliente.totalCompras).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Gestão de Clientes">
      {/* Header com Busca */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">👥 Gestão de Clientes</h2>
          <p className="text-muted-foreground">Gerencie seus clientes e visualize perfis detalhados</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{clientes.length}</p>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {clientes.filter(c => c.ativo === "1").length}
                </p>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-info/10">
                <Target className="h-6 w-6 text-info" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {clientes.filter(c => c.rfm?.segmento === 'Champions').length}
                </p>
                <p className="text-sm text-muted-foreground">Champions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-warning/10">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  R$ {(clientes.reduce((acc, c) => acc + (c.valorTotal || 0), 0) / Math.max(clientes.length, 1)).toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-6 w-6 mr-3 text-primary" />
              Lista de Clientes
            </span>
            <span className="text-sm text-muted-foreground">
              {filteredClientes.length} clientes encontrados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contato</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Segmento RFM</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Última Compra</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valor Total</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {cliente.nome.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-foreground">{cliente.nome}</div>
                          <div className="text-xs text-muted-foreground">ID: {cliente.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{cliente.email}</div>
                      <div className="text-xs text-muted-foreground">{cliente.telefone}</div>
                    </td>
                                    <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cliente.ativo === "1"
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {cliente.ativo === "1" ? '✅ Ativo' : '❌ Inativo'}
                  </span>
                </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getSegmentoColor(cliente.rfm?.segmento || 'N/A')
                      }`}>
                        {cliente.rfm?.segmento || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {cliente.ultimaCompra ? format(new Date(cliente.ultimaCompra), 'dd/MM/yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-foreground">
                        R$ {(cliente.valorTotal || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cliente.totalCompras || 0} compras
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProfile(cliente.id)}
                          title="Ver perfil"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Excluir"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages} • {filteredClientes.length} clientes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </Layout>
  )
}