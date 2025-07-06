import React, { useEffect, useState } from 'react';

// Função de resumo adaptada para o formato do backend
function resumoVendasPeriodo(vendas: any[]) {
  const totalVendas = vendas.length;
  const valorTotal = vendas.reduce((sum, venda) => sum + (venda.valorTotal || 0), 0);
  const clientesQueCompraram = [...new Set(vendas.map(venda => venda.cliente?.nome))];
  const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;

  return {
    totalVendas,
    valorTotal,
    clientesQueCompraram,
    ticketMedio,
  };
}

const ResumoVendasPeriodo: React.FC = () => {
  const [resumo, setResumo] = useState<ReturnType<typeof resumoVendasPeriodo> | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/vendas?pagina=1&limite_por_pagina=1000')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setResumo(resumoVendasPeriodo(json.data));
        } else {
          setErro('Erro ao buscar vendas');
        }
        setLoading(false);
      })
      .catch(() => {
        setErro('Erro ao buscar vendas');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando resumo...</div>;
  if (erro) return <div style={{color: 'red'}}>{erro}</div>;
  if (!resumo) return null;

  return (
    <div style={{border: '1px solid #ccc', borderRadius: 8, padding: 24, maxWidth: 500}}>
      <h2>Resumo das Vendas (1ª página, até 1000 vendas)</h2>
      <p><b>Total de vendas:</b> {resumo.totalVendas}</p>
      <p><b>Valor total:</b> R$ {resumo.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
      <p><b>Ticket médio:</b> R$ {resumo.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
      <p><b>Clientes únicos:</b> {resumo.clientesQueCompraram.length}</p>
      <details>
        <summary>Ver nomes dos clientes</summary>
        <ul>
          {resumo.clientesQueCompraram.map((nome, i) => <li key={i}>{nome}</li>)}
        </ul>
      </details>
    </div>
  );
};

export default ResumoVendasPeriodo; 