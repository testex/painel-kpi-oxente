export interface Produto {
    id: number;
    nome: string;
    categoria: string;
    preco: number;
    estoque: number;
    vendas: number;
    receita: number;
    ticketMedio?: number;
    crescimento?: number;
}
export interface ProdutoResponse {
    success: boolean;
    data: Produto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface SazonalidadeItem {
    produto: string;
    coeficienteVariacao: number;
    totalVendas: number;
    totalReceita: number;
    tendencia: string;
    status: string;
}
export interface SazonalidadeResponse {
    success: boolean;
    data: SazonalidadeItem[];
    meta: {
        periodo: string;
        totalProdutos: number;
        altaSazonalidade: number;
        mediaSazonalidade: number;
        baixaSazonalidade: number;
    };
}
export interface MatrizABCItem {
    nome: string;
    vendas: number;
    receita: number;
    frequencia: number;
    classificacaoReceita: 'A' | 'B' | 'C';
    classificacaoFrequencia: 'A' | 'B' | 'C';
    quadrante: string;
    prioridade: string;
    percentualReceita: number;
}
export interface MatrizABCResponse {
    success: boolean;
    data: MatrizABCItem[];
    quadrantes: Record<string, MatrizABCItem[]>;
    resumo: {
        totalProdutos: number;
        classeA_receita: number;
        classeA_frequencia: number;
        produtosCriticos: number;
        produtosOportunidade: number;
        receita80_20: number;
    };
    meta: {
        algoritmo: string;
        criterios: {
            receita: string;
            frequencia: string;
        };
    };
}
export interface ProdutoFiltros {
    page?: number;
    limit?: number;
    periodo?: string;
    dataInicio?: string;
    dataFim?: string;
    categoria?: string;
    busca?: string;
}
//# sourceMappingURL=produtos.d.ts.map