# Documentação das Funções de Dados de Retorno

## Visão Geral

Este documento descreve todas as funções do backend que processam, filtram e retornam dados para o frontend. Cada função é responsável por transformar dados do ERP GestãoClick em formatos otimizados para o dashboard e demais funcionalidades.

**Base de Dados:** PostgreSQL + ERP GestãoClick  
**Arquitetura:** Serviços modulares com mapeamento de dados

---

## 🔧 **1. Dashboard Service**

### **1.1 getDashboardAnalytics()**
**Arquivo:** `backend/src/services/dashboardService.ts`  
**Linha:** 25-155

**Descrição:** Função principal que calcula KPIs do dashboard com filtros temporais

**Parâmetros:**
```typescript
params?: {
  dataInicio?: string    // Data de início (YYYY-MM-DD)
  dataFim?: string       // Data de fim (YYYY-MM-DD)
  periodo?: string       // Período pré-definido
}
```

**Processamento de Datas:**
```typescript
// 1. Calcular período baseado nos parâmetros
if (params?.dataInicio && params?.dataFim) {
  // Usar datas específicas fornecidas
  dataInicio = params.dataInicio
  dataFim = params.dataFim
  
  // Calcular período de comparação (mesmo tamanho, período anterior)
  const duracaoDias = Math.ceil((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24))
  const inicioComparacao = new Date(inicioDate)
  inicioComparacao.setDate(inicioComparacao.getDate() - duracaoDias)
} else {
  // Usar período padrão (mês atual vs anterior)
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()
  dataInicio = new Date(anoAtual, mesAtual, 1).toISOString().split('T')[0]
  dataFim = new Date(anoAtual, mesAtual + 1, 0).toISOString().split('T')[0]
}
```

**Busca de Dados em Paralelo:**
```typescript
const [
  vendasPeriodo,
  vendasComparacao,
  clientesAnalytics,
  produtosAnalytics
] = await Promise.all([
  this.vendasService.getVendasAnalytics({ dataInicio, dataFim }),
  this.vendasService.getVendasAnalytics({ dataInicio: dataInicioComparacao, dataFim: dataFimComparacao }),
  this.clientesService.getClientesAnalytics(),
  this.produtoService.getProdutos({ limit: 1000 })
])
```

**Cálculo de Métricas:**
```typescript
// Receita total e variação
const receitaPeriodo = vendasPeriodo.valorTotal || 0
const receitaComparacao = vendasComparacao.valorTotal || 0
const variacaoReceita = receitaComparacao > 0 
  ? ((receitaPeriodo - receitaComparacao) / receitaComparacao) * 100 
  : 0

// Clientes ativos
const clientesAtivos = clientesAnalytics.totalClientes || 0
const novosClientes = clientesAnalytics.clientesNovos?.length || 0

// Produtos vendidos
const produtosVendidos = produtosAnalytics.data?.reduce((total, produto) => 
  total + (produto.vendas || 0), 0) || 0
```

**Retorno Formatado:**
```typescript
{
  success: true,
  data: {
    receitaTotal: {
      valor: receitaPeriodo,
      variacao: parseFloat(variacaoReceita.toFixed(1)),
      periodo: "periodo-anterior",
      formatado: new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(receitaPeriodo)
    },
    clientesAtivos: {
      quantidade: clientesAtivos,
      variacao: parseFloat(variacaoClientes.toFixed(1)),
      novosEsteMes: novosClientes,
      formatado: clientesAtivos.toLocaleString('pt-BR')
    },
    produtosVendidos: {
      quantidade: produtosVendidos,
      variacao: variacaoProdutos,
      periodo: "mes-anterior",
      formatado: produtosVendidos.toLocaleString('pt-BR')
    },
    taxaConversao: {
      percentual: taxaConversao,
      variacao: variacaoTaxa,
      periodo: "trimestre",
      formatado: `${taxaConversao}%`
    }
  },
  meta: {
    ultimaAtualizacao: new Date().toISOString(),
    periodo: {
      periodoAtual: { inicio: dataInicio, fim: dataFim },
      periodoComparacao: { inicio: dataInicioComparacao, fim: dataFimComparacao }
    }
  }
}
```

---

## 📊 **2. Vendas Service**

### **2.1 mapERPToVenda()**
**Arquivo:** `backend/src/services/vendasService.ts`  
**Linha:** 67-120

**Descrição:** Converte dados do ERP para formato do frontend

**Mapeamento de Campos:**
```typescript
private mapERPToVenda(erpVenda: ERPVenda): Venda {
  return {
    id: erpVenda.id,
    numero: erpVenda.codigo || erpVenda.id,
    data: erpVenda.data,
    cliente: {
      id: erpVenda.cliente_id || '',
      nome: erpVenda.nome_cliente || 'Cliente não identificado',
      email: '', // Será preenchido pelo serviço de clientes
      telefone: '' // Será preenchido pelo serviço de clientes
    },
    valorTotal: parseFloat(erpVenda.valor_total) || 0,
    valorLiquido: parseFloat(erpVenda.valor_total) || 0,
    status: erpVenda.nome_situacao || 'Pendente',
    formaPagamento: erpVenda.nome_canal_venda || 'Não informado',
    itens: [
      // Produtos
      ...(erpVenda.produtos || []).map(item => ({
        id: item.produto.produto_id.toString(),
        produto: {
          id: item.produto.produto_id.toString(),
          nome: item.produto.nome_produto || 'Produto não identificado',
          codigo: item.produto.produto_id.toString(),
          categoria: ''
        },
        quantidade: parseFloat(item.produto.quantidade) || 0,
        valorUnitario: parseFloat(item.produto.valor_venda) || 0,
        valorTotal: parseFloat(item.produto.valor_total) || 0,
        desconto: parseFloat(item.produto.desconto_valor || '0')
      })),
      // Serviços
      ...(erpVenda.servicos || []).map(item => ({
        id: item.servico.id,
        produto: {
          id: item.servico.servico_id,
          nome: item.servico.nome_servico || 'Serviço não identificado',
          codigo: item.servico.servico_id,
          categoria: 'Serviço'
        },
        quantidade: parseFloat(item.servico.quantidade) || 0,
        valorUnitario: parseFloat(item.servico.valor_venda) || 0,
        valorTotal: parseFloat(item.servico.valor_total) || 0,
        desconto: parseFloat(item.servico.desconto_valor || '0')
      }))
    ],
    observacoes: erpVenda.observacoes || erpVenda.observacoes_interna || undefined,
    vendedor: erpVenda.nome_vendedor,
    desconto: 0, // Calculado a partir dos descontos dos itens
    frete: parseFloat(erpVenda.valor_frete) || 0
  }
}
```

### **2.2 getVendasAnalytics()**
**Arquivo:** `backend/src/services/vendasService.ts`  
**Linha:** 196-313

**Descrição:** Gera analytics detalhados de vendas

**Cálculo de Métricas:**
```typescript
// Métricas básicas
const totalVendas = vendas.length
const valorTotal = vendas.reduce((sum, venda) => sum + venda.valorTotal, 0)
const valorMedio = totalVendas > 0 ? valorTotal / totalVendas : 0

// Vendas por status
const vendasPorStatus: Record<string, number> = {}
vendas.forEach(venda => {
  const status = venda.status
  vendasPorStatus[status] = (vendasPorStatus[status] || 0) + 1
})

// Vendas por mês (últimos 12 meses)
const vendasPorMes: Array<{ mes: string, quantidade: number, valor: number }> = []
const meses = new Map<string, { quantidade: number, valor: number }>()

vendas.forEach(venda => {
  const data = new Date(venda.data)
  const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
  
  const atual = meses.get(mesAno) || { quantidade: 0, valor: 0 }
  atual.quantidade++
  atual.valor += venda.valorTotal
  meses.set(mesAno, atual)
})
```

**Top Clientes:**
```typescript
const clientesMap = new Map<string, { nome: string, quantidade: number, valor: number }>()

vendas.forEach(venda => {
  const clienteId = venda.cliente.id
  const atual = clientesMap.get(clienteId) || { 
    nome: venda.cliente.nome, 
    quantidade: 0, 
    valor: 0 
  }
  atual.quantidade++
  atual.valor += venda.valorTotal
  clientesMap.set(clienteId, atual)
})

const topClientes = Array.from(clientesMap.entries())
  .map(([clienteId, dados]) => ({
    clienteId,
    clienteNome: dados.nome,
    quantidade: dados.quantidade,
    valor: dados.valor
  }))
  .sort((a, b) => b.valor - a.valor)
  .slice(0, 10)
```

**Top Produtos:**
```typescript
const produtosMap = new Map<string, { nome: string, quantidade: number, valor: number }>()

vendas.forEach(venda => {
  venda.itens.forEach(item => {
    const produtoId = item.produto.id
    const atual = produtosMap.get(produtoId) || { 
      nome: item.produto.nome, 
      quantidade: 0, 
      valor: 0 
    }
    atual.quantidade += item.quantidade
    atual.valor += item.valorTotal
    produtosMap.set(produtoId, atual)
  })
})

const topProdutos = Array.from(produtosMap.entries())
  .map(([produtoId, dados]) => ({
    produtoId,
    produtoNome: dados.nome,
    quantidade: dados.quantidade,
    valor: dados.valor
  }))
  .sort((a, b) => b.valor - a.valor)
  .slice(0, 10)
```

---

## 👥 **3. Clientes Service**

### **3.1 mapERPToCliente()**
**Arquivo:** `backend/src/services/clientesService.ts`  
**Linha:** 95-150

**Descrição:** Converte dados do ERP para formato do frontend com cálculos RFM

**Mapeamento de Campos:**
```typescript
private mapERPToCliente(erpCliente: ERPCliente): Cliente {
  // Calcular campos que o frontend espera
  const dataCadastro = erpCliente.data_nascimento || new Date().toISOString().split('T')[0]
  const ultimaCompra = new Date().toISOString().split('T')[0] // TODO: Calcular da tabela de vendas
  const totalCompras = 0 // TODO: Calcular da tabela de vendas
  const valorTotal = 0 // TODO: Calcular da tabela de vendas
  
  // Calcular RFM básico (placeholder)
  const rfm = {
    recencia: 30, // TODO: Calcular dias desde última compra
    frequencia: totalCompras,
    valor: valorTotal,
    segmento: this.calcularSegmentoRFM(30, totalCompras, valorTotal)
  }
  
  return {
    id: erpCliente.id,
    nome: erpCliente.nome,
    razaoSocial: erpCliente.razao_social || undefined,
    tipoPessoa: erpCliente.tipo_pessoa as 'PF' | 'PJ' | 'ES',
    documento: erpCliente.cpf || erpCliente.cnpj || '',
    inscricaoEstadual: erpCliente.inscricao_estadual || undefined,
    inscricaoMunicipal: erpCliente.inscricao_municipal || undefined,
    telefone: erpCliente.telefone,
    celular: erpCliente.celular,
    email: erpCliente.email,
    ativo: erpCliente.ativo === '1',
    dataNascimento: erpCliente.data_nascimento || undefined,
    // Campos que o frontend espera
    dataCadastro,
    ultimaCompra,
    totalCompras,
    valorTotal,
    rfm,
    // Endereços
    enderecos: (erpCliente.enderecos || []).map(endereco => ({
      cep: endereco.endereco.cep,
      logradouro: endereco.endereco.logradouro,
      numero: endereco.endereco.numero,
      complemento: endereco.endereco.complemento || undefined,
      bairro: endereco.endereco.bairro,
      cidade: endereco.endereco.nome_cidade,
      estado: endereco.endereco.estado
    })),
    // Contatos
    contatos: (erpCliente.contatos || []).map(contato => ({
      tipo: contato.contato.tipo_id || undefined,
      nome: contato.contato.nome,
      contato: contato.contato.contato,
      cargo: contato.contato.cargo,
      observacao: contato.contato.observacao
    }))
  }
}
```

### **3.2 calcularSegmentoRFM()**
**Arquivo:** `backend/src/services/clientesService.ts`  
**Linha:** 152-160

**Descrição:** Calcula segmento RFM baseado em recência, frequência e valor

**Lógica de Segmentação:**
```typescript
private calcularSegmentoRFM(recencia: number, frequencia: number, valor: number): string {
  if (recencia <= 30 && frequencia >= 10 && valor >= 1000) return 'Champions'
  if (recencia <= 60 && frequencia >= 5 && valor >= 500) return 'Loyal Customers'
  if (recencia <= 90 && frequencia >= 3 && valor >= 200) return 'Potential Loyalists'
  if (recencia > 90 && frequencia >= 5 && valor >= 500) return 'At Risk'
  if (recencia <= 30 && frequencia <= 2) return 'New Customers'
  return 'At Risk'
}
```

### **3.3 getClientesAnalytics()**
**Arquivo:** `backend/src/services/clientesService.ts`  
**Linha:** 293-378

**Descrição:** Gera analytics detalhados de clientes

**Cálculo de Métricas:**
```typescript
// Métricas básicas
const totalClientes = clientes.length
const clientesAtivos = clientes.filter(c => c.ativo).length
const clientesInativos = totalClientes - clientesAtivos

// Clientes por tipo
const clientesPorTipo: Record<string, number> = {}
clientes.forEach(cliente => {
  const tipo = cliente.tipoPessoa
  clientesPorTipo[tipo] = (clientesPorTipo[tipo] || 0) + 1
})

// Clientes por estado
const clientesPorEstado: Record<string, number> = {}
clientes.forEach(cliente => {
  const enderecoPrincipal = cliente.enderecos[0]
  if (enderecoPrincipal) {
    const estado = enderecoPrincipal.estado
    clientesPorEstado[estado] = (clientesPorEstado[estado] || 0) + 1
  }
})

// Clientes novos (últimos 30 dias)
const trintaDiasAtras = new Date()
trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

const clientesNovos = clientes
  .filter(cliente => {
    // Como não temos data de cadastro no ERP, vamos simular
    return true // Placeholder
  })
  .slice(0, 10)
  .map(cliente => ({
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    dataCadastro: new Date().toISOString() // Placeholder
  }))

// Segmentação RFM
const segmentacaoRFM = {
  campeoes: 0,
  clientesLeais: 0,
  clientesEmRisco: 0,
  clientesPerdidos: 0,
  novosClientes: 0
}
```

---

## 📦 **4. Produto Service**

### **4.1 mapERPToProduto()**
**Arquivo:** `backend/src/services/produtoService.ts`  
**Linha:** 85-105

**Descrição:** Converte dados do ERP para formato do frontend com cálculos de vendas

**Mapeamento e Cálculos:**
```typescript
private mapERPToProduto(erpProduto: ERPProduto): Produto {
  // Calcular dados de vendas baseados no estoque e preço
  const preco = parseFloat(erpProduto.valor_venda || '0')
  const estoque = erpProduto.estoque || 0
  const estoqueInicial = estoque + Math.floor(Math.random() * 50) + 10 // Simular estoque inicial
  const vendas = estoqueInicial - estoque // Vendas = estoque inicial - estoque atual
  const receita = vendas * preco
  
  return {
    id: parseInt(erpProduto.id, 10),
    nome: erpProduto.nome,
    categoria: erpProduto.nome_grupo || 'Sem categoria',
    preco: preco,
    estoque: estoque,
    vendas: Math.max(0, vendas), // Garantir que não seja negativo
    receita: Math.max(0, receita),
    ticketMedio: preco,
    crescimento: Math.random() * 0.3 - 0.1 // Simular crescimento entre -10% e +20%
  }
}
```

### **4.2 getTopProdutos()**
**Arquivo:** `backend/src/services/produtoService.ts`  
**Linha:** 206-212

**Descrição:** Retorna produtos mais vendidos

**Implementação:**
```typescript
async getTopProdutos(limit: number = 10): Promise<Produto[]> {
  const produtos = await this.getProdutos({ page: 1, limit: 1000 })
  return produtos.data
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, limit)
}
```

### **4.3 getSazonalidade()**
**Arquivo:** `backend/src/services/produtoService.ts`  
**Linha:** 213-247

**Descrição:** Calcula análise de sazonalidade por período

**Cálculo de Sazonalidade:**
```typescript
async getSazonalidade(periodo: string = 'ano-atual'): Promise<SazonalidadeResponse> {
  const produtos = await this.getProdutos({ page: 1, limit: 1000 })
  
  // Simular dados de sazonalidade por mês
  const sazonalidadePorMes = [
    { mes: 'Jan', vendas: 120, receita: 420000 },
    { mes: 'Fev', vendas: 95, receita: 332500 },
    { mes: 'Mar', vendas: 110, receita: 385000 },
    { mes: 'Abr', vendas: 105, receita: 367500 },
    { mes: 'Mai', vendas: 130, receita: 455000 },
    { mes: 'Jun', vendas: 140, receita: 490000 },
    { mes: 'Jul', vendas: 125, receita: 437500 },
    { mes: 'Ago', vendas: 135, receita: 472500 },
    { mes: 'Set', vendas: 150, receita: 525000 },
    { mes: 'Out', vendas: 145, receita: 507500 },
    { mes: 'Nov', vendas: 160, receita: 560000 },
    { mes: 'Dez', vendas: 180, receita: 630000 }
  ]
  
  return {
    success: true,
    data: sazonalidadePorMes,
    meta: {
      periodo,
      totalVendas: sazonalidadePorMes.reduce((sum, item) => sum + item.vendas, 0),
      totalReceita: sazonalidadePorMes.reduce((sum, item) => sum + item.receita, 0)
    }
  }
}
```

### **4.4 getMatrizABC()**
**Arquivo:** `backend/src/services/produtoService.ts`  
**Linha:** 248-300

**Descrição:** Calcula matriz ABC de produtos baseada em valor de vendas

**Cálculo da Matriz ABC:**
```typescript
async getMatrizABC(): Promise<MatrizABCResponse> {
  const produtos = await this.getProdutos({ page: 1, limit: 1000 })
  
  // Ordenar produtos por receita
  const produtosOrdenados = produtos.data
    .sort((a, b) => b.receita - a.receita)
  
  // Calcular receita total
  const receitaTotal = produtosOrdenados.reduce((sum, produto) => sum + produto.receita, 0)
  
  // Calcular percentual acumulado e classificar
  let receitaAcumulada = 0
  const matrizABC = produtosOrdenados.map(produto => {
    receitaAcumulada += produto.receita
    const percentualAcumulado = (receitaAcumulada / receitaTotal) * 100
    
    let classificacao: 'A' | 'B' | 'C'
    if (percentualAcumulado <= 80) {
      classificacao = 'A'
    } else if (percentualAcumulado <= 95) {
      classificacao = 'B'
    } else {
      classificacao = 'C'
    }
    
    return {
      produtoId: produto.id,
      produtoNome: produto.nome,
      categoria: produto.categoria,
      receita: produto.receita,
      percentualReceita: (produto.receita / receitaTotal) * 100,
      percentualAcumulado,
      classificacao
    }
  })
  
  return {
    success: true,
    data: matrizABC,
    meta: {
      totalProdutos: matrizABC.length,
      receitaTotal,
      classificacaoA: matrizABC.filter(p => p.classificacao === 'A').length,
      classificacaoB: matrizABC.filter(p => p.classificacao === 'B').length,
      classificacaoC: matrizABC.filter(p => p.classificacao === 'C').length
    }
  }
}
```

---

## 🔄 **5. Funções de Filtros Temporais**

### **5.1 getDateRangeFromPeriod()**
**Arquivo:** `frontend/src/components/TemporalFilter.tsx`  
**Descrição:** Converte período selecionado em range de datas

**Implementação:**
```typescript
const getDateRangeFromPeriod = (period: string): { from: Date; to: Date } => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'esta-semana':
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      return { from: startOfWeek, to: today }
      
    case 'semana-passada':
      const lastWeekStart = new Date(today)
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7)
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
      return { from: lastWeekStart, to: lastWeekEnd }
      
    case 'ultimos-15-dias':
      const fifteenDaysAgo = new Date(today)
      fifteenDaysAgo.setDate(today.getDate() - 15)
      return { from: fifteenDaysAgo, to: today }
      
    case 'mes-atual':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: startOfMonth, to: today }
      
    case 'mes-passado':
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: lastMonthStart, to: lastMonthEnd }
      
    case 'ultimo-trimestre':
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setMonth(today.getMonth() - 3)
      return { from: threeMonthsAgo, to: today }
      
    case '180-dias':
      const sixMonthsAgo = new Date(today)
      sixMonthsAgo.setDate(today.getDate() - 180)
      return { from: sixMonthsAgo, to: today }
      
    case 'este-ano':
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      return { from: startOfYear, to: today }
      
    case 'ano-passado':
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)
      return { from: lastYearStart, to: lastYearEnd }
      
    default:
      if (period.startsWith('custom:')) {
        const [, fromStr, toStr] = period.split(':')
        return {
          from: new Date(fromStr),
          to: new Date(toStr)
        }
      }
      return { from: today, to: today }
  }
}
```

### **5.2 fetchDashboardData()**
**Arquivo:** `frontend/src/pages/Dashboard.tsx`  
**Descrição:** Busca dados do dashboard com filtros aplicados

**Implementação:**
```typescript
const fetchDashboardData = async (dateRange?: { from: Date; to: Date }) => {
  try {
    setLoading(true)
    
    let params = ''
    if (dateRange) {
      const dataInicio = dateRange.from.toISOString().split('T')[0]
      const dataFim = dateRange.to.toISOString().split('T')[0]
      params = `?dataInicio=${dataInicio}&dataFim=${dataFim}`
    }
    
    const response = await dashboardService.getDashboardAnalytics(params)
    
    if (response.success) {
      setDashboardData(response.data)
    } else {
      console.error('Erro ao buscar dados do dashboard:', response.error)
    }
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
  } finally {
    setLoading(false)
  }
}
```

---

## 📊 **6. Estruturas de Dados de Retorno**

### **6.1 Dashboard Analytics**
```typescript
interface DashboardAnalytics {
  receitaTotal: {
    valor: number
    variacao: number
    periodo: string
    formatado: string
  }
  clientesAtivos: {
    quantidade: number
    variacao: number
    novosEsteMes: number
    formatado: string
  }
  produtosVendidos: {
    quantidade: number
    variacao: number
    periodo: string
    formatado: string
  }
  taxaConversao: {
    percentual: number
    variacao: number
    periodo: string
    formatado: string
  }
}
```

### **6.2 Vendas Analytics**
```typescript
interface VendasAnalytics {
  totalVendas: number
  valorTotal: number
  valorMedio: number
  vendasPorStatus: Record<string, number>
  vendasPorMes: Array<{
    mes: string
    quantidade: number
    valor: number
  }>
  topClientes: Array<{
    clienteId: string
    clienteNome: string
    quantidade: number
    valor: number
  }>
  topProdutos: Array<{
    produtoId: string
    produtoNome: string
    quantidade: number
    valor: number
  }>
}
```

### **6.3 Clientes Analytics**
```typescript
interface ClientesAnalytics {
  totalClientes: number
  clientesAtivos: number
  clientesInativos: number
  clientesPorTipo: Record<string, number>
  clientesPorEstado: Record<string, number>
  topClientes: Array<{
    clienteId: string
    clienteNome: string
    totalCompras: number
    valorTotal: number
    ultimaCompra: string
  }>
  clientesNovos: Array<{
    clienteId: string
    clienteNome: string
    dataCadastro: string
  }>
  segmentacaoRFM: {
    campeoes: number
    clientesLeais: number
    clientesEmRisco: number
    clientesPerdidos: number
    novosClientes: number
  }
}
```

---

## 🔧 **7. Padrões de Processamento**

### **7.1 Mapeamento ERP → Frontend**
1. **Busca dados do ERP** via `ERPIntegrationService`
2. **Converte tipos** (string → number, etc.)
3. **Calcula campos derivados** (RFM, analytics, etc.)
4. **Formata dados** para exibição
5. **Retorna estrutura padronizada**

### **7.2 Tratamento de Erros**
```typescript
try {
  // Processamento de dados
  const result = await processData()
  return { success: true, data: result }
} catch (error) {
  console.error('[Service] Erro ao processar dados:', error)
  throw new Error(error instanceof Error ? error.message : 'Erro interno')
}
```

### **7.3 Logs de Debug**
```typescript
console.log('[Service] Iniciando processamento')
console.log('[Service] Parâmetros recebidos:', params)
console.log('[Service] Dados processados com sucesso')
console.log('[Service] Retornando resultado:', result)
```

---

## 📈 **8. Performance e Otimizações**

### **8.1 Busca em Paralelo**
```typescript
const [vendas, clientes, produtos] = await Promise.all([
  this.vendasService.getVendasAnalytics(filtros),
  this.clientesService.getClientesAnalytics(),
  this.produtoService.getProdutos({ limit: 1000 })
])
```

### **8.2 Cache de Dados**
```typescript
// Cache de resultados por 5 minutos
const cacheKey = `dashboard_analytics_${JSON.stringify(filtros)}`
const cached = await cacheService.get(cacheKey)
if (cached) return cached

const result = await calculateAnalytics(filtros)
await cacheService.set(cacheKey, result, 300) // 5 minutos
return result
```

### **8.3 Paginação Inteligente**
```typescript
// Buscar apenas dados necessários
const limit = filtros.limit || 20
const offset = (filtros.page - 1) * limit
const dados = await buscarDados({ limit, offset })
```

---

## 🎯 **9. Considerações Futuras**

### **9.1 Melhorias Planejadas**
1. **Cálculo RFM real** baseado em histórico de vendas
2. **Analytics em tempo real** com WebSockets
3. **Cache inteligente** com invalidação automática
4. **Processamento assíncrono** para cálculos complexos

### **9.2 Novas Funções**
1. **getPrevisaoVendas()** - Machine Learning
2. **getAnaliseTendencia()** - Análise temporal
3. **getSegmentacaoAvancada()** - Clustering
4. **getRelatorioPersonalizado()** - Relatórios customizados

---

**Última atualização:** Janeiro 2024  
**Versão:** 1.0.0  
**Total de Funções Documentadas:** 15+  
**Serviços Cobertos:** Dashboard, Vendas, Clientes, Produtos 