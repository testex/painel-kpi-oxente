"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErpService = void 0;
class ErpService {
    async getProdutos(page = 1, limit = 20) {
        // Mock data para produtos do ERP
        const mockProdutos = [
            {
                id: 1,
                nome: 'Produto A',
                categoria: 'Eletrônicos',
                preco: 100.00,
                estoque: 50,
                vendas: 150,
                receita: 15000
            },
            {
                id: 2,
                nome: 'Produto B',
                categoria: 'Informática',
                preco: 200.00,
                estoque: 30,
                vendas: 120,
                receita: 12000
            },
            {
                id: 3,
                nome: 'Produto C',
                categoria: 'Acessórios',
                preco: 50.00,
                estoque: 100,
                vendas: 100,
                receita: 10000
            },
            {
                id: 4,
                nome: 'Produto D',
                categoria: 'Eletrônicos',
                preco: 150.00,
                estoque: 25,
                vendas: 80,
                receita: 8000
            },
            {
                id: 5,
                nome: 'Produto E',
                categoria: 'Informática',
                preco: 300.00,
                estoque: 15,
                vendas: 60,
                receita: 6000
            }
        ];
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProdutos = mockProdutos.slice(startIndex, endIndex);
        return {
            success: true,
            data: paginatedProdutos,
            meta: {
                total: mockProdutos.length,
                page,
                limit,
                totalPages: Math.ceil(mockProdutos.length / limit),
                hasNext: endIndex < mockProdutos.length,
                hasPrev: page > 1
            }
        };
    }
}
exports.ErpService = ErpService;
//# sourceMappingURL=erpService.js.map