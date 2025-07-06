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
} 