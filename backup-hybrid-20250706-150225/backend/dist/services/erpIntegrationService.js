"use strict";
// Serviço de integração com ERP GestãoClick
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPIntegrationService = void 0;
const erpConfig_1 = require("../config/erpConfig");
class Cache {
    constructor() {
        this.cache = new Map();
    }
    set(key, data, ttl = 300000) {
        console.log(`[Cache] Armazenando dados para chave: ${key}`);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            console.log(`[Cache] Cache miss para chave: ${key}`);
            return null;
        }
        const isExpired = Date.now() - item.timestamp > item.ttl;
        if (isExpired) {
            console.log(`[Cache] Cache expirado para chave: ${key}`);
            this.cache.delete(key);
            return null;
        }
        console.log(`[Cache] Cache hit para chave: ${key}`);
        return item.data;
    }
    clear() {
        console.log('[Cache] Limpando cache');
        this.cache.clear();
    }
}
// Rate limiter simples
class RateLimiter {
    constructor() {
        this.requests = [];
        this.dailyRequests = 0;
        this.lastReset = Date.now();
    }
    canMakeRequest() {
        const now = Date.now();
        // Reset diário
        if (now - this.lastReset > 24 * 60 * 60 * 1000) {
            this.dailyRequests = 0;
            this.lastReset = now;
        }
        // Limite diário
        if (this.dailyRequests >= erpConfig_1.erpConfig.rateLimit.requestsPerDay) {
            console.warn('[RateLimiter] ⚠️ Limite diário de requisições atingido');
            return false;
        }
        // Limite por segundo
        const oneSecondAgo = now - 1000;
        this.requests = this.requests.filter(time => time > oneSecondAgo);
        if (this.requests.length >= erpConfig_1.erpConfig.rateLimit.requestsPerSecond) {
            console.warn('[RateLimiter] ⚠️ Limite de requisições por segundo atingido');
            return false;
        }
        return true;
    }
    recordRequest() {
        this.requests.push(Date.now());
        this.dailyRequests++;
    }
}
class ERPIntegrationService {
    constructor() {
        this.cache = new Cache();
        this.rateLimiter = new RateLimiter();
        console.log('[ERPIntegrationService] Inicializando serviço de integração com ERP');
        (0, erpConfig_1.validateERPConfig)();
    }
    // Função genérica para fazer requisições ao ERP
    async makeERPRequest(endpoint, params = {}, useCache = true, cacheKey) {
        console.log(`[ERPIntegrationService] Fazendo requisição para: ${endpoint}`);
        // Verificar se as credenciais estão configuradas
        if (!(0, erpConfig_1.validateERPConfig)()) {
            throw new Error('Credenciais do ERP não configuradas');
        }
        // Verificar rate limiting
        if (!this.rateLimiter.canMakeRequest()) {
            throw new Error('Rate limit excedido - tente novamente em alguns segundos');
        }
        // Verificar cache
        if (useCache && cacheKey) {
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }
        try {
            // Construir URL com parâmetros
            const url = new URL(`${erpConfig_1.erpConfig.baseUrl}${endpoint}`);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value.toString());
                }
            });
            console.log(`[ERPIntegrationService] URL completa: ${url.toString()}`);
            // Fazer requisição
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: (0, erpConfig_1.getERPHeaders)(),
                signal: AbortSignal.timeout(erpConfig_1.erpConfig.timeout)
            });
            // Registrar requisição no rate limiter
            this.rateLimiter.recordRequest();
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Limite de requisições atingido - tente novamente em alguns segundos');
                }
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`[ERPIntegrationService] Resposta recebida - Status: ${data.status}, Code: ${data.code}`);
            if (data.status !== 'success') {
                throw new Error(`Erro na API do ERP: ${data.status}`);
            }
            // Armazenar no cache se solicitado
            if (useCache && cacheKey) {
                this.cache.set(cacheKey, data.data, 300000); // 5 minutos
            }
            return data.data;
        }
        catch (error) {
            console.error(`[ERPIntegrationService] Erro na requisição para ${endpoint}:`, error);
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Timeout na requisição ao ERP');
                }
                throw error;
            }
            throw new Error('Erro desconhecido na integração com ERP');
        }
    }
    // Buscar produtos do ERP
    async getProdutos(filtros = {}) {
        console.log('[ERPIntegrationService] Buscando produtos do ERP');
        const cacheKey = `produtos_${JSON.stringify(filtros)}`;
        try {
            return await this.makeERPRequest('/produtos', filtros, true, cacheKey);
        }
        catch (error) {
            console.error('[ERPIntegrationService] Erro ao buscar produtos:', error);
            throw error;
        }
    }
    // Buscar vendas do ERP
    async getVendas(filtros = {}) {
        console.log('[ERPIntegrationService] Buscando vendas do ERP');
        const cacheKey = `vendas_${JSON.stringify(filtros)}`;
        try {
            return await this.makeERPRequest('/vendas', filtros, true, cacheKey);
        }
        catch (error) {
            console.error('[ERPIntegrationService] Erro ao buscar vendas:', error);
            throw error;
        }
    }
    // Buscar clientes do ERP
    async getClientes(filtros = {}) {
        console.log('[ERPIntegrationService] Buscando clientes do ERP');
        const cacheKey = `clientes_${JSON.stringify(filtros)}`;
        try {
            return await this.makeERPRequest('/clientes', filtros, true, cacheKey);
        }
        catch (error) {
            console.error('[ERPIntegrationService] Erro ao buscar clientes:', error);
            throw error;
        }
    }
    // Buscar produto específico por ID
    async getProdutoById(id) {
        console.log(`[ERPIntegrationService] Buscando produto por ID: ${id}`);
        const cacheKey = `produto_${id}`;
        try {
            return await this.makeERPRequest(`/produtos/${id}`, {}, true, cacheKey);
        }
        catch (error) {
            console.error(`[ERPIntegrationService] Erro ao buscar produto ${id}:`, error);
            throw error;
        }
    }
    // Buscar venda específica por ID
    async getVendaById(id) {
        console.log(`[ERPIntegrationService] Buscando venda por ID: ${id}`);
        const cacheKey = `venda_${id}`;
        try {
            return await this.makeERPRequest(`/vendas/${id}`, {}, true, cacheKey);
        }
        catch (error) {
            console.error(`[ERPIntegrationService] Erro ao buscar venda ${id}:`, error);
            throw error;
        }
    }
    // Buscar cliente específico por ID
    async getClienteById(id) {
        console.log(`[ERPIntegrationService] Buscando cliente por ID: ${id}`);
        const cacheKey = `cliente_${id}`;
        try {
            return await this.makeERPRequest(`/clientes/${id}`, {}, true, cacheKey);
        }
        catch (error) {
            console.error(`[ERPIntegrationService] Erro ao buscar cliente ${id}:`, error);
            throw error;
        }
    }
    // Limpar cache
    clearCache() {
        console.log('[ERPIntegrationService] Limpando cache');
        this.cache.clear();
    }
    // Verificar status da integração
    async checkConnection() {
        console.log('[ERPIntegrationService] Verificando conexão com ERP');
        try {
            // Tentar buscar uma lista vazia de produtos para testar a conexão
            await this.makeERPRequest('/produtos', { limite_por_pagina: 1 }, false // Não usar cache para teste de conexão
            );
            console.log('[ERPIntegrationService] ✅ Conexão com ERP estabelecida');
            return true;
        }
        catch (error) {
            console.error('[ERPIntegrationService] ❌ Erro na conexão com ERP:', error);
            return false;
        }
    }
}
exports.ERPIntegrationService = ERPIntegrationService;
//# sourceMappingURL=erpIntegrationService.js.map