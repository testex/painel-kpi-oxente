export declare class ErpService {
    getProdutos(page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            id: number;
            nome: string;
            categoria: string;
            preco: number;
            estoque: number;
            vendas: number;
            receita: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
//# sourceMappingURL=erpService.d.ts.map