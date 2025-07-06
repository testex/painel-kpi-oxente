// Serviço de API centralizado para integração com o backend
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Log para debug da configuração da API
console.log('[ApiService] Configuração da API:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL
})

// Interfaces comuns
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

interface PaginationMeta {
  total: number
  pagina: number
  totalPaginas: number
  porPagina: number
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}

// Classe base para requisições HTTP
class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    console.log(`[ApiService] ${options.method || 'GET'} ${url}`)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`[ApiService] Response from ${url}:`, data)
      
      return data
    } catch (error) {
      console.error(`[ApiService] Error in ${options.method || 'GET'} ${url}:`, error)
      throw error
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Instância global do serviço de API
export const api = new ApiService(API_BASE_URL)

// Serviços específicos por domínio
export class ProdutosService {
  // GET /api/produtos - Lista de produtos com filtros e paginação
  async getProdutos(filtros: {
    page?: number
    limit?: number
    periodo?: string
    dataInicio?: string
    dataFim?: string
    categoria?: string
    busca?: string
  } = {}): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<PaginatedResponse<any>>(`/api/produtos?${params.toString()}`)
  }

  // GET /api/produtos/top - Produtos mais vendidos
  async getTopProdutos(limit: number = 10): Promise<ApiResponse<any[]>> {
    return api.get<ApiResponse<any[]>>(`/api/produtos/top?limit=${limit}`)
  }

  // GET /api/produtos/sazonalidade - Análise de sazonalidade
  async getSazonalidade(periodo: string = 'ano-atual'): Promise<ApiResponse<any[]>> {
    return api.get<ApiResponse<any[]>>(`/api/produtos/sazonalidade?periodo=${periodo}`)
  }

  // GET /api/produtos/matriz-abc - Matriz ABC de produtos
  async getMatrizABC(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>('/api/produtos/matriz-abc')
  }

  // GET /api/produtos/categorias - Lista de categorias
  async getCategorias(): Promise<ApiResponse<string[]>> {
    return api.get<ApiResponse<string[]>>('/api/produtos/categorias')
  }
}

export class VendasService {
  // GET /api/vendas - Listar vendas com filtros
  async getVendas(filtros: {
    dataInicio?: string
    dataFim?: string
    clienteId?: string
    status?: string
    vendedor?: string
    formaPagamento?: string
    page?: number
    limit?: number
    ordenarPor?: 'data' | 'valor' | 'cliente'
    ordem?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<PaginatedResponse<any>>(`/api/vendas?${params.toString()}`)
  }

  // GET /api/vendas/:id - Buscar venda específica
  async getVendaById(id: string): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>(`/api/vendas/${id}`)
  }

  // GET /api/vendas/analytics/geral - Analytics gerais de vendas
  async getVendasAnalytics(filtros: {
    dataInicio?: string
    dataFim?: string
    clienteId?: string
    status?: string
    vendedor?: string
    formaPagamento?: string
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<ApiResponse<any>>(`/api/vendas/analytics/geral?${params.toString()}`)
  }

  // GET /api/vendas/analytics/periodo - Vendas por período específico
  async getVendasPorPeriodo(dataInicio: string, dataFim: string): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>(`/api/vendas/analytics/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`)
  }

  // GET /api/vendas/status/lista - Listar status disponíveis
  async getStatusLista(): Promise<ApiResponse<string[]>> {
    return api.get<ApiResponse<string[]>>('/api/vendas/status/lista')
  }
}

export class ClientesService {
  // GET /api/clientes - Listar clientes com filtros
  async getClientes(filtros: {
    nome?: string
    documento?: string
    email?: string
    telefone?: string
    tipoPessoa?: 'PF' | 'PJ' | 'ES'
    ativo?: boolean
    cidade?: string
    estado?: string
    page?: number
    limit?: number
    ordenarPor?: 'nome' | 'documento' | 'ultimaCompra' | 'valorTotal'
    ordem?: 'asc' | 'desc'
  } = {}): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return api.get<PaginatedResponse<any>>(`/api/clientes?${params.toString()}`)
  }

  // GET /api/clientes/:id - Buscar cliente específico
  async getClienteById(id: string): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>(`/api/clientes/${id}`)
  }

  // GET /api/clientes/analytics/geral - Analytics gerais de clientes
  async getClientesAnalytics(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>('/api/clientes/analytics/geral')
  }

  // GET /api/clientes/analytics/rfm - Análise RFM
  async getRFMAnalytics(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>('/api/clientes/analytics/rfm')
  }

  // GET /api/clientes/tipos/lista - Listar tipos de pessoa
  async getTiposLista(): Promise<ApiResponse<any[]>> {
    return api.get<ApiResponse<any[]>>('/api/clientes/tipos/lista')
  }

  // GET /api/clientes/estados/lista - Listar estados disponíveis
  async getEstadosLista(): Promise<ApiResponse<string[]>> {
    return api.get<ApiResponse<string[]>>('/api/clientes/estados/lista')
  }

  // GET /api/clientes/cidades/lista - Listar cidades por estado
  async getCidadesLista(estado: string): Promise<ApiResponse<string[]>> {
    return api.get<ApiResponse<string[]>>(`/api/clientes/cidades/lista?estado=${estado}`)
  }
}

export class ERPService {
  // GET /api/erp/status - Verificar status da conexão com ERP
  async getStatus(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>('/api/erp/status')
  }

  // POST /api/erp/cache/clear - Limpar cache do ERP
  async clearCache(): Promise<ApiResponse<any>> {
    return api.post<ApiResponse<any>>('/api/erp/cache/clear', {})
  }
}

export class DashboardService {
  // GET /api/dashboard/analytics - KPIs principais do dashboard
  async getDashboardAnalytics(queryString: string = ''): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>(`/api/dashboard/analytics${queryString}`)
  }

  // GET /api/dashboard/system/status - Status do sistema e integrações
  async getSystemStatus(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>('/api/dashboard/system/status')
  }

  // GET /api/dashboard/alerts/summary - Resumo de alertas do sistema
  async getAlertsSummary(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>('/api/dashboard/alerts/summary')
  }
}

// Instâncias dos serviços
export const produtosService = new ProdutosService()
export const vendasService = new VendasService()
export const clientesService = new ClientesService()
export const erpService = new ERPService()
export const dashboardService = new DashboardService()

// Exportar tipos comuns
export type { ApiResponse, PaginatedResponse, PaginationMeta } 