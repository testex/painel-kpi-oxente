// Serviço de integração com ERP GestãoClick
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros

import { erpConfig, getERPHeaders, validateERPConfig } from '../config/erpConfig'
import { ERPResponse, ERPProduto, ERPVenda, ERPCliente, ERPProdutoFiltros, ERPVendaFiltros, ERPClienteFiltros } from '../types/erp'

// Cache simples em memória para otimizar performance
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutos padrão
    console.log(`[Cache] Armazenando dados para chave: ${key}`)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      console.log(`[Cache] Cache miss para chave: ${key}`)
      return null
    }

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      console.log(`[Cache] Cache expirado para chave: ${key}`)
      this.cache.delete(key)
      return null
    }

    console.log(`[Cache] Cache hit para chave: ${key}`)
    return item.data
  }

  clear(): void {
    console.log('[Cache] Limpando cache')
    this.cache.clear()
  }
}

// Rate limiter simples
class RateLimiter {
  private requests: number[] = []
  private dailyRequests: number = 0
  private lastReset: number = Date.now()

  canMakeRequest(): boolean {
    const now = Date.now()
    
    // Reset diário
    if (now - this.lastReset > 24 * 60 * 60 * 1000) {
      this.dailyRequests = 0
      this.lastReset = now
    }

    // Limite diário
    if (this.dailyRequests >= erpConfig.rateLimit.requestsPerDay) {
      console.warn('[RateLimiter] ⚠️ Limite diário de requisições atingido')
      return false
    }

    // Limite por segundo
    const oneSecondAgo = now - 1000
    this.requests = this.requests.filter(time => time > oneSecondAgo)
    
    if (this.requests.length >= erpConfig.rateLimit.requestsPerSecond) {
      console.warn('[RateLimiter] ⚠️ Limite de requisições por segundo atingido')
      return false
    }

    return true
  }

  recordRequest(): void {
    this.requests.push(Date.now())
    this.dailyRequests++
  }
}

export class ERPIntegrationService {
  private cache = new Cache()
  private rateLimiter = new RateLimiter()

  constructor() {
    console.log('[ERPIntegrationService] Inicializando serviço de integração com ERP')
    validateERPConfig()
  }

  // Função genérica para fazer requisições ao ERP
  private async makeERPRequest<T>(
    endpoint: string, 
    params: Record<string, any> = {},
    useCache: boolean = true,
    cacheKey?: string
  ): Promise<T> {
    console.log(`[ERPIntegrationService] Fazendo requisição para: ${endpoint}`)

    // Verificar se as credenciais estão configuradas
    if (!validateERPConfig()) {
      throw new Error('Credenciais do ERP não configuradas')
    }

    // Verificar rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit excedido - tente novamente em alguns segundos')
    }

    // Verificar cache
    if (useCache && cacheKey) {
      const cachedData = this.cache.get<T>(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    try {
      // Construir URL com parâmetros
      const url = new URL(`${erpConfig.baseUrl}${endpoint}`)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })

      console.log(`[ERPIntegrationService] URL completa: ${url.toString()}`)

      // Fazer requisição
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getERPHeaders(),
        signal: AbortSignal.timeout(erpConfig.timeout)
      })

      // Registrar requisição no rate limiter
      this.rateLimiter.recordRequest()

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de requisições atingido - tente novamente em alguns segundos')
        }
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as ERPResponse<T>
      
      console.log(`[ERPIntegrationService] Resposta recebida - Status: ${data.status}, Code: ${data.code}`)

      if (data.status !== 'success') {
        throw new Error(`Erro na API do ERP: ${data.status}`)
      }

      // Armazenar no cache se solicitado
      if (useCache && cacheKey) {
        this.cache.set(cacheKey, data.data, 300000) // 5 minutos
      }

      return data.data

    } catch (error) {
      console.error(`[ERPIntegrationService] Erro na requisição para ${endpoint}:`, error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout na requisição ao ERP')
        }
        throw error
      }
      
      throw new Error('Erro desconhecido na integração com ERP')
    }
  }

  // Buscar produtos do ERP
  async getProdutos(filtros: ERPProdutoFiltros = {}): Promise<ERPProduto[]> {
    console.log('[ERPIntegrationService] Buscando produtos do ERP')
    
    // Se as credenciais não estiverem configuradas, retornar dados mock
    if (!validateERPConfig()) {
      console.log('[ERPIntegrationService] Usando dados mock para produtos')
      return this.getMockProdutos(filtros)
    }
    
    const cacheKey = `produtos_${JSON.stringify(filtros)}`
    
    try {
      return await this.makeERPRequest<ERPProduto[]>(
        '/produtos',
        filtros,
        true,
        cacheKey
      )
    } catch (error) {
      console.error('[ERPIntegrationService] Erro ao buscar produtos:', error)
      throw error
    }
  }

  // Buscar vendas do ERP
  async getVendas(filtros: ERPVendaFiltros = {}): Promise<ERPVenda[]> {
    console.log('[ERPIntegrationService] Buscando vendas do ERP')
    
    // Se as credenciais não estiverem configuradas, retornar dados mock
    if (!validateERPConfig()) {
      console.log('[ERPIntegrationService] Usando dados mock para vendas')
      return this.getMockVendas(filtros)
    }
    
    const cacheKey = `vendas_${JSON.stringify(filtros)}`
    
    try {
      return await this.makeERPRequest<ERPVenda[]>(
        '/vendas',
        filtros,
        true,
        cacheKey
      )
    } catch (error) {
      console.error('[ERPIntegrationService] Erro ao buscar vendas:', error)
      throw error
    }
  }

  // Buscar clientes do ERP
  async getClientes(filtros: ERPClienteFiltros = {}): Promise<ERPCliente[]> {
    console.log('[ERPIntegrationService] Buscando clientes do ERP')
    
    // Se as credenciais não estiverem configuradas, retornar dados mock
    if (!validateERPConfig()) {
      console.log('[ERPIntegrationService] Usando dados mock para clientes')
      return this.getMockClientes(filtros)
    }
    
    const cacheKey = `clientes_${JSON.stringify(filtros)}`
    
    try {
      return await this.makeERPRequest<ERPCliente[]>(
        '/clientes',
        filtros,
        true,
        cacheKey
      )
    } catch (error) {
      console.error('[ERPIntegrationService] Erro ao buscar clientes:', error)
      throw error
    }
  }

  // Dados mock para clientes
  private getMockClientes(filtros: ERPClienteFiltros = {}): ERPCliente[] {
    const mockClientes: ERPCliente[] = [
      {
        id: "1",
        tipo_pessoa: "PF",
        nome: "João Silva",
        razao_social: null,
        cnpj: null,
        inscricao_estadual: null,
        inscricao_municipal: null,
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        data_nascimento: "1985-03-15",
        telefone: "(11) 9999-9999",
        celular: "(11) 8888-8888",
        fax: null,
        email: "joao.silva@email.com",
        ativo: "1",
        contatos: [
          {
            contato: {
              tipo_id: "1",
              nome_tipo: "Email",
              nome: "Contato Principal",
              contato: "joao.silva@email.com",
              cargo: "Cliente",
              observacao: "Cliente preferencial"
            }
          }
        ],
        enderecos: [
          {
            endereco: {
              cep: "01234-567",
              logradouro: "Rua das Flores",
              numero: "123",
              complemento: "Apto 45",
              bairro: "Centro",
              cidade_id: "1",
              nome_cidade: "São Paulo",
              estado: "SP"
            }
          }
        ]
      },
      {
        id: "2",
        tipo_pessoa: "PJ",
        nome: "Empresa ABC Ltda",
        razao_social: "Empresa ABC Comércio e Serviços Ltda",
        cnpj: "12.345.678/0001-90",
        inscricao_estadual: "123456789",
        inscricao_municipal: "987654321",
        cpf: null,
        rg: null,
        data_nascimento: null,
        telefone: "(11) 7777-7777",
        celular: "(11) 6666-6666",
        fax: "(11) 5555-5555",
        email: "contato@empresaabc.com.br",
        ativo: "1",
        contatos: [
          {
            contato: {
              tipo_id: "1",
              nome_tipo: "Email",
              nome: "Maria Santos",
              contato: "maria@empresaabc.com.br",
              cargo: "Gerente Comercial",
              observacao: "Responsável por compras"
            }
          }
        ],
        enderecos: [
          {
            endereco: {
              cep: "04567-890",
              logradouro: "Av. Paulista",
              numero: "1000",
              complemento: "Sala 100",
              bairro: "Bela Vista",
              cidade_id: "1",
              nome_cidade: "São Paulo",
              estado: "SP"
            }
          }
        ]
      },
      {
        id: "3",
        tipo_pessoa: "PF",
        nome: "Ana Costa",
        razao_social: null,
        cnpj: null,
        inscricao_estadual: null,
        inscricao_municipal: null,
        cpf: "987.654.321-00",
        rg: "98.765.432-1",
        data_nascimento: "1990-07-22",
        telefone: "(21) 3333-3333",
        celular: "(21) 4444-4444",
        fax: null,
        email: "ana.costa@email.com",
        ativo: "1",
        contatos: [
          {
            contato: {
              tipo_id: "1",
              nome_tipo: "Email",
              nome: "Contato Principal",
              contato: "ana.costa@email.com",
              cargo: "Cliente",
              observacao: "Cliente VIP"
            }
          }
        ],
        enderecos: [
          {
            endereco: {
              cep: "20000-000",
              logradouro: "Rua do Comércio",
              numero: "456",
              complemento: "Casa",
              bairro: "Centro",
              cidade_id: "2",
              nome_cidade: "Rio de Janeiro",
              estado: "RJ"
            }
          }
        ]
      }
    ]

    // Aplicar filtros básicos
    let clientesFiltrados = mockClientes

    if (filtros.nome) {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.nome.toLowerCase().includes(filtros.nome!.toLowerCase())
      )
    }

    if (filtros.tipo_pessoa) {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.tipo_pessoa === filtros.tipo_pessoa
      )
    }

    if (filtros.situacao !== undefined) {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.ativo === (filtros.situacao === 1 ? "1" : "0")
      )
    }

    return clientesFiltrados
  }

  // Buscar produto específico por ID
  async getProdutoById(id: string): Promise<ERPProduto> {
    console.log(`[ERPIntegrationService] Buscando produto por ID: ${id}`)
    
    const cacheKey = `produto_${id}`
    
    try {
      return await this.makeERPRequest<ERPProduto>(
        `/produtos/${id}`,
        {},
        true,
        cacheKey
      )
    } catch (error) {
      console.error(`[ERPIntegrationService] Erro ao buscar produto ${id}:`, error)
      throw error
    }
  }

  // Buscar venda específica por ID
  async getVendaById(id: string): Promise<ERPVenda> {
    console.log(`[ERPIntegrationService] Buscando venda por ID: ${id}`)
    
    const cacheKey = `venda_${id}`
    
    try {
      return await this.makeERPRequest<ERPVenda>(
        `/vendas/${id}`,
        {},
        true,
        cacheKey
      )
    } catch (error) {
      console.error(`[ERPIntegrationService] Erro ao buscar venda ${id}:`, error)
      throw error
    }
  }

  // Buscar cliente específico por ID
  async getClienteById(id: string): Promise<ERPCliente> {
    console.log(`[ERPIntegrationService] Buscando cliente por ID: ${id}`)
    
    const cacheKey = `cliente_${id}`
    
    try {
      return await this.makeERPRequest<ERPCliente>(
        `/clientes/${id}`,
        {},
        true,
        cacheKey
      )
    } catch (error) {
      console.error(`[ERPIntegrationService] Erro ao buscar cliente ${id}:`, error)
      throw error
    }
  }

  // Limpar cache
  clearCache(): void {
    console.log('[ERPIntegrationService] Limpando cache')
    this.cache.clear()
  }

  // Verificar status da integração
  async checkConnection(): Promise<boolean> {
    console.log('[ERPIntegrationService] Verificando conexão com ERP')
    
    try {
      // Tentar buscar uma lista vazia de produtos para testar a conexão
      await this.makeERPRequest<ERPProduto[]>(
        '/produtos',
        { limite_por_pagina: 1 },
        false // Não usar cache para teste de conexão
      )
      
      console.log('[ERPIntegrationService] ✅ Conexão com ERP estabelecida')
      return true
    } catch (error) {
      console.error('[ERPIntegrationService] ❌ Erro na conexão com ERP:', error)
      return false
    }
  }

  // Dados mock para produtos
  private getMockProdutos(filtros: ERPProdutoFiltros = {}): ERPProduto[] {
    const mockProdutos: ERPProduto[] = [
      {
        id: "1",
        nome: "Notebook Dell Inspiron",
        codigo_interno: "NB001",
        codigo_barra: "7891234567890",
        possui_variacao: "0",
        possui_composicao: "0",
        movimenta_estoque: "1",
        peso: "2.5",
        largura: "35",
        altura: "2",
        comprimento: "25",
        ativo: "1",
        grupo_id: "1",
        nome_grupo: "Informática",
        descricao: "Notebook Dell Inspiron 15 polegadas, Intel i5, 8GB RAM, 256GB SSD",
        estoque: 15,
        valor_custo: "2500.00",
        valor_venda: "3200.00",
        valores: [
          {
            tipo_id: "1",
            nome_tipo: "Venda",
            lucro_utilizado: "28.00",
            valor_custo: "2500.00",
            valor_venda: "3200.00"
          }
        ],
        variacoes: [],
        fiscal: {
          ncm: "8471.30.00",
          cest: "",
          peso_liquido: "2.5",
          peso_bruto: "3.0",
          valor_aproximado_tributos: "320.00",
          valor_fixo_pis: "0.00",
          valor_fixo_pis_st: "0.00",
          valor_fixo_confins: "0.00",
          valor_fixo_confins_st: "0.00"
        }
      },
      {
        id: "2",
        nome: "Mouse Wireless Logitech",
        codigo_interno: "MS002",
        codigo_barra: "7891234567891",
        possui_variacao: "0",
        possui_composicao: "0",
        movimenta_estoque: "1",
        peso: "0.1",
        largura: "6",
        altura: "3",
        comprimento: "12",
        ativo: "1",
        grupo_id: "1",
        nome_grupo: "Informática",
        descricao: "Mouse wireless Logitech com sensor óptico de alta precisão",
        estoque: 50,
        valor_custo: "45.00",
        valor_venda: "89.90",
        valores: [
          {
            tipo_id: "1",
            nome_tipo: "Venda",
            lucro_utilizado: "99.78",
            valor_custo: "45.00",
            valor_venda: "89.90"
          }
        ],
        variacoes: [],
        fiscal: {
          ncm: "8471.60.00",
          cest: "",
          peso_liquido: "0.1",
          peso_bruto: "0.15",
          valor_aproximado_tributos: "9.00",
          valor_fixo_pis: "0.00",
          valor_fixo_pis_st: "0.00",
          valor_fixo_confins: "0.00",
          valor_fixo_confins_st: "0.00"
        }
      },
      {
        id: "3",
        nome: "Teclado Mecânico RGB",
        codigo_interno: "TC003",
        codigo_barra: "7891234567892",
        possui_variacao: "0",
        possui_composicao: "0",
        movimenta_estoque: "1",
        peso: "0.8",
        largura: "44",
        altura: "3",
        comprimento: "15",
        ativo: "1",
        grupo_id: "1",
        nome_grupo: "Informática",
        descricao: "Teclado mecânico com switches Cherry MX Blue e iluminação RGB",
        estoque: 25,
        valor_custo: "180.00",
        valor_venda: "299.90",
        valores: [
          {
            tipo_id: "1",
            nome_tipo: "Venda",
            lucro_utilizado: "66.61",
            valor_custo: "180.00",
            valor_venda: "299.90"
          }
        ],
        variacoes: [],
        fiscal: {
          ncm: "8471.60.00",
          cest: "",
          peso_liquido: "0.8",
          peso_bruto: "1.0",
          valor_aproximado_tributos: "30.00",
          valor_fixo_pis: "0.00",
          valor_fixo_pis_st: "0.00",
          valor_fixo_confins: "0.00",
          valor_fixo_confins_st: "0.00"
        }
      }
    ]

    // Aplicar filtros básicos
    let produtosFiltrados = mockProdutos

    if (filtros.nome) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.nome.toLowerCase().includes(filtros.nome!.toLowerCase())
      )
    }

    if (filtros.codigo) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.codigo_interno.toLowerCase().includes(filtros.codigo!.toLowerCase())
      )
    }

    if (filtros.ativo !== undefined) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.ativo === (filtros.ativo === 1 ? "1" : "0")
      )
    }

    return produtosFiltrados
  }

  // Dados mock para vendas
  private getMockVendas(filtros: ERPVendaFiltros = {}): ERPVenda[] {
    const mockVendas: ERPVenda[] = [
      {
        id: "1",
        codigo: "V001",
        cliente_id: "1",
        nome_cliente: "João Silva",
        vendedor_id: "1",
        nome_vendedor: "Maria Vendedora",
        tecnico_id: null,
        nome_tecnico: null,
        data: "2025-07-01",
        previsao_entrega: null,
        situacao_id: "1",
        nome_situacao: "Finalizada",
        valor_total: "1500.00",
        transportadora_id: null,
        nome_transportadora: null,
        centro_custo_id: "1",
        nome_centro_custo: "Vendas",
        aos_cuidados_de: null,
        validade: null,
        introducao: null,
        observacoes: "Venda realizada com sucesso",
        observacoes_interna: null,
        valor_frete: "0.00",
        nome_canal_venda: "Site",
        nome_loja: "Loja Principal",
        valor_custo: "1200.00",
        condicao_pagamento: "À vista",
        situacao_financeiro: "Pago",
        situacao_estoque: "Separado",
        forma_pagamento_id: "1",
        data_primeira_parcela: "2025-07-01",
        numero_parcelas: "1",
        intervalo_dias: "0",
        hash: "abc123",
        equipamentos: [],
        pagamentos: [
          {
            pagamento: {
              data_vencimento: "2025-07-01",
              valor: "1500.00",
              forma_pagamento_id: "1",
              nome_forma_pagamento: "Cartão de Crédito",
              plano_contas_id: "1",
              nome_plano_conta: "Receita de Vendas",
              observacao: "Pagamento à vista"
            }
          }
        ],
        produtos: [
          {
            produto: {
              produto_id: 1,
              variacao_id: 0,
              nome_produto: "Notebook Dell Inspiron",
              detalhes: "Notebook Dell Inspiron 15 polegadas",
              movimenta_estoque: "1",
              possui_variacao: "0",
              sigla_unidade: "UN",
              quantidade: "1",
              tipo_valor_id: "1",
              nome_tipo_valor: "Venda",
              valor_custo: "1200.00",
              valor_venda: "1500.00",
              tipo_desconto: "0",
              desconto_valor: null,
              desconto_porcentagem: null,
              valor_total: "1500.00"
            }
          }
        ],
        servicos: []
      },
      {
        id: "2",
        codigo: "V002",
        cliente_id: "2",
        nome_cliente: "Empresa ABC Ltda",
        vendedor_id: "1",
        nome_vendedor: "Maria Vendedora",
        tecnico_id: null,
        nome_tecnico: null,
        data: "2025-07-02",
        previsao_entrega: null,
        situacao_id: "1",
        nome_situacao: "Finalizada",
        valor_total: "2500.00",
        transportadora_id: null,
        nome_transportadora: null,
        centro_custo_id: "1",
        nome_centro_custo: "Vendas",
        aos_cuidados_de: null,
        validade: null,
        introducao: null,
        observacoes: "Venda para empresa",
        observacoes_interna: null,
        valor_frete: "50.00",
        nome_canal_venda: "Telefone",
        nome_loja: "Loja Principal",
        valor_custo: "2000.00",
        condicao_pagamento: "30 dias",
        situacao_financeiro: "Pendente",
        situacao_estoque: "Separado",
        forma_pagamento_id: "2",
        data_primeira_parcela: "2025-08-02",
        numero_parcelas: "1",
        intervalo_dias: "30",
        hash: "def456",
        equipamentos: [],
        pagamentos: [
          {
            pagamento: {
              data_vencimento: "2025-08-02",
              valor: "2500.00",
              forma_pagamento_id: "2",
              nome_forma_pagamento: "Boleto Bancário",
              plano_contas_id: "1",
              nome_plano_conta: "Receita de Vendas",
              observacao: "Pagamento em 30 dias"
            }
          }
        ],
        produtos: [
          {
            produto: {
              produto_id: 2,
              variacao_id: 0,
              nome_produto: "Mouse Wireless Logitech",
              detalhes: "Mouse wireless com sensor óptico",
              movimenta_estoque: "1",
              possui_variacao: "0",
              sigla_unidade: "UN",
              quantidade: "5",
              tipo_valor_id: "1",
              nome_tipo_valor: "Venda",
              valor_custo: "40.00",
              valor_venda: "50.00",
              tipo_desconto: "0",
              desconto_valor: null,
              desconto_porcentagem: null,
              valor_total: "250.00"
            }
          },
          {
            produto: {
              produto_id: 3,
              variacao_id: 0,
              nome_produto: "Teclado Mecânico RGB",
              detalhes: "Teclado mecânico com switches Cherry MX",
              movimenta_estoque: "1",
              possui_variacao: "0",
              sigla_unidade: "UN",
              quantidade: "3",
              tipo_valor_id: "1",
              nome_tipo_valor: "Venda",
              valor_custo: "180.00",
              valor_venda: "250.00",
              tipo_desconto: "0",
              desconto_valor: null,
              desconto_porcentagem: null,
              valor_total: "750.00"
            }
          }
        ],
        servicos: []
      },
      {
        id: "3",
        codigo: "V003",
        cliente_id: "3",
        nome_cliente: "Ana Costa",
        vendedor_id: "2",
        nome_vendedor: "João Vendedor",
        tecnico_id: null,
        nome_tecnico: null,
        data: "2025-07-03",
        previsao_entrega: null,
        situacao_id: "2",
        nome_situacao: "Em Processamento",
        valor_total: "800.00",
        transportadora_id: null,
        nome_transportadora: null,
        centro_custo_id: "1",
        nome_centro_custo: "Vendas",
        aos_cuidados_de: null,
        validade: null,
        introducao: null,
        observacoes: "Venda online",
        observacoes_interna: null,
        valor_frete: "0.00",
        nome_canal_venda: "Site",
        nome_loja: "Loja Online",
        valor_custo: "600.00",
        condicao_pagamento: "À vista",
        situacao_financeiro: "Pago",
        situacao_estoque: "Em Separação",
        forma_pagamento_id: "1",
        data_primeira_parcela: "2025-07-03",
        numero_parcelas: "1",
        intervalo_dias: "0",
        hash: "ghi789",
        equipamentos: [],
        pagamentos: [
          {
            pagamento: {
              data_vencimento: "2025-07-03",
              valor: "800.00",
              forma_pagamento_id: "1",
              nome_forma_pagamento: "PIX",
              plano_contas_id: "1",
              nome_plano_conta: "Receita de Vendas",
              observacao: "Pagamento via PIX"
            }
          }
        ],
        produtos: [
          {
            produto: {
              produto_id: 2,
              variacao_id: 0,
              nome_produto: "Mouse Wireless Logitech",
              detalhes: "Mouse wireless com sensor óptico",
              movimenta_estoque: "1",
              possui_variacao: "0",
              sigla_unidade: "UN",
              quantidade: "2",
              tipo_valor_id: "1",
              nome_tipo_valor: "Venda",
              valor_custo: "40.00",
              valor_venda: "50.00",
              tipo_desconto: "0",
              desconto_valor: null,
              desconto_porcentagem: null,
              valor_total: "100.00"
            }
          }
        ],
        servicos: [
          {
            servico: {
              id: "1",
              servico_id: "1",
              nome_servico: "Instalação de Software",
              detalhes: "Instalação e configuração de software",
              sigla_unidade: "H",
              quantidade: "2",
              tipo_valor_id: "1",
              nome_tipo_valor: "Venda",
              valor_custo: "50.00",
              valor_venda: "100.00",
              tipo_desconto: "0",
              desconto_valor: null,
              desconto_porcentagem: null,
              valor_total: "200.00"
            }
          }
        ]
      }
    ]

    // Aplicar filtros básicos
    let vendasFiltradas = mockVendas

    if (filtros.data_inicio) {
      vendasFiltradas = vendasFiltradas.filter(venda => 
        venda.data >= filtros.data_inicio!
      )
    }

    if (filtros.data_fim) {
      vendasFiltradas = vendasFiltradas.filter(venda => 
        venda.data <= filtros.data_fim!
      )
    }

    if (filtros.cliente_id) {
      vendasFiltradas = vendasFiltradas.filter(venda => 
        venda.cliente_id === filtros.cliente_id!.toString()
      )
    }

    return vendasFiltradas
  }
} 