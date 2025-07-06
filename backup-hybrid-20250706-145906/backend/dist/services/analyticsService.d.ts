export declare class AnalyticsService {
    getTopProdutos(limit?: number): Promise<{
        id: number;
        nome: string;
        vendas: number;
        receita: number;
        margem: number;
    }[]>;
    getProdutosSazonalidade(periodo?: string): Promise<{
        id: number;
        nome: string;
        vendas: number;
        sazonalidade: number;
        status: string;
    }[]>;
    getMatrizABC(): Promise<{
        id: number;
        nome: string;
        receita: number;
        frequencia: number;
        classificacaoReceita: string;
        classificacaoFrequencia: string;
        quadrante: string;
    }[]>;
}
//# sourceMappingURL=analyticsService.d.ts.map