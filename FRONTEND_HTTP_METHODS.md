# Documentação dos Métodos HTTP do Frontend

## Visão Geral

Este documento descreve todos os métodos HTTP (GET, POST, PUT, DELETE) que o frontend faz para o backend do sistema de Painel KPI. O frontend utiliza a API nativa `fetch()` do navegador através de uma classe `ApiService` centralizada.

**Base URL:** `http://localhost:3001/api`

## 🔧 **Classe ApiService**

### Configuração Base
```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const api = new ApiService(API_BASE_URL)
```

### Métodos HTTP Disponíveis
```typescript
class ApiService {
  // GET - Buscar dados
  async get<T>(endpoint: string): Promise<T>
  
  // POST - Criar/enviar dados
  async post<T>(endpoint: string, data: any): Promise<T>
  
  // PUT - Atualizar dados
  async put<T>(endpoint: string, data: any): Promise<T>
  
  // DELETE - Remover dados
  async delete<T>(endpoint: string): Promise<T>
}
```

---

## 📊 **1. MÉTODOS GET (Buscar Dados)**

### **1.1 Dashboard Service**

#### `GET /api/dashboard/analytics`
**Descrição:** KPIs principais do dashboard com filtros temporais

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 277
async getDashboardAnalytics(queryString: string = ''): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>(`/api/dashboard/analytics${queryString}`)
}
```

**Uso no Frontend:**
```typescript
// frontend/src/pages/Dashboard.tsx - Linha 56
const response = await service.getDashboardAnalytics(params)
```

**Exemplo de URL Gerada:**
```
GET http://localhost:3001/api/dashboard/analytics?dataInicio=2024-01-01&dataFim=2024-01-31
```

#### `GET /api/dashboard/system/status`
**Descrição:** Status do sistema e integrações

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 282
async getSystemStatus(): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>('/api/dashboard/system/status')
}
```

#### `GET /api/dashboard/alerts/summary`
**Descrição:** Resumo de alertas do sistema

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 287
async getAlertsSummary(): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>('/api/dashboard/alerts/summary')
}
```

### **1.2 Vendas Service**

#### `GET /api/vendas`
**Descrição:** Listar vendas com filtros e paginação

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linhas 144-165
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
```

**Exemplo de URL Gerada:**
```
GET http://localhost:3001/api/vendas?dataInicio=2024-01-01&dataFim=2024-01-31&page=1&limit=20&status=Aprovada
```

#### `GET /api/vendas/:id`
**Descrição:** Buscar venda específica por ID

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 167
async getVendaById(id: string): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>(`/api/vendas/${id}`)
}
```

#### `GET /api/vendas/analytics/geral`
**Descrição:** Analytics gerais de vendas

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linhas 169-185
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
```

#### `GET /api/vendas/analytics/periodo`
**Descrição:** Vendas por período específico

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 187
async getVendasPorPeriodo(dataInicio: string, dataFim: string): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>(`/api/vendas/analytics/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`)
}
```

#### `GET /api/vendas/status/lista`
**Descrição:** Listar status disponíveis

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 190
async getStatusLista(): Promise<ApiResponse<string[]>> {
  return api.get<ApiResponse<string[]>>('/api/vendas/status/lista')
}
```

### **1.3 Clientes Service**

#### `GET /api/clientes`
**Descrição:** Listar clientes com filtros e paginação

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linhas 205-225
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
```

**Exemplo de URL Gerada:**
```
GET http://localhost:3001/api/clientes?tipoPessoa=PJ&ativo=true&page=1&limit=20
```

#### `GET /api/clientes/:id`
**Descrição:** Buscar cliente específico por ID

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 233
async getClienteById(id: string): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>(`/api/clientes/${id}`)
}
```

#### `GET /api/clientes/analytics/geral`
**Descrição:** Analytics gerais de clientes

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 238
async getClientesAnalytics(): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>('/api/clientes/analytics/geral')
}
```

#### `GET /api/clientes/analytics/rfm`
**Descrição:** Análise RFM

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 243
async getRFMAnalytics(): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>('/api/clientes/analytics/rfm')
}
```

#### `GET /api/clientes/tipos/lista`
**Descrição:** Listar tipos de pessoa

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 248
async getTiposLista(): Promise<ApiResponse<any[]>> {
  return api.get<ApiResponse<any[]>>('/api/clientes/tipos/lista')
}
```

#### `GET /api/clientes/estados/lista`
**Descrição:** Listar estados disponíveis

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 253
async getEstadosLista(): Promise<ApiResponse<string[]>> {
  return api.get<ApiResponse<string[]>>('/api/clientes/estados/lista')
}
```

#### `GET /api/clientes/cidades/lista`
**Descrição:** Listar cidades por estado

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 258
async getCidadesLista(estado: string): Promise<ApiResponse<string[]>> {
  return api.get<ApiResponse<string[]>>(`/api/clientes/cidades/lista?estado=${estado}`)
}
```

### **1.4 Produtos Service**

#### `GET /api/produtos`
**Descrição:** Lista de produtos com filtros e paginação

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linhas 101-120
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
```

**Exemplo de URL Gerada:**
```
GET http://localhost:3001/api/produtos?categoria=Eletrônicos&page=1&limit=20
```

#### `GET /api/produtos/top`
**Descrição:** Produtos mais vendidos

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 122
async getTopProdutos(limit: number = 10): Promise<ApiResponse<any[]>> {
  return api.get<ApiResponse<any[]>>(`/api/produtos/top?limit=${limit}`)
}
```

#### `GET /api/produtos/sazonalidade`
**Descrição:** Análise de sazonalidade

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 127
async getSazonalidade(periodo: string = 'ano-atual'): Promise<ApiResponse<any[]>> {
  return api.get<ApiResponse<any[]>>(`/api/produtos/sazonalidade?periodo=${periodo}`)
}
```

#### `GET /api/produtos/matriz-abc`
**Descrição:** Matriz ABC de produtos

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 132
async getMatrizABC(): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>('/api/produtos/matriz-abc')
}
```

#### `GET /api/produtos/categorias`
**Descrição:** Lista de categorias

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 137
async getCategorias(): Promise<ApiResponse<string[]>> {
  return api.get<ApiResponse<string[]>>('/api/produtos/categorias')
}
```

### **1.5 ERP Service**

#### `GET /api/erp/status`
**Descrição:** Verificar status da conexão com ERP

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 265
async getStatus(): Promise<ApiResponse<any>> {
  return api.get<ApiResponse<any>>('/api/erp/status')
}
```

---

## 📝 **2. MÉTODOS POST (Criar/Enviar Dados)**

### **2.1 ERP Service**

#### `POST /api/erp/cache/clear`
**Descrição:** Limpar cache do ERP

**Implementação:**
```typescript
// frontend/src/lib/api.ts - Linha 270
async clearCache(): Promise<ApiResponse<any>> {
  return api.post<ApiResponse<any>>('/api/erp/cache/clear', {})
}
```

**Body da Requisição:**
```json
{}
```

**Exemplo de Uso:**
```typescript
// Limpar cache do ERP
const response = await erpService.clearCache()
```

### **2.2 System Service (Backend - Não implementado no frontend ainda)**

#### `POST /api/system/cache/clear`
**Descrição:** Limpar cache do sistema

**Body da Requisição:**
```json
{
  "pattern": "*" // opcional - padrão para limpar
}
```

#### `POST /api/system/sync/trigger`
**Descrição:** Forçar sincronização manual

**Body da Requisição:**
```json
{
  "entity": "vendas" // opcional - entidade específica
}
```

---

## 🔄 **3. MÉTODOS PUT (Atualizar Dados)**

### **Status Atual:**
❌ **Nenhum método PUT implementado no frontend**

**Motivo:** O sistema atual é somente leitura (read-only) em relação ao ERP. Todas as operações de escrita são feitas diretamente no ERP GestãoClick, e o backend apenas sincroniza os dados.

**Possíveis Implementações Futuras:**
```typescript
// Exemplo de como seria implementado se necessário
export class VendasService {
  async updateVenda(id: string, data: any): Promise<ApiResponse<any>> {
    return api.put<ApiResponse<any>>(`/api/vendas/${id}`, data)
  }
}

export class ClientesService {
  async updateCliente(id: string, data: any): Promise<ApiResponse<any>> {
    return api.put<ApiResponse<any>>(`/api/clientes/${id}`, data)
  }
}

export class ProdutosService {
  async updateProduto(id: string, data: any): Promise<ApiResponse<any>> {
    return api.put<ApiResponse<any>>(`/api/produtos/${id}`, data)
  }
}
```

---

## 🗑️ **4. MÉTODOS DELETE (Remover Dados)**

### **Status Atual:**
❌ **Nenhum método DELETE implementado no frontend**

**Motivo:** Mesmo motivo dos métodos PUT - o sistema é somente leitura em relação ao ERP.

**Possíveis Implementações Futuras:**
```typescript
// Exemplo de como seria implementado se necessário
export class VendasService {
  async deleteVenda(id: string): Promise<ApiResponse<any>> {
    return api.delete<ApiResponse<any>>(`/api/vendas/${id}`)
  }
}

export class ClientesService {
  async deleteCliente(id: string): Promise<ApiResponse<any>> {
    return api.delete<ApiResponse<any>>(`/api/clientes/${id}`)
  }
}

export class ProdutosService {
  async deleteProduto(id: string): Promise<ApiResponse<any>> {
    return api.delete<ApiResponse<any>>(`/api/produtos/${id}`)
  }
}
```

---

## 📊 **5. Resumo dos Métodos HTTP**

### **GET (Buscar Dados) - 25 endpoints**
| Serviço | Endpoints | Status |
|---------|-----------|--------|
| Dashboard | 3 | ✅ Implementado |
| Vendas | 6 | ✅ Implementado |
| Clientes | 7 | ✅ Implementado |
| Produtos | 5 | ✅ Implementado |
| ERP | 1 | ✅ Implementado |

### **POST (Criar/Enviar) - 1 endpoint**
| Serviço | Endpoints | Status |
|---------|-----------|--------|
| ERP | 1 | ✅ Implementado |
| System | 2 | ❌ Não implementado no frontend |

### **PUT (Atualizar) - 0 endpoints**
| Serviço | Endpoints | Status |
|---------|-----------|--------|
| Todos | 0 | ❌ Não implementado |

### **DELETE (Remover) - 0 endpoints**
| Serviço | Endpoints | Status |
|---------|-----------|--------|
| Todos | 0 | ❌ Não implementado |

---

## 🔧 **6. Implementação Técnica**

### **Classe ApiService Base**
```typescript
// frontend/src/lib/api.ts - Linhas 32-95
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
```

### **Montagem de Parâmetros**
```typescript
// Exemplo de como os parâmetros são montados
const params = new URLSearchParams()

Object.entries(filtros).forEach(([key, value]) => {
  if (value !== undefined && value !== null && value !== '') {
    params.append(key, value.toString())
  }
})

return api.get<PaginatedResponse<any>>(`/api/vendas?${params.toString()}`)
```

---

## 🎯 **7. Padrões de Uso**

### **Estrutura de Resposta Padrão**
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    pagina: number
    totalPaginas: number
    porPagina: number
  }
}
```

### **Tratamento de Erros**
```typescript
try {
  const response = await service.getData()
  // Processar dados
} catch (error) {
  console.error('Erro na requisição:', error)
  // Tratar erro
}
```

### **Logs de Debug**
```typescript
// Logs automáticos em todas as requisições
console.log(`[ApiService] GET http://localhost:3001/api/dashboard/analytics`)
console.log(`[ApiService] Response from http://localhost:3001/api/dashboard/analytics:`, data)
```

---

## 🚀 **8. Considerações Futuras**

### **Implementações Pendentes**
1. **Métodos POST para System Service**
   - `POST /api/system/cache/clear`
   - `POST /api/system/sync/trigger`

2. **Métodos PUT (se necessário)**
   - Atualização de dados no ERP
   - Sincronização bidirecional

3. **Métodos DELETE (se necessário)**
   - Remoção de dados no ERP
   - Limpeza de registros

### **Melhorias Sugeridas**
1. **Interceptors para requisições**
2. **Retry automático em falhas**
3. **Cache local com localStorage**
4. **Autenticação JWT**
5. **Rate limiting**

---

**Última atualização:** Janeiro 2024  
**Versão:** 1.0.0  
**Total de Endpoints:** 26 (25 GET + 1 POST) 