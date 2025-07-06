const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function auditERPIntegration() {
  console.log('🔍 AUDITORIA DETALHADA DA INTEGRAÇÃO COM ERP');
  console.log('=' .repeat(60));
  
  try {
    // 1. Testar endpoint direto de vendas do ERP
    console.log('\n📊 1. TESTANDO ENDPOINT DIRETO DE VENDAS');
    console.log('-'.repeat(40));
    
    const vendasResponse = await axios.get(`${BASE_URL}/vendas?dataInicio=2025-06-01&dataFim=2025-06-30&limit=1000`);
    
    if (vendasResponse.data.success) {
      const vendas = vendasResponse.data.data;
      const pagination = vendasResponse.data.pagination;
      
      console.log(`✅ Vendas encontradas: ${vendas.length}`);
      console.log(`📋 Paginação: ${JSON.stringify(pagination)}`);
      
      // Calcular total manualmente
      const totalManual = vendas.reduce((sum, venda) => {
        const valor = parseFloat(venda.valorTotal) || 0;
        return sum + valor;
      }, 0);
      
      console.log(`💰 Total calculado manualmente: R$ ${totalManual.toFixed(2)}`);
      
      // Verificar status das vendas
      const statusCount = {};
      vendas.forEach(venda => {
        const status = venda.status || 'Sem status';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      console.log('\n📈 Status das vendas:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count} vendas`);
      });
      
      // Verificar se há vendas com valores zero ou negativos
      const vendasZero = vendas.filter(v => parseFloat(v.valorTotal) <= 0);
      if (vendasZero.length > 0) {
        console.log(`\n⚠️ Vendas com valor zero/negativo: ${vendasZero.length}`);
        vendasZero.slice(0, 5).forEach(v => {
          console.log(`  - Venda ${v.numero}: R$ ${v.valorTotal} (${v.status})`);
        });
      }
      
    } else {
      console.log('❌ Erro na resposta de vendas');
    }
    
    // 2. Testar endpoint de analytics de vendas
    console.log('\n📊 2. TESTANDO ENDPOINT DE ANALYTICS DE VENDAS');
    console.log('-'.repeat(40));
    
    const analyticsResponse = await axios.get(`${BASE_URL}/vendas/analytics/geral?dataInicio=2025-06-01&dataFim=2025-06-30`);
    
    if (analyticsResponse.data.success) {
      const analytics = analyticsResponse.data.data;
      console.log(`✅ Analytics gerados com sucesso`);
      console.log(`📊 Total de vendas: ${analytics.totalVendas}`);
      console.log(`💰 Valor total: R$ ${analytics.valorTotal.toFixed(2)}`);
      console.log(`📈 Valor médio: R$ ${analytics.valorMedio.toFixed(2)}`);
      
      console.log('\n📈 Vendas por status:');
      Object.entries(analytics.vendasPorStatus).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count} vendas`);
      });
      
    } else {
      console.log('❌ Erro na resposta de analytics');
    }
    
    // 3. Testar endpoint do dashboard
    console.log('\n📊 3. TESTANDO ENDPOINT DO DASHBOARD');
    console.log('-'.repeat(40));
    
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/analytics?dataInicio=2025-06-01&dataFim=2025-06-30`);
    
    if (dashboardResponse.data.success) {
      const dashboard = dashboardResponse.data.data;
      console.log(`✅ Dashboard gerado com sucesso`);
      console.log(`💰 Receita total: ${dashboard.receitaTotal.formatado}`);
      console.log(`📊 Valor bruto: R$ ${dashboard.receitaTotal.valor.toFixed(2)}`);
      console.log(`📈 Variação: ${dashboard.receitaTotal.variacao}%`);
      
    } else {
      console.log('❌ Erro na resposta do dashboard');
    }
    
    // 4. Comparar valores
    console.log('\n📊 4. COMPARAÇÃO DE VALORES');
    console.log('-'.repeat(40));
    
    const vendasTotal = vendasResponse.data.success ? 
      vendasResponse.data.data.reduce((sum, v) => sum + (parseFloat(v.valorTotal) || 0), 0) : 0;
    
    const analyticsTotal = analyticsResponse.data.success ? 
      analyticsResponse.data.data.valorTotal : 0;
    
    const dashboardTotal = dashboardResponse.data.success ? 
      dashboardResponse.data.data.receitaTotal.valor : 0;
    
    console.log(`📋 Valores encontrados:`);
    console.log(`  - Endpoint /vendas: R$ ${vendasTotal.toFixed(2)}`);
    console.log(`  - Endpoint /vendas/analytics: R$ ${analyticsTotal.toFixed(2)}`);
    console.log(`  - Endpoint /dashboard: R$ ${dashboardTotal.toFixed(2)}`);
    console.log(`  - Valor esperado (ERP): R$ 116.862,03`);
    
    console.log(`\n🔍 Diferenças:`);
    console.log(`  - /vendas vs ERP: R$ ${(vendasTotal - 116862.03).toFixed(2)}`);
    console.log(`  - /analytics vs ERP: R$ ${(analyticsTotal - 116862.03).toFixed(2)}`);
    console.log(`  - /dashboard vs ERP: R$ ${(dashboardTotal - 116862.03).toFixed(2)}`);
    console.log(`  - /vendas vs /dashboard: R$ ${(vendasTotal - dashboardTotal).toFixed(2)}`);
    
    // 5. Verificar se há paginação
    if (vendasResponse.data.pagination) {
      const pag = vendasResponse.data.pagination;
      console.log(`\n📄 Informações de paginação:`);
      console.log(`  - Total de registros: ${pag.total}`);
      console.log(`  - Página atual: ${pag.pagina}`);
      console.log(`  - Total de páginas: ${pag.totalPaginas}`);
      console.log(`  - Por página: ${pag.porPagina}`);
      
      if (pag.total > pag.porPagina) {
        console.log(`⚠️ ATENÇÃO: Há mais páginas! O total real pode ser maior.`);
        console.log(`   Para obter todos os dados, seria necessário buscar ${pag.totalPaginas} páginas.`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na auditoria:', error.message);
  }
}

auditERPIntegration(); 