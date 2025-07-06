# Filtros Temporais do Dashboard - Documentação

## Visão Geral

Este documento descreve todos os filtros temporais disponíveis no sistema de dashboard, suas implementações no frontend e backend, e como os dados são processados.

## Filtros Disponíveis

### 1. Filtros Pré-definidos

| Filtro | Valor | Descrição | Implementação |
|--------|-------|-----------|---------------|
| Esta semana | `esta-semana` | Domingo da semana atual até hoje | ✅ Funcionando |
| Semana passada | `semana-passada` | Domingo a sábado da semana anterior | ✅ Funcionando |
| Últimos 15 dias | `ultimos-15-dias` | Há 15 dias até hoje | ✅ Funcionando |
| Mês atual | `mes-atual` | Primeiro dia do mês até hoje | ✅ Funcionando |
| Mês passado | `mes-passado` | Primeiro ao último dia do mês anterior | ✅ Funcionando |
| Último trimestre | `ultimo-trimestre` | 3 meses atrás até hoje | ✅ Funcionando |
| 180 dias | `180-dias` | Há 180 dias até hoje | ✅ Funcionando |
| Este ano | `este-ano` | Primeiro dia do ano até hoje | ✅ Funcionando |
| Ano passado | `ano-passado` | Primeiro ao último dia do ano anterior | ✅ Funcionando |
| Período personalizado | `personalizado` | Datas específicas escolhidas pelo usuário | ✅ Funcionando |

## Implementação Frontend

### Componente: `TemporalFilter.tsx`

**Localização:** `frontend/src/components/filters/TemporalFilter.tsx`

**Função Principal:** `handlePeriodSelect(period: string)`
- Recebe o período selecionado
- Chama `onPeriodChange` callback
- Para períodos personalizados, abre o seletor de datas

**Função de Aplicação:** `handleApplyCustomPeriod()`
- Processa datas personalizadas
- Formata como `custom:${fromISO}:${toISO}`
- Chama `onPeriodChange` com o formato personalizado

### Página: `Dashboard.tsx`

**Localização:** `frontend/src/pages/Dashboard.tsx`

**Função Principal:** `getDateRangeFromPeriod(period: string)`
- Converte períodos em objetos `{ from: Date, to: Date }`
- Implementa lógica específica para cada filtro
- Retorna `null` para períodos inválidos

**Função de Busca:** `fetchDashboardData(dateRangeParam?)`
- Chama a API do backend com parâmetros de data
- Formata datas como `yyyy-MM-dd`
- Constrói query string: `?dataInicio=${from}&dataFim=${to}`

### API Service: `api.ts`

**Localização:** `frontend/src/lib/api.ts`

**Classe:** `DashboardService`
- `getDashboardAnalytics(queryString: string)`
- Faz requisição GET para `/api/dashboard/analytics`
- Anexa query string com parâmetros de data

## Implementação Backend

### Rota: `dashboard.ts`

**Localização:** `backend/src/routes/dashboard.ts`

**Endpoint:** `GET /api/dashboard/analytics`
- Recebe parâmetros: `dataInicio`, `dataFim`, `periodo`
- Chama `dashboardService.getDashboardAnalytics()`
- Retorna analytics filtrados por período

### Serviço: `dashboardService.ts`

**Localização:** `backend/src/services/dashboardService.ts`

**Função Principal:** `getDashboardAnalytics(params?)`
- Processa parâmetros de data
- Calcula período de comparação automaticamente
- Chama serviços de vendas, clientes e produtos
- Retorna KPIs calculados

**Lógica de Períodos:**
```typescript
if (params?.dataInicio && params?.dataFim) {
  // Usar datas específicas fornecidas
  dataInicio = params.dataInicio
  dataFim = params.dataFim
  
  // Calcular período de comparação (mesmo tamanho, período anterior)
  const duracaoDias = Math.ceil((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24))
  const inicioComparacao = new Date(inicioDate)
  inicioComparacao.setDate(inicioComparacao.getDate() - duracaoDias)
  const fimComparacao = new Date(inicioDate)
  fimComparacao.setDate(fimComparacao.getDate() - 1)
} else {
  // Usar período padrão (mês atual vs anterior)
  // ...
}
```

## Fluxo de Dados

### 1. Seleção do Filtro
1. Usuário seleciona filtro no `TemporalFilter`
2. `handlePeriodSelect()` é chamado
3. `onPeriodChange` callback é executado

### 2. Conversão de Período
1. `getDateRangeFromPeriod()` converte período em datas
2. Retorna objeto `{ from: Date, to: Date }`
3. Para períodos personalizados, processa formato `custom:from:to`

### 3. Busca de Dados
1. `fetchDashboardData()` é chamado com range de datas
2. Formata datas como `yyyy-MM-dd`
3. Constrói query string para API

### 4. Processamento Backend
1. Rota `/api/dashboard/analytics` recebe parâmetros
2. `DashboardService.getDashboardAnalytics()` processa datas
3. Calcula período de comparação automaticamente
4. Busca dados filtrados dos serviços

### 5. Retorno e Exibição
1. Backend retorna analytics calculados
2. Frontend atualiza estado `dashboardData`
3. Componentes re-renderizam com novos dados

## Status de Implementação

### ✅ Funcionando Corretamente
- Todos os filtros pré-definidos
- Período personalizado
- Cálculo automático de comparação
- Formatação de datas
- Integração frontend-backend

### 🔧 Melhorias Implementadas
- Filtros agora afetam dados retornados
- Período de comparação calculado automaticamente
- Logs de debug para troubleshooting
- Tratamento de erros robusto

## Exemplos de Uso

### Filtro "Mês Atual"
```typescript
// Frontend
const period = 'mes-atual'
const dateRange = getDateRangeFromPeriod(period)
// Resultado: { from: 2024-01-01, to: 2024-01-15 }

// API Call
GET /api/dashboard/analytics?dataInicio=2024-01-01&dataFim=2024-01-15

// Backend
// Calcula período de comparação: 2023-12-01 a 2023-12-31
// Retorna analytics comparando os dois períodos
```

### Filtro Personalizado
```typescript
// Frontend
const customPeriod = 'custom:2024-01-01T00:00:00.000Z:2024-01-31T00:00:00.000Z'
const dateRange = getDateRangeFromPeriod(customPeriod)
// Resultado: { from: 2024-01-01, to: 2024-01-31 }

// API Call
GET /api/dashboard/analytics?dataInicio=2024-01-01&dataFim=2024-01-31
```

## Logs e Debug

### Frontend
```javascript
console.log('Período selecionado:', period)
console.log(`[Dashboard] Buscando dados do período: ${format(from, 'dd/MM/yyyy')} até ${format(to, 'dd/MM/yyyy')}`)
```

### Backend
```javascript
console.log('[DashboardService] Calculando analytics do dashboard', params)
console.log('[DashboardService] Analytics calculados com sucesso')
console.log('[DashboardRoutes] GET /api/dashboard/analytics', req.query)
```

## Considerações Técnicas

1. **Performance**: Dados buscados em paralelo usando `Promise.all()`
2. **Cache**: Sistema de cache implementado para otimizar consultas
3. **Validação**: Parâmetros de data validados no backend
4. **Timezone**: Todas as datas processadas em UTC
5. **Formatação**: Datas formatadas para exibição em pt-BR

## Troubleshooting

### Problemas Comuns
1. **Filtros não afetam dados**: Verificar se `dataInicio` e `dataFim` estão sendo enviados
2. **Datas incorretas**: Verificar formatação `yyyy-MM-dd`
3. **Erro 500**: Verificar logs do backend para detalhes
4. **Dados não atualizam**: Verificar se `fetchDashboardData()` está sendo chamado

### Logs Úteis
- Frontend: Console do navegador
- Backend: Terminal onde o servidor está rodando
- Network: DevTools para verificar requisições HTTP 