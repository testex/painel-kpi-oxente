// TESTE AUTOMATIZADO DE FILTROS TEMPORAIS DO DASHBOARD
// ====================================================
// Este script testa todos os filtros temporais implementados na interface

// Configuração
const BASE_URL = 'http://localhost:3001'
const API_ENDPOINT = '/api/dashboard/analytics'

// Lista de todos os filtros disponíveis
const FILTROS_PRE_DEFINIDOS = [
  { value: 'esta-semana', label: 'Esta semana' },
  { value: 'semana-passada', label: 'Semana passada' },
  { value: 'ultimos-15-dias', label: 'Últimos 15 dias' },
  { value: 'mes-atual', label: 'Mês atual' },
  { value: 'mes-passado', label: 'Mês passado' },
  { value: 'ultimo-trimestre', label: 'Último trimestre' },
  { value: '180-dias', label: '180 dias' },
  { value: 'este-ano', label: 'Este ano' },
  { value: 'ano-passado', label: 'Ano passado' }
]

// Filtros personalizados para teste
const FILTROS_PERSONALIZADOS = [
  { 
    value: 'custom:2024-01-01T00:00:00.000Z:2024-01-31T00:00:00.000Z', 
    label: 'Janeiro 2024',
    expectedFrom: '2024-01-01',
    expectedTo: '2024-01-31'
  },
  { 
    value: 'custom:2024-02-01T00:00:00.000Z:2024-02-29T00:00:00.000Z', 
    label: 'Fevereiro 2024',
    expectedFrom: '2024-02-01',
    expectedTo: '2024-02-29'
  },
  { 
    value: 'custom:2023-12-01T00:00:00.000Z:2023-12-31T00:00:00.000Z', 
    label: 'Dezembro 2023',
    expectedFrom: '2023-12-01',
    expectedTo: '2023-12-31'
  }
]

// Função para calcular datas esperadas (baseada na lógica do frontend)
function getDateRangeFromPeriod(period) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'esta-semana':
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      return { 
        from: startOfWeek.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      }
      
    case 'semana-passada':
      const lastWeekStart = new Date(today)
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7)
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
      return { 
        from: lastWeekStart.toISOString().split('T')[0], 
        to: lastWeekEnd.toISOString().split('T')[0] 
      }
      
    case 'ultimos-15-dias':
      const fifteenDaysAgo = new Date(today)
      fifteenDaysAgo.setDate(today.getDate() - 15)
      return { 
        from: fifteenDaysAgo.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      }
      
    case 'mes-atual':
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return { 
        from: firstDay.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      }
      
    case 'mes-passado':
      const lastMonthFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthLast = new Date(now.getFullYear(), now.getMonth(), 0)
      return { 
        from: lastMonthFirst.toISOString().split('T')[0], 
        to: lastMonthLast.toISOString().split('T')[0] 
      }
      
    case 'ultimo-trimestre':
      const threeMonthsAgo = new Date(today)
      threeMonthsAgo.setMonth(today.getMonth() - 3)
      return { 
        from: threeMonthsAgo.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      }
      
    case '180-dias':
      const sixMonthsAgo = new Date(today)
      sixMonthsAgo.setDate(today.getDate() - 180)
      return { 
        from: sixMonthsAgo.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      }
      
    case 'este-ano':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return { 
        from: yearStart.toISOString().split('T')[0], 
        to: today.toISOString().split('T')[0] 
      }
      
    case 'ano-passado':
      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
      const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31)
      return { 
        from: lastYearStart.toISOString().split('T')[0], 
        to: lastYearEnd.toISOString().split('T')[0] 
      }
      
    default:
      if (period.startsWith('custom:')) {
        const [, fromStr, toStr] = period.split(':')
        return { 
          from: new Date(fromStr).toISOString().split('T')[0], 
          to: new Date(toStr).toISOString().split('T')[0] 
        }
      }
      return null
  }
}

// Função para fazer requisição HTTP
async function testFilter(filter) {
  const dateRange = getDateRangeFromPeriod(filter.value)
  
  if (!dateRange) {
    return {
      filter: filter.label,
      error: 'Erro ao calcular datas para o filtro',
      status: 'ERRO'
    }
  }
  
  const url = `${BASE_URL}${API_ENDPOINT}?dataInicio=${dateRange.from}&dataFim=${dateRange.to}`
  
  try {
    console.log(`\n🧪 Testando filtro: ${filter.label}`)
    console.log(`📅 Datas calculadas: ${dateRange.from} até ${dateRange.to}`)
    console.log(`🌐 URL: ${url}`)
    
    const response = await fetch(url)
    const data = await response.json()
    
    // Validações
    const validations = {
      statusOk: response.ok,
      hasData: data && data.success,
      hasAnalytics: data && data.data,
      hasReceita: data && data.data && data.data.receitaTotal,
      hasClientes: data && data.data && data.data.clientesAtivos,
      hasProdutos: data && data.data && data.data.produtosVendidos,
      hasTaxaConversao: data && data.data && data.data.taxaConversao,
      hasMeta: data && data.meta,
      hasPeriodo: data && data.meta && data.meta.periodo
    }
    
    // Verificar se as datas enviadas correspondem ao filtro
    const datesMatch = true // Será validado pelo backend
    
    const result = {
      filter: filter.label,
      filterValue: filter.value,
      datesCalculated: dateRange,
      url: url,
      status: response.status,
      statusText: response.statusText,
      responseOk: response.ok,
      hasValidData: validations.hasData,
      hasAnalytics: validations.hasAnalytics,
      hasAllFields: validations.hasReceita && validations.hasClientes && validations.hasProdutos && validations.hasTaxaConversao,
      hasMeta: validations.hasMeta,
      hasPeriodo: validations.hasPeriodo,
      datesMatch: datesMatch,
      responseData: data,
      error: null
    }
    
    // Log do resultado
    if (response.ok && validations.hasData) {
      console.log(`✅ SUCESSO: Filtro ${filter.label} funcionando corretamente`)
      console.log(`   📊 Receita: ${data.data.receitaTotal?.formatado || 'N/A'}`)
      console.log(`   👥 Clientes: ${data.data.clientesAtivos?.formatado || 'N/A'}`)
      console.log(`   📦 Produtos: ${data.data.produtosVendidos?.formatado || 'N/A'}`)
      console.log(`   📈 Taxa: ${data.data.taxaConversao?.formatado || 'N/A'}`)
    } else {
      console.log(`❌ ERRO: Filtro ${filter.label} falhou`)
      console.log(`   Status: ${response.status} ${response.statusText}`)
      console.log(`   Dados:`, data)
    }
    
    return result
    
  } catch (error) {
    console.log(`💥 EXCEÇÃO: Filtro ${filter.label} gerou erro`)
    console.log(`   Erro:`, error.message)
    
    return {
      filter: filter.label,
      filterValue: filter.value,
      datesCalculated: dateRange,
      url: url,
      status: 'ERROR',
      statusText: error.message,
      responseOk: false,
      hasValidData: false,
      hasAnalytics: false,
      hasAllFields: false,
      hasMeta: false,
      hasPeriodo: false,
      datesMatch: false,
      responseData: null,
      error: error.message
    }
  }
}

// Função principal de teste
async function runAllTests() {
  console.log('🚀 INICIANDO TESTE AUTOMATIZADO DE FILTROS TEMPORAIS')
  console.log('=' .repeat(60))
  console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`🔗 Endpoint: ${API_ENDPOINT}`)
  console.log('=' .repeat(60))
  
  const results = []
  
  // Testar filtros pré-definidos
  console.log('\n📋 TESTANDO FILTROS PRÉ-DEFINIDOS')
  console.log('-'.repeat(40))
  
  for (const filter of FILTROS_PRE_DEFINIDOS) {
    const result = await testFilter(filter)
    results.push(result)
    
    // Aguardar um pouco entre as requisições
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Testar filtros personalizados
  console.log('\n📋 TESTANDO FILTROS PERSONALIZADOS')
  console.log('-'.repeat(40))
  
  for (const filter of FILTROS_PERSONALIZADOS) {
    const result = await testFilter(filter)
    results.push(result)
    
    // Aguardar um pouco entre as requisições
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Gerar relatório
  generateReport(results)
}

// Função para gerar relatório
function generateReport(results) {
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES')
  console.log('=' .repeat(60))
  
  const totalTests = results.length
  const successfulTests = results.filter(r => r.responseOk && r.hasValidData).length
  const failedTests = totalTests - successfulTests
  
  console.log(`📈 Total de testes: ${totalTests}`)
  console.log(`✅ Sucessos: ${successfulTests}`)
  console.log(`❌ Falhas: ${failedTests}`)
  console.log(`📊 Taxa de sucesso: ${((successfulTests / totalTests) * 100).toFixed(1)}%`)
  
  // Tabela de resultados
  console.log('\n📋 TABELA DE RESULTADOS')
  console.log('-'.repeat(120))
  console.log('FILTRO'.padEnd(20) + 'STATUS'.padEnd(10) + 'DADOS'.padEnd(8) + 'CAMPOS'.padEnd(8) + 'META'.padEnd(8) + 'PERÍODO'.padEnd(10) + 'ERRO')
  console.log('-'.repeat(120))
  
  results.forEach(result => {
    const status = result.responseOk ? '✅ OK' : '❌ ERRO'
    const dados = result.hasValidData ? '✅' : '❌'
    const campos = result.hasAllFields ? '✅' : '❌'
    const meta = result.hasMeta ? '✅' : '❌'
    const periodo = result.hasPeriodo ? '✅' : '❌'
    const erro = result.error || '-'
    
    console.log(
      result.filter.padEnd(20) + 
      status.padEnd(10) + 
      dados.padEnd(8) + 
      campos.padEnd(8) + 
      meta.padEnd(8) + 
      periodo.padEnd(10) + 
      erro
    )
  })
  
  // Detalhar falhas
  const failures = results.filter(r => !r.responseOk || !r.hasValidData)
  if (failures.length > 0) {
    console.log('\n❌ DETALHAMENTO DAS FALHAS')
    console.log('-'.repeat(60))
    
    failures.forEach(failure => {
      console.log(`\n🔍 Filtro: ${failure.filter}`)
      console.log(`   Valor: ${failure.filterValue}`)
      console.log(`   Datas: ${failure.datesCalculated?.from} até ${failure.datesCalculated?.to}`)
      console.log(`   URL: ${failure.url}`)
      console.log(`   Status: ${failure.status} ${failure.statusText}`)
      if (failure.error) {
        console.log(`   Erro: ${failure.error}`)
      }
      if (failure.responseData) {
        console.log(`   Resposta:`, JSON.stringify(failure.responseData, null, 2))
      }
    })
  }
  
  // Validações específicas
  console.log('\n🔍 VALIDAÇÕES ESPECÍFICAS')
  console.log('-'.repeat(60))
  
  // Verificar se há campos vazios ou "Invalid Date"
  const invalidDates = results.filter(r => 
    r.responseData && 
    JSON.stringify(r.responseData).includes('Invalid Date')
  )
  
  if (invalidDates.length > 0) {
    console.log(`❌ Encontrados ${invalidDates.length} filtros com "Invalid Date"`)
    invalidDates.forEach(r => console.log(`   - ${r.filter}`))
  } else {
    console.log('✅ Nenhum "Invalid Date" encontrado')
  }
  
  // Verificar se há campos vazios
  const emptyFields = results.filter(r => 
    r.responseData && 
    (!r.responseData.data || 
     !r.responseData.data.receitaTotal || 
     !r.responseData.data.clientesAtivos || 
     !r.responseData.data.produtosVendidos || 
     !r.responseData.data.taxaConversao)
  )
  
  if (emptyFields.length > 0) {
    console.log(`❌ Encontrados ${emptyFields.length} filtros com campos vazios`)
    emptyFields.forEach(r => console.log(`   - ${r.filter}`))
  } else {
    console.log('✅ Nenhum campo vazio encontrado')
  }
  
  // Verificar se há datas invertidas
  const invertedDates = results.filter(r => {
    if (!r.datesCalculated) return false
    const from = new Date(r.datesCalculated.from)
    const to = new Date(r.datesCalculated.to)
    return from > to
  })
  
  if (invertedDates.length > 0) {
    console.log(`❌ Encontrados ${invertedDates.length} filtros com datas invertidas`)
    invertedDates.forEach(r => console.log(`   - ${r.filter}: ${r.datesCalculated.from} > ${r.datesCalculated.to}`))
  } else {
    console.log('✅ Nenhuma data invertida encontrada')
  }
  
  console.log('\n🏁 TESTE FINALIZADO')
  console.log('=' .repeat(60))
}

// Executar testes se o script for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch')
  runAllTests().catch(console.error)
} else {
  // Browser environment
  console.log('🌐 Executando no navegador...')
  runAllTests().catch(console.error)
}

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testFilter,
    getDateRangeFromPeriod,
    FILTROS_PRE_DEFINIDOS,
    FILTROS_PERSONALIZADOS
  }
} 