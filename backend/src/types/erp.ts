// Tipos para integração com ERP GestãoClick
// Baseado na documentação oficial da API

// Resposta padrão da API do ERP
export interface ERPResponse<T> {
  code: number
  status: string
  meta?: {
    total_registros?: number
    total_paginas?: number
    total_registros_pagina?: number
    pagina_atual?: number
    limite_por_pagina?: number
    pagina_anterior?: string | null
    url_anterior?: string | null
    proxima_pagina?: string | null
    proxima_url?: string | null
  }
  data: T
}

// Tipos para Produtos do ERP
export interface ERPProduto {
  id: string
  nome: string
  codigo_interno: string
  codigo_barra: string
  possui_variacao: string
  possui_composicao: string
  movimenta_estoque: string
  peso: string
  largura: string
  altura: string
  comprimento: string
  ativo: string
  grupo_id: string
  nome_grupo: string
  descricao: string
  estoque: number
  valor_custo: string
  valor_venda: string
  valores: Array<{
    tipo_id: string
    nome_tipo: string
    lucro_utilizado: string
    valor_custo: string
    valor_venda: string
  }>
  variacoes: Array<{
    variacao: {
      id: string
      nome: string
      estoque: string
      valores: Array<{
        tipo_id: string
        nome_tipo: string
        lucro_utilizado: string
        valor_custo: string
        valor_venda: string
      }>
    }
  }>
  fiscal: {
    ncm: string
    cest: string
    peso_liquido: string | null
    peso_bruto: string | null
    valor_aproximado_tributos: string | null
    valor_fixo_pis: string | null
    valor_fixo_pis_st: string | null
    valor_fixo_confins: string | null
    valor_fixo_confins_st: string | null
  }
}

// Tipos para Vendas do ERP
export interface ERPVenda {
  id: string
  codigo: string
  cliente_id: string
  nome_cliente: string
  vendedor_id: string
  nome_vendedor: string
  tecnico_id: string | null
  nome_tecnico: string | null
  data: string
  previsao_entrega: string | null
  situacao_id: string
  nome_situacao: string
  valor_total: string
  transportadora_id: string | null
  nome_transportadora: string | null
  centro_custo_id: string
  nome_centro_custo: string
  aos_cuidados_de: string | null
  validade: string | null
  introducao: string | null
  observacoes: string | null
  observacoes_interna: string | null
  valor_frete: string
  nome_canal_venda: string
  nome_loja: string
  valor_custo: string
  condicao_pagamento: string
  situacao_financeiro: string
  situacao_estoque: string
  forma_pagamento_id: string
  data_primeira_parcela: string
  numero_parcelas: string
  intervalo_dias: string
  hash: string
  equipamentos: any[]
  pagamentos: Array<{
    pagamento: {
      data_vencimento: string
      valor: string
      forma_pagamento_id: string
      nome_forma_pagamento: string
      plano_contas_id: string
      nome_plano_conta: string
      observacao: string
    }
  }>
  produtos: Array<{
    produto: {
      produto_id: number
      variacao_id: number
      nome_produto: string | null
      detalhes: string
      movimenta_estoque: string
      possui_variacao: string
      sigla_unidade: string | null
      quantidade: string
      tipo_valor_id: string | null
      nome_tipo_valor: string | null
      valor_custo: string
      valor_venda: string
      tipo_desconto: string
      desconto_valor: string | null
      desconto_porcentagem: string | null
      valor_total: string
    }
  }>
  servicos: Array<{
    servico: {
      id: string
      servico_id: string
      nome_servico: string
      detalhes: string
      sigla_unidade: string | null
      quantidade: string
      tipo_valor_id: string | null
      nome_tipo_valor: string | null
      valor_custo: string
      valor_venda: string
      tipo_desconto: string
      desconto_valor: string | null
      desconto_porcentagem: string | null
      valor_total: string
    }
  }>
}

// Tipos para Clientes do ERP
export interface ERPCliente {
  id: string
  tipo_pessoa: string
  nome: string
  razao_social: string | null
  cnpj: string | null
  inscricao_estadual: string | null
  inscricao_municipal: string | null
  cpf: string | null
  rg: string | null
  data_nascimento: string | null
  telefone: string
  celular: string
  fax: string | null
  email: string
  ativo: string
  contatos: Array<{
    contato: {
      tipo_id?: string
      nome_tipo?: string
      nome: string
      contato: string
      cargo: string
      observacao: string
    }
  }>
  enderecos: Array<{
    endereco: {
      cep: string
      logradouro: string
      numero: string
      complemento: string | null
      bairro: string
      cidade_id: string
      nome_cidade: string
      estado: string
    }
  }>
}

// Filtros para requisições
export interface ERPProdutoFiltros {
  loja_id?: number
  nome?: string
  codigo?: string
  grupo_id?: number
  fornecedor_id?: number
  ativo?: number
  // Campos para sincronização incremental (quando o ERP suportar)
  data_modificacao_inicio?: string // Data de início da modificação (YYYY-MM-DD HH:MM:SS)
  data_modificacao_fim?: string // Data de fim da modificação (YYYY-MM-DD HH:MM:SS)
  modificado_apos?: string // Data de modificação (para sincronização incremental)
}

export interface ERPVendaFiltros {
  loja_id?: number
  tipo?: 'produto' | 'servico' | 'vendas_balcao'
  codigo?: number
  nome?: string
  situacao_id?: number
  data_inicio?: string
  data_fim?: string
  cliente_id?: number
  centro_custo_id?: number
  // Campos para sincronização incremental (quando o ERP suportar)
  data_modificacao_inicio?: string // Data de início da modificação (YYYY-MM-DD HH:MM:SS)
  data_modificacao_fim?: string // Data de fim da modificação (YYYY-MM-DD HH:MM:SS)
  modificado_apos?: string // Data de modificação (para sincronização incremental)
  criado_apos?: string // Data de criação (para sincronização incremental)
}

export interface ERPClienteFiltros {
  tipo_pessoa?: 'PF' | 'PJ' | 'ES'
  nome?: string
  cpf_cnpj?: string
  telefone?: string
  email?: string
  situacao?: number
  cidade_id?: number
  estado?: string
  // Campos para sincronização incremental (quando o ERP suportar)
  data_modificacao_inicio?: string // Data de início da modificação (YYYY-MM-DD HH:MM:SS)
  data_modificacao_fim?: string // Data de fim da modificação (YYYY-MM-DD HH:MM:SS)
  modificado_apos?: string // Data de modificação (para sincronização incremental)
} 