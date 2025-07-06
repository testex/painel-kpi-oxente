const axios = require('axios');

async function calculateVendasTotal() {
  try {
    console.log('🔍 Calculando total de vendas para 01/06/25 a 30/06/25...');
    
    const response = await axios.get('http://localhost:3001/api/vendas?dataInicio=2025-06-01&dataFim=2025-06-30&limit=1000');
    
    if (response.data.success) {
      const vendas = response.data.data;
      console.log(`📊 Total de vendas encontradas: ${vendas.length}`);
      
      // Calcular total
      const total = vendas.reduce((sum, venda) => {
        const valor = parseFloat(venda.valorTotal) || 0;
        return sum + valor;
      }, 0);
      
      console.log(`💰 Total calculado: R$ ${total.toFixed(2)}`);
      console.log(`📋 Valor esperado (ERP): R$ 116.862,03`);
      console.log(`📋 Valor retornado (Dashboard): R$ 34.929,99`);
      
      const diferenca = total - 116862.03;
      console.log(`\n🔍 Análise:`);
      console.log(`- Diferença entre API e ERP: R$ ${diferenca.toFixed(2)}`);
      console.log(`- Diferença entre Dashboard e ERP: R$ ${(34929.99 - 116862.03).toFixed(2)}`);
      console.log(`- Diferença entre API e Dashboard: R$ ${(total - 34929.99).toFixed(2)}`);
      
      // Verificar status das vendas
      const statusCount = {};
      vendas.forEach(venda => {
        const status = venda.status || 'Sem status';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      console.log(`\n📈 Status das vendas:`);
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`- ${status}: ${count} vendas`);
      });
      
      // Verificar se há vendas com status diferente de "Concretizada"
      const vendasNaoConcretizadas = vendas.filter(v => v.status !== 'Concretizada');
      if (vendasNaoConcretizadas.length > 0) {
        console.log(`\n⚠️ Vendas não concretizadas encontradas:`);
        vendasNaoConcretizadas.forEach(v => {
          console.log(`- Venda ${v.numero}: ${v.status} - R$ ${v.valorTotal}`);
        });
      }
      
      return { total, vendas };
    } else {
      console.error('❌ Erro na resposta da API');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao calcular total:', error.message);
    return null;
  }
}

calculateVendasTotal(); 