export interface Venda {
    id: string;
    numero: string;
    data: string;
    cliente: {
        id: string;
        nome: string;
        email?: string;
        telefone?: string;
    };
    valorTotal: number;
    valorLiquido: number;
    status: string;
    formaPagamento: string;
    itens: VendaItem[];
    observacoes?: string;
    vendedor?: string;
    desconto?: number;
    frete?: number;
}
export interface VendaItem {
    id: string;
    produto: {
        id: string;
        nome: string;
        codigo: string;
        categoria?: string;
    };
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    desconto?: number;
}
export interface VendasFiltros {
    dataInicio?: string;
    dataFim?: string;
    clienteId?: string;
    status?: string;
    vendedor?: string;
    formaPagamento?: string;
    page?: number;
    limit?: number;
    ordenarPor?: 'data' | 'valor' | 'cliente';
    ordem?: 'asc' | 'desc';
}
export interface VendasAnalytics {
    totalVendas: number;
    valorTotal: number;
    valorMedio: number;
    vendasPorStatus: Record<string, number>;
    vendasPorMes: Array<{
        mes: string;
        quantidade: number;
        valor: number;
    }>;
    topClientes: Array<{
        clienteId: string;
        clienteNome: string;
        quantidade: number;
        valor: number;
    }>;
    topProdutos: Array<{
        produtoId: string;
        produtoNome: string;
        quantidade: number;
        valor: number;
    }>;
}
export declare class VendasService {
    private erpService;
    constructor();
    private mapERPToVenda;
    getVendas(filtros?: VendasFiltros): Promise<{
        vendas: Venda[];
        total: number;
        pagina: number;
        totalPaginas: number;
    }>;
    getVendaById(id: string): Promise<Venda>;
    getVendasAnalytics(filtros?: VendasFiltros): Promise<VendasAnalytics>;
    getVendasPorPeriodo(dataInicio: string, dataFim: string): Promise<{
        vendas: Venda[];
        analytics: VendasAnalytics;
    }>;
}
//# sourceMappingURL=vendasService.d.ts.map