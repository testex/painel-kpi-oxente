const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Função para testar endpoint com filtros
async function testEndpoint(endpoint, filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const url = `${BASE_URL}${endpoint}?${params.toString()}`;
    console.log(`\n🔍 Testando: ${url}`);
    
    const response = await axios.get(url);
    
    if (response.data.success) {
      console.log(`✅ Sucesso: ${response.data.data?.length || 0} registros`);
      
      // Verificar se há dados mockados
      const hasMockData = checkForMockData(response.data);
      if (hasMockData) {
        console.log(`⚠️  ATENÇÃO: Possíveis dados mockados encontrados!`);
      } else {
        console.log(`✅ Dados reais do ERP confirmados`);
      }
      
      return response.data;
    } else {
      console.log(`❌ Erro: ${response.data.message || 'Erro desconhecido'}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`);
    return null;
  }
}

// Função para verificar dados mockados
function checkForMockData(data) {
  const mockIndicators = [
    'mock', 'simulado', 'fake', 'teste', 'exemplo',
    'João Silva', 'Maria Santos', 'Empresa ABC',
    'Smartphone Galaxy', 'Notebook Dell'
  ];
  
  const dataStr = JSON.stringify(data).toLowerCase();
  return mockIndicators.some(indicator => 
    dataStr.includes(indicator.toLowerCase())
  );
}

// Testar filtros temporais
async function testTemporalFilters() {
  console.log('🚀 Iniciando testes de validação do patch...\n');
  
  // Testar dashboard analytics
  console.log('📊 Testando Dashboard Analytics:');
  await testEndpoint('/dashboard/analytics');
  await testEndpoint('/dashboard/analytics', { dataInicio: '2025-07-01', dataFim: '2025-07-31' });
  await testEndpoint('/dashboard/analytics', { periodo: 'mes-atual' });
  await testEndpoint('/dashboard/analytics', { periodo: 'mes-anterior' });
  
  // Testar produtos
  console.log('\n📦 Testando Produtos:');
  await testEndpoint('/produtos', { limit: 5 });
  await testEndpoint('/produtos', { categoria: 'todos', limit: 3 });
  await testEndpoint('/produtos', { busca: 'tinta', limit: 3 });
  
  // Testar clientes
  console.log('\n👥 Testando Clientes:');
  await testEndpoint('/clientes', { limit: 3 });
  await testEndpoint('/clientes', { tipoPessoa: 'PJ', limit: 3 });
  await testEndpoint('/clientes', { ativo: true, limit: 3 });
  
  // Testar vendas
  console.log('\n💰 Testando Vendas:');
  await testEndpoint('/vendas', { limit: 3 });
  await testEndpoint('/vendas', { dataInicio: '2025-07-01', dataFim: '2025-07-31', limit: 3 });
  await testEndpoint('/vendas', { status: 'Concretizada', limit: 3 });
  
  // Testar analytics específicos
  console.log('\n📈 Testando Analytics Específicos:');
  // Produtos
  await testEndpoint('/produtos/sazonalidade');
  await testEndpoint('/produtos/matriz-abc');
  // Clientes
  await testEndpoint('/clientes/analytics/geral');
  await testEndpoint('/clientes/analytics/rfm');
  // Vendas
  await testEndpoint('/vendas/analytics/geral');
  await testEndpoint('/vendas/analytics/periodo', { dataInicio: '2025-07-01', dataFim: '2025-07-31' });
  
  console.log('\n🎉 Testes de validação concluídos!');
}

// Executar testes
testTemporalFilters().catch(console.error); 