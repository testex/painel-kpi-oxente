"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
class AnalyticsService {
    async getTopProdutos(limit = 10) {
        // Mock data para top produtos
        return [
            {
                id: 1,
                nome: 'Produto A',
                vendas: 150,
                receita: 15000,
                margem: 0.25
            },
            {
                id: 2,
                nome: 'Produto B',
                vendas: 120,
                receita: 12000,
                margem: 0.30
            },
            {
                id: 3,
                nome: 'Produto C',
                vendas: 100,
                receita: 10000,
                margem: 0.20
            }
        ].slice(0, limit);
    }
    async getProdutosSazonalidade(periodo = 'ano-atual') {
        // Mock data para sazonalidade
        return [
            {
                id: 1,
                nome: 'Produto A',
                vendas: 150,
                sazonalidade: 0.8,
                status: 'estavel'
            },
            {
                id: 2,
                nome: 'Produto B',
                vendas: 120,
                sazonalidade: 0.6,
                status: 'moderado'
            }
        ];
    }
    async getMatrizABC() {
        // Mock data para matriz ABC
        return [
            {
                id: 1,
                nome: 'Produto A',
                receita: 15000,
                frequencia: 0.15,
                classificacaoReceita: 'A',
                classificacaoFrequencia: 'A',
                quadrante: 'AA'
            },
            {
                id: 2,
                nome: 'Produto B',
                receita: 12000,
                frequencia: 0.12,
                classificacaoReceita: 'A',
                classificacaoFrequencia: 'B',
                quadrante: 'AB'
            }
        ];
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analyticsService.js.map