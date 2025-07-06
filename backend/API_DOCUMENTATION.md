# Documentação das APIs - Painel KPI V3

## Visão Geral

Este documento descreve todas as APIs implementadas para integração com o ERP GestãoClick. **IMPORTANTE**: Todas as APIs são de **somente leitura** - nenhum dado é modificado no ERP.

## Base URL
```
http://localhost:3001/api
```

## Autenticação

Todas as APIs utilizam as credenciais configuradas no arquivo `.env`:
- `ERP_API_KEY`: Chave de API do ERP
- `ERP_BASE_URL`: URL base do ERP
- `ERP_TIMEOUT`: Timeout das requisições (padrão: 30000ms)

## Rate Limiting

- **Limite por segundo**: 10 requisições
- **Limite diário**: 1000 requisições
- **Cache**: 5 minutos para dados estáticos

---

## 1. APIs de Produtos

### GET /api/produtos
Lista produtos com filtros e paginação.

**Parâmetros de Query:**
- `nome` (string): Filtrar por nome do produto
- `codigo` (string): Filtrar por código do produto
- `categoria` (string): Filtrar por categoria
- `ativo` (boolean): Filtrar por status ativo
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 20)
- `ordenarPor` (string): Campo para ordenação
- `ordem` (string): 'asc' ou 'desc'

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "nome": "Produto Exemplo",
      "codigo": "PROD001",
      "categoria": "Eletrônicos",
      "preco": 99.99,
      "estoque": 50,
      "ativo": true
    }
  ],
  "pagination": {
    "total": 100,
    "pagina": 1,
    "totalPaginas": 5,
    "porPagina": 20
  }
}
```

### GET /api/produtos/:id
Busca produto específico por ID.

### GET /api/produtos/analytics/geral
Retorna analytics gerais de produtos.

---

## 2. APIs de Vendas

### GET /api/vendas
Lista vendas com filtros e paginação.

**Parâmetros de Query:**
- `dataInicio` (string): Data inicial (YYYY-MM-DD)
- `dataFim` (string): Data final (YYYY-MM-DD)
- `clienteId` (string): Filtrar por cliente
- `status` (string): Filtrar por status da venda
- `vendedor` (string): Filtrar por vendedor
- `formaPagamento` (string): Filtrar por forma de pagamento
- `page` (number): Página
- `limit` (number): Itens por página
- `ordenarPor` (string): Campo para ordenação
- `ordem` (string): 'asc' ou 'desc'

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "456",
      "numero": "VENDA001",
      "data": "2024-01-15",
      "cliente": {
        "id": "789",
        "nome": "Cliente Exemplo",
        "email": "cliente@exemplo.com"
      },
      "valorTotal": 1500.00,
      "valorLiquido": 1425.00,
      "status": "Concluída",
      "formaPagamento": "Cartão de Crédito",
      "itens": [
        {
          "id": "1",
          "produto": {
            "id": "123",
            "nome": "Produto Exemplo",
            "codigo": "PROD001"
          },
          "quantidade": 2,
          "valorUnitario": 750.00,
          "valorTotal": 1500.00
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "pagina": 1,
    "totalPaginas": 3,
    "porPagina": 20
  }
}
```

### GET /api/vendas/:id
Busca venda específica por ID.

### GET /api/vendas/analytics/geral
Retorna analytics gerais de vendas.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalVendas": 150,
    "valorTotal": 75000.00,
    "valorMedio": 500.00,
    "vendasPorStatus": {
      "Concluída": 120,
      "Pendente": 20,
      "Cancelada": 10
    },
    "vendasPorMes": [
      {
        "mes": "2024-01",
        "quantidade": 25,
        "valor": 12500.00
      }
    ],
    "topClientes": [
      {
        "clienteId": "789",
        "clienteNome": "Cliente Top",
        "quantidade": 15,
        "valor": 7500.00
      }
    ],
    "topProdutos": [
      {
        "produtoId": "123",
        "produtoNome": "Produto Mais Vendido",
        "quantidade": 50,
        "valor": 25000.00
      }
    ]
  }
}
```

### GET /api/vendas/analytics/periodo
Retorna vendas e analytics de um período específico.

**Parâmetros:**
- `dataInicio` (obrigatório): Data inicial
- `dataFim` (obrigatório): Data final

### GET /api/vendas/status/lista
Lista todos os status de vendas disponíveis.

### GET /api/vendas/formas-pagamento/lista
Lista todas as formas de pagamento disponíveis.

---

## 3. APIs de Clientes

### GET /api/clientes
Lista clientes com filtros e paginação.

**Parâmetros de Query:**
- `nome` (string): Filtrar por nome
- `documento` (string): Filtrar por CPF/CNPJ
- `email` (string): Filtrar por email
- `telefone` (string): Filtrar por telefone
- `tipoPessoa` (string): 'PF', 'PJ' ou 'ES'
- `ativo` (boolean): Filtrar por status ativo
- `cidade` (string): Filtrar por cidade
- `estado` (string): Filtrar por estado
- `page` (number): Página
- `limit` (number): Itens por página
- `ordenarPor` (string): Campo para ordenação
- `ordem` (string): 'asc' ou 'desc'

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "789",
      "nome": "Cliente Exemplo",
      "razaoSocial": "Empresa Exemplo LTDA",
      "tipoPessoa": "PJ",
      "documento": "12.345.678/0001-90",
      "telefone": "(11) 99999-9999",
      "celular": "(11) 88888-8888",
      "email": "cliente@exemplo.com",
      "ativo": true,
      "enderecos": [
        {
          "cep": "01234-567",
          "logradouro": "Rua Exemplo",
          "numero": "123",
          "bairro": "Centro",
          "cidade": "São Paulo",
          "estado": "SP"
        }
      ],
      "contatos": [
        {
          "nome": "João Silva",
          "contato": "joao@exemplo.com",
          "cargo": "Gerente"
        }
      ]
    }
  ],
  "pagination": {
    "total": 200,
    "pagina": 1,
    "totalPaginas": 10,
    "porPagina": 20
  }
}
```

### GET /api/clientes/:id
Busca cliente específico por ID.

### GET /api/clientes/analytics/geral
Retorna analytics gerais de clientes.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalClientes": 200,
    "clientesAtivos": 180,
    "clientesInativos": 20,
    "clientesPorTipo": {
      "PF": 120,
      "PJ": 75,
      "ES": 5
    },
    "clientesPorEstado": {
      "SP": 100,
      "RJ": 50,
      "MG": 30
    },
    "topClientes": [
      {
        "clienteId": "789",
        "clienteNome": "Cliente Top",
        "totalCompras": 15,
        "valorTotal": 7500.00,
        "ultimaCompra": "2024-01-15"
      }
    ],
    "clientesNovos": [
      {
        "clienteId": "999",
        "clienteNome": "Novo Cliente",
        "dataCadastro": "2024-01-10"
      }
    ],
    "segmentacaoRFM": {
      "campeoes": 20,
      "clientesLeais": 50,
      "clientesEmRisco": 30,
      "clientesPerdidos": 15,
      "novosClientes": 25
    }
  }
}
```

### GET /api/clientes/analytics/rfm
Retorna análise RFM (Recency, Frequency, Monetary) dos clientes.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "clientes": [
      {
        "clienteId": "789",
        "clienteNome": "Cliente Exemplo",
        "recencia": 15,
        "frequencia": 10,
        "valorMonetario": 5000.00,
        "scoreRFM": 451,
        "segmento": "Campeões"
      }
    ],
    "segmentos": {
      "Campeões": 20,
      "Clientes Leais": 50,
      "Em Risco": 30,
      "Perdidos": 15,
      "Novos Clientes": 25
    },
    "mediaRFM": {
      "recencia": 45.5,
      "frequencia": 8.2,
      "valorMonetario": 2500.00
    }
  }
}
```

### GET /api/clientes/tipos/lista
Lista tipos de pessoa disponíveis.

### GET /api/clientes/estados/lista
Lista estados disponíveis.

### GET /api/clientes/cidades/lista
Lista cidades por estado.

**Parâmetros:**
- `estado` (obrigatório): Estado para filtrar cidades

---

## 4. APIs de ERP

### GET /api/erp/status
Verifica status da conexão com o ERP.

### GET /api/erp/cache/clear
Limpa o cache local.

---

## 5. APIs de Sistema

### GET /api/health
Verifica se o servidor está funcionando.

### GET /api/kpi/test
Endpoint de teste para KPIs.

---

## Códigos de Erro

### 400 - Bad Request
Parâmetros inválidos ou obrigatórios ausentes.

### 404 - Not Found
Recurso não encontrado.

### 429 - Too Many Requests
Limite de requisições excedido.

### 500 - Internal Server Error
Erro interno do servidor.

### 503 - Service Unavailable
ERP indisponível ou erro de conexão.

---

## Exemplos de Uso

### Buscar vendas do último mês
```bash
curl "http://localhost:3001/api/vendas?dataInicio=2024-01-01&dataFim=2024-01-31"
```

### Buscar clientes ativos de São Paulo
```bash
curl "http://localhost:3001/api/clientes?ativo=true&estado=SP"
```

### Buscar analytics de vendas
```bash
curl "http://localhost:3001/api/vendas/analytics/geral"
```

### Buscar análise RFM
```bash
curl "http://localhost:3001/api/clientes/analytics/rfm"
```

---

## Notas Importantes

1. **Somente Leitura**: Nenhuma API modifica dados no ERP
2. **Cache**: Dados são cacheados por 5 minutos para otimizar performance
3. **Rate Limiting**: Respeite os limites de requisições
4. **Logs**: Todas as operações são logadas para debug
5. **Tratamento de Erros**: Erros são tratados e retornados de forma consistente
6. **Paginação**: Use paginação para grandes volumes de dados
7. **Filtros**: Combine filtros para otimizar consultas

---

## Configuração

Configure as variáveis de ambiente no arquivo `.env`:

```env
# ERP Configuration
ERP_API_KEY=sua_chave_api_aqui
ERP_BASE_URL=https://api.gestaoclick.com
ERP_TIMEOUT=30000

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
``` 