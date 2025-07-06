# Documentação das APIs do Backend

## Visão Geral

Este documento descreve todas as APIs disponíveis no backend do sistema de Painel KPI. O servidor roda na porta **3001** e todas as rotas começam com `/api/`.

**Base URL:** `http://localhost:3001/api`

## Estrutura de Resposta

Todas as APIs seguem um padrão de resposta:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... } // opcional
}
```

Em caso de erro:
```json
{
  "success": false,
  "error": "Descrição do erro",
  "message": "Mensagem detalhada"
}
```

---

## 🔍 **1. APIs de Dashboard**

### 1.1 GET `/api/dashboard/analytics`
**Descrição:** KPIs principais do dashboard com filtros temporais

**Parâmetros Query:**
- `dataInicio` (string, opcional): Data de início no formato YYYY-MM-DD
- `dataFim` (string, opcional): Data de fim no formato YYYY-MM-DD
- `periodo` (string, opcional): Período pré-definido

**Exemplo de Requisição:**
```bash
GET /api/dashboard/analytics?dataInicio=2024-01-01&dataFim=2024-01-31
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "receitaTotal": {
      "valor": 125000.50,
      "variacao": 12.5,
      "periodo": "periodo-anterior",
      "formatado": "R$ 125.000,50"
    },
    "clientesAtivos": {
      "quantidade": 150,
      "variacao": 8.2,
      "novosEsteMes": 12,
      "formatado": "150"
    },
    "produtosVendidos": {
      "quantidade": 450,
      "variacao": -2.1,
      "periodo": "mes-anterior",
      "formatado": "450"
    },
    "taxaConversao": {
      "percentual": 3.47,
      "variacao": 0.8,
      "periodo": "trimestre",
      "formatado": "3.47%"
    }
  },
  "meta": {
    "ultimaAtualizacao": "2024-01-15T10:30:00.000Z",
    "periodo": {
      "periodoAtual": { "inicio": "2024-01-01", "fim": "2024-01-31" },
      "periodoComparacao": { "inicio": "2023-12-01", "fim": "2023-12-31" }
    }
  }
}
```

### 1.2 GET `/api/dashboard/system/status`
**Descrição:** Status do sistema e integrações

**Resposta:**
```json
{
  "success": true,
  "data": {
    "database": {
      "status": "online",
      "lastSync": "2024-01-15T10:30:00.000Z",
      "details": "Conexão ativa com ERP"
    },
    "erpIntegration": {
      "status": "active",
      "lastSync": "2024-01-15T10:30:00.000Z",
      "details": "Integração funcionando"
    },
    "performance": {
      "responseTime": 142,
      "availability": 99.8,
      "queriesPerMinute": 1247
    }
  }
}
```

### 1.3 GET `/api/dashboard/alerts/summary`
**Descrição:** Resumo de alertas do sistema

**Resposta:**
```json
{
  "success": true,
  "data": {
    "alertas": [
      {
        "tipo": "estoque_baixo",
        "titulo": "Produto com estoque baixo",
        "descricao": "Produto XYZ tem apenas 5 unidades em estoque",
        "severidade": "warning",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "severidades": {
      "critical": 0,
      "warning": 1,
      "info": 0
    }
  }
}
```

---

## 📊 **2. APIs de Vendas**

### 2.1 GET `/api/vendas`
**Descrição:** Listar vendas com filtros e paginação

**Parâmetros Query:**
- `dataInicio` (string, opcional): Data de início YYYY-MM-DD
- `dataFim` (string, opcional): Data de fim YYYY-MM-DD
- `clienteId` (string, opcional): ID do cliente
- `status` (string, opcional): Status da venda
- `vendedor` (string, opcional): Nome do vendedor
- `formaPagamento` (string, opcional): Forma de pagamento
- `page` (number, opcional): Página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)
- `ordenarPor` (string, opcional): Campo para ordenação (data, valor, cliente)
- `ordem` (string, opcional): Ordem (asc, desc)

**Exemplo:**
```bash
GET /api/vendas?dataInicio=2024-01-01&dataFim=2024-01-31&page=1&limit=10
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "erp_id": "297925202",
      "codigo": "VDA001",
      "cliente_id": "9104691",
      "nome_cliente": "João Silva",
      "vendedor_id": "123",
      "nome_vendedor": "Maria Santos",
      "data": "2024-01-15T10:30:00.000Z",
      "situacao_id": "1",
      "nome_situacao": "Aprovada",
      "valor_total": 1250.00,
      "valor_custo": 800.00,
      "valor_frete": 25.00,
      "nome_canal_venda": "Loja Virtual",
      "nome_loja": "Loja Principal",
      "condicao_pagamento": "Cartão de Crédito",
      "situacao_financeiro": "Pago",
      "situacao_estoque": "Separado"
    }
  ],
  "pagination": {
    "total": 150,
    "pagina": 1,
    "totalPaginas": 8,
    "porPagina": 20
  }
}
```

### 2.2 GET `/api/vendas/:id`
**Descrição:** Buscar venda específica por ID

**Parâmetros Path:**
- `id` (string, obrigatório): ID da venda

**Exemplo:**
```bash
GET /api/vendas/1
```

### 2.3 GET `/api/vendas/analytics/geral`
**Descrição:** Analytics gerais de vendas

**Parâmetros Query:** Mesmos filtros da listagem de vendas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalVendas": 150,
    "valorTotal": 125000.50,
    "valorMedio": 833.34,
    "ticketMedio": 1250.00,
    "vendasPorStatus": {
      "Aprovada": 120,
      "Pendente": 20,
      "Cancelada": 10
    },
    "vendasPorVendedor": [
      {
        "vendedor": "Maria Santos",
        "total": 45,
        "valor": 37500.00
      }
    ],
    "vendasPorPeriodo": [
      {
        "data": "2024-01-15",
        "total": 5,
        "valor": 6250.00
      }
    ]
  }
}
```

### 2.4 GET `/api/vendas/analytics/periodo`
**Descrição:** Vendas por período específico

**Parâmetros Query:**
- `dataInicio` (string, obrigatório): Data de início
- `dataFim` (string, obrigatório): Data de fim

**Resposta:**
```json
{
  "success": true,
  "data": {
    "vendas": [...],
    "analytics": {
      "totalVendas": 25,
      "valorTotal": 18750.00,
      "valorMedio": 750.00
    }
  }
}
```

### 2.5 GET `/api/vendas/status/lista`
**Descrição:** Listar status disponíveis

**Resposta:**
```json
{
  "success": true,
  "data": ["Aprovada", "Pendente", "Cancelada", "Faturada"]
}
```

### 2.6 GET `/api/vendas/formas-pagamento/lista`
**Descrição:** Listar formas de pagamento

**Resposta:**
```json
{
  "success": true,
  "data": ["Cartão de Crédito", "PIX", "Boleto", "Dinheiro"]
}
```

---

## 👥 **3. APIs de Clientes**

### 3.1 GET `/api/clientes`
**Descrição:** Listar clientes com filtros e paginação

**Parâmetros Query:**
- `nome` (string, opcional): Nome do cliente
- `documento` (string, opcional): CPF/CNPJ
- `email` (string, opcional): Email
- `telefone` (string, opcional): Telefone
- `tipoPessoa` (string, opcional): PF, PJ, ES
- `ativo` (boolean, opcional): Cliente ativo
- `cidade` (string, opcional): Cidade
- `estado` (string, opcional): Estado
- `page` (number, opcional): Página
- `limit` (number, opcional): Itens por página
- `ordenarPor` (string, opcional): Campo para ordenação
- `ordem` (string, opcional): Ordem (asc, desc)

**Exemplo:**
```bash
GET /api/clientes?tipoPessoa=PJ&ativo=true&page=1&limit=10
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "erp_id": "9104691",
      "tipo_pessoa": "PJ",
      "nome": "Empresa ABC Ltda",
      "razao_social": "Empresa ABC Ltda",
      "cnpj": "12.345.678/0001-90",
      "email": "contato@empresaabc.com",
      "telefone": "(11) 99999-9999",
      "ativo": true,
      "enderecos": [
        {
          "logradouro": "Rua das Flores, 123",
          "cidade": "São Paulo",
          "estado": "SP",
          "cep": "01234-567"
        }
      ]
    }
  ],
  "pagination": {
    "total": 85,
    "pagina": 1,
    "totalPaginas": 5,
    "porPagina": 20
  }
}
```

### 3.2 GET `/api/clientes/:id`
**Descrição:** Buscar cliente específico por ID

**Parâmetros Path:**
- `id` (string, obrigatório): ID do cliente

### 3.3 GET `/api/clientes/analytics/geral`
**Descrição:** Analytics gerais de clientes

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalClientes": 150,
    "clientesAtivos": 120,
    "clientesNovos": 15,
    "distribuicaoTipo": {
      "PF": 80,
      "PJ": 65,
      "ES": 5
    },
    "topEstados": [
      {
        "estado": "SP",
        "quantidade": 45
      }
    ]
  }
}
```

### 3.4 GET `/api/clientes/analytics/rfm`
**Descrição:** Análise RFM (Recência, Frequência, Valor Monetário)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "segmentos": {
      "campeoes": {
        "quantidade": 25,
        "percentual": 16.7,
        "caracteristicas": "Clientes de alto valor, compras recentes e frequentes"
      },
      "clientes_leais": {
        "quantidade": 30,
        "percentual": 20.0,
        "caracteristicas": "Clientes frequentes com valor médio"
      }
    },
    "metricas": {
      "recenciaMedia": 45,
      "frequenciaMedia": 3.2,
      "valorMedio": 850.00
    }
  }
}
```

### 3.5 GET `/api/clientes/tipos/lista`
**Descrição:** Listar tipos de pessoa

**Resposta:**
```json
{
  "success": true,
  "data": [
    { "codigo": "PF", "nome": "Pessoa Física" },
    { "codigo": "PJ", "nome": "Pessoa Jurídica" },
    { "codigo": "ES", "nome": "Estrangeiro" }
  ]
}
```

### 3.6 GET `/api/clientes/estados/lista`
**Descrição:** Listar estados disponíveis

**Resposta:**
```json
{
  "success": true,
  "data": ["SP", "RJ", "MG", "RS", "PR"]
}
```

### 3.7 GET `/api/clientes/cidades/lista`
**Descrição:** Listar cidades por estado

**Parâmetros Query:**
- `estado` (string, obrigatório): Sigla do estado

**Exemplo:**
```bash
GET /api/clientes/cidades/lista?estado=SP
```

---

## 📦 **4. APIs de Produtos**

### 4.1 GET `/api/produtos`
**Descrição:** Lista de produtos com filtros e paginação

**Parâmetros Query:**
- `page` (number, opcional): Página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20)
- `periodo` (string, opcional): Período para análise
- `dataInicio` (string, opcional): Data de início
- `dataFim` (string, opcional): Data de fim
- `categoria` (string, opcional): Categoria do produto
- `busca` (string, opcional): Termo de busca

**Exemplo:**
```bash
GET /api/produtos?categoria=Eletrônicos&page=1&limit=10
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "erp_id": "75451059",
      "nome": "Smartphone XYZ",
      "nome_grupo": "Eletrônicos",
      "grupo_id": "1",
      "valor_venda": 1500.00,
      "valor_custo": 900.00,
      "estoque": 25,
      "codigo_barras": "7891234567890",
      "descricao": "Smartphone de última geração",
      "ativo": true
    }
  ],
  "meta": {
    "total": 150,
    "pagina": 1,
    "totalPaginas": 8,
    "porPagina": 20
  }
}
```

### 4.2 GET `/api/produtos/top`
**Descrição:** Produtos mais vendidos

**Parâmetros Query:**
- `limit` (number, opcional): Quantidade de produtos (padrão: 10)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Smartphone XYZ",
      "vendas": 45,
      "valor_total": 67500.00,
      "rank": 1
    }
  ],
  "meta": {
    "limit": 10,
    "total": 10
  }
}
```

### 4.3 GET `/api/produtos/sazonalidade`
**Descrição:** Análise de sazonalidade

**Parâmetros Query:**
- `periodo` (string, opcional): Período para análise (padrão: ano-atual)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "produto": "Smartphone XYZ",
      "vendas_janeiro": 15,
      "vendas_fevereiro": 12,
      "vendas_marco": 18,
      "sazonalidade": "alta"
    }
  ]
}
```

### 4.4 GET `/api/produtos/matriz-abc`
**Descrição:** Matriz ABC de produtos

**Resposta:**
```json
{
  "success": true,
  "data": {
    "categoria_a": [
      {
        "produto": "Smartphone XYZ",
        "valor_total": 67500.00,
        "percentual": 45.2
      }
    ],
    "categoria_b": [...],
    "categoria_c": [...]
  }
}
```

### 4.5 GET `/api/produtos/categorias`
**Descrição:** Lista de categorias disponíveis

**Resposta:**
```json
{
  "success": true,
  "data": ["Eletrônicos", "Informática", "Acessórios"],
  "meta": {
    "total": 3
  }
}
```

---

## 🔧 **5. APIs de Sistema**

### 5.1 GET `/api/system/status`
**Descrição:** Status completo do sistema

**Resposta:**
```json
{
  "success": true,
  "data": {
    "database": {
      "status": "connected",
      "message": "Conexão ativa"
    },
    "cache": {
      "status": "connected",
      "keys": 1250,
      "memory": "45.2MB"
    },
    "sync": {
      "status": "running",
      "lastSync": "2024-01-15T10:30:00.000Z",
      "nextSync": "2024-01-15T11:00:00.000Z"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5.2 GET `/api/system/cache/stats`
**Descrição:** Estatísticas do cache

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "keys": 1250,
    "memory": "45.2MB",
    "hits": 15420,
    "misses": 1250,
    "hitRate": 92.5
  }
}
```

### 5.3 POST `/api/system/cache/clear`
**Descrição:** Limpar cache

**Body:**
```json
{
  "pattern": "*" // opcional - padrão para limpar
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Cache limpo com sucesso"
}
```

### 5.4 GET `/api/system/sync/status`
**Descrição:** Status da sincronização

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "lastSync": "2024-01-15T10:30:00.000Z",
    "nextSync": "2024-01-15T11:00:00.000Z",
    "entities": {
      "vendas": {
        "status": "synced",
        "lastSync": "2024-01-15T10:30:00.000Z",
        "records": 150
      },
      "clientes": {
        "status": "synced",
        "lastSync": "2024-01-15T10:30:00.000Z",
        "records": 85
      },
      "produtos": {
        "status": "synced",
        "lastSync": "2024-01-15T10:30:00.000Z",
        "records": 200
      }
    }
  }
}
```

### 5.5 POST `/api/system/sync/trigger`
**Descrição:** Forçar sincronização manual

**Body:**
```json
{
  "entity": "vendas" // opcional - entidade específica
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sincronização iniciada com sucesso"
}
```

### 5.6 GET `/api/system/database/health`
**Descrição:** Health check do banco de dados

**Resposta:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "responseTime": 45,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🔗 **6. APIs de ERP**

### 6.1 GET `/api/erp/status`
**Descrição:** Verificar status da integração com ERP

**Resposta:**
```json
{
  "success": true,
  "data": {
    "configValid": true,
    "connectionStatus": true,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "message": "ERP conectado e funcionando"
  }
}
```

### 6.2 POST `/api/erp/cache/clear`
**Descrição:** Limpar cache da integração ERP

**Resposta:**
```json
{
  "success": true,
  "data": {
    "message": "Cache limpo com sucesso",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6.3 GET `/api/erp/test`
**Descrição:** Teste de conexão com ERP

**Resposta:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "message": "Conexão com ERP estabelecida com sucesso"
  }
}
```

---

## 🏥 **7. APIs de Health Check**

### 7.1 GET `/api/health`
**Descrição:** Verificar se o servidor está funcionando

**Resposta:**
```json
{
  "status": "OK",
  "message": "Backend está funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7.2 GET `/api/kpi/test`
**Descrição:** Teste de KPI

**Resposta:**
```json
{
  "success": true,
  "data": {
    "metric": "Test KPI",
    "value": 85.5,
    "unit": "%",
    "trend": "up"
  }
}
```

---

## 📋 **8. Códigos de Status HTTP**

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - Não autorizado |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro interno do servidor |

---

## 🔒 **9. Autenticação e Segurança**

Atualmente, as APIs não requerem autenticação para desenvolvimento. Em produção, recomenda-se implementar:

- JWT Tokens
- Rate Limiting
- CORS configurado
- Validação de entrada
- Logs de auditoria

---

## 📝 **10. Exemplos de Uso**

### Exemplo 1: Buscar Analytics do Dashboard
```bash
curl -X GET "http://localhost:3001/api/dashboard/analytics?dataInicio=2024-01-01&dataFim=2024-01-31" \
  -H "Content-Type: application/json"
```

### Exemplo 2: Listar Vendas com Filtros
```bash
curl -X GET "http://localhost:3001/api/vendas?dataInicio=2024-01-01&dataFim=2024-01-31&status=Aprovada&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Exemplo 3: Buscar Cliente por ID
```bash
curl -X GET "http://localhost:3001/api/clientes/1" \
  -H "Content-Type: application/json"
```

### Exemplo 4: Limpar Cache
```bash
curl -X POST "http://localhost:3001/api/system/cache/clear" \
  -H "Content-Type: application/json" \
  -d '{"pattern": "*"}'
```

---

## 🐛 **11. Troubleshooting**

### Problemas Comuns

1. **Erro 500 - Erro interno do servidor**
   - Verificar logs do backend
   - Verificar conexão com banco de dados
   - Verificar configurações do ERP

2. **Erro 404 - Rota não encontrada**
   - Verificar URL da requisição
   - Verificar se o servidor está rodando
   - Verificar se a rota está registrada

3. **Erro 400 - Parâmetros inválidos**
   - Verificar formato das datas (YYYY-MM-DD)
   - Verificar tipos de dados dos parâmetros
   - Verificar parâmetros obrigatórios

### Logs Úteis

- **Backend:** Terminal onde o servidor está rodando
- **Frontend:** Console do navegador (F12)
- **Network:** DevTools para verificar requisições HTTP

---

## 📚 **12. Recursos Adicionais**

- **Documentação dos Filtros:** `FILTROS_DASHBOARD.md`
- **Configuração do Ambiente:** `.env.example`
- **Scripts de Desenvolvimento:** `package.json`
- **Modelos de Dados:** `backend/src/models/`

---

**Última atualização:** Janeiro 2024  
**Versão da API:** 1.0.0  
**Desenvolvedor:** Sistema de Painel KPI 