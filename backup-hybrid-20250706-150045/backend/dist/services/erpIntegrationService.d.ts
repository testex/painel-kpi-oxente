import { ERPProduto, ERPVenda, ERPCliente, ERPProdutoFiltros, ERPVendaFiltros, ERPClienteFiltros } from '../types/erp';
export declare class ERPIntegrationService {
    private cache;
    private rateLimiter;
    constructor();
    private makeERPRequest;
    getProdutos(filtros?: ERPProdutoFiltros): Promise<ERPProduto[]>;
    getVendas(filtros?: ERPVendaFiltros): Promise<ERPVenda[]>;
    getClientes(filtros?: ERPClienteFiltros): Promise<ERPCliente[]>;
    getProdutoById(id: string): Promise<ERPProduto>;
    getVendaById(id: string): Promise<ERPVenda>;
    getClienteById(id: string): Promise<ERPCliente>;
    clearCache(): void;
    checkConnection(): Promise<boolean>;
}
//# sourceMappingURL=erpIntegrationService.d.ts.map