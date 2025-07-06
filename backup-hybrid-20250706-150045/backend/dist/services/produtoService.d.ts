import { Produto, ProdutoResponse, SazonalidadeResponse, MatrizABCResponse, ProdutoFiltros } from '../types/produtos';
export declare class ProdutoService {
    private produtos;
    getProdutos(filtros: ProdutoFiltros): Promise<ProdutoResponse>;
    getTopProdutos(limit?: number): Promise<Produto[]>;
    getSazonalidade(periodo?: string): Promise<SazonalidadeResponse>;
    getMatrizABC(): Promise<MatrizABCResponse>;
}
//# sourceMappingURL=produtoService.d.ts.map