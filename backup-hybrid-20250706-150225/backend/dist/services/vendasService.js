"use strict";
// Serviço de vendas - integração com ERP GestãoClick
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros
// IMPORTANTE: Somente leitura - nunca modifica dados no ERP
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendasService = void 0;
const erpIntegrationService_1 = require("./erpIntegrationService");
class VendasService {
    constructor() {
        console.log('[VendasService] Inicializando serviço de vendas');
        this.erpService = new erpIntegrationService_1.ERPIntegrationService();
    }
    // Converter dados do ERP para formato do frontend
    mapERPToVenda(erpVenda) {
        console.log(`[VendasService] Mapeando venda ERP ID: ${erpVenda.id}`);
        return {
            id: erpVenda.id,
            numero: erpVenda.codigo || erpVenda.id,
            data: erpVenda.data,
            cliente: {
                id: erpVenda.cliente_id || '',
                nome: erpVenda.nome_cliente || 'Cliente não identificado',
                email: '', // Será preenchido pelo serviço de clientes
                telefone: '' // Será preenchido pelo serviço de clientes
            },
            valorTotal: parseFloat(erpVenda.valor_total) || 0,
            valorLiquido: parseFloat(erpVenda.valor_total) || 0, // Valor líquido = valor total no ERP
            status: erpVenda.nome_situacao || 'Pendente',
            formaPagamento: erpVenda.nome_canal_venda || 'Não informado',
            itens: [
                // Produtos
                ...(erpVenda.produtos || []).map(item => ({
                    id: item.produto.produto_id.toString(),
                    produto: {
                        id: item.produto.produto_id.toString(),
                        nome: item.produto.nome_produto || 'Produto não identificado',
                        codigo: item.produto.produto_id.toString(),
                        categoria: ''
                    },
                    quantidade: parseFloat(item.produto.quantidade) || 0,
                    valorUnitario: parseFloat(item.produto.valor_venda) || 0,
                    valorTotal: parseFloat(item.produto.valor_total) || 0,
                    desconto: parseFloat(item.produto.desconto_valor || '0')
                })),
                // Serviços
                ...(erpVenda.servicos || []).map(item => ({
                    id: item.servico.id,
                    produto: {
                        id: item.servico.servico_id,
                        nome: item.servico.nome_servico || 'Serviço não identificado',
                        codigo: item.servico.servico_id,
                        categoria: 'Serviço'
                    },
                    quantidade: parseFloat(item.servico.quantidade) || 0,
                    valorUnitario: parseFloat(item.servico.valor_venda) || 0,
                    valorTotal: parseFloat(item.servico.valor_total) || 0,
                    desconto: parseFloat(item.servico.desconto_valor || '0')
                }))
            ],
            observacoes: erpVenda.observacoes || erpVenda.observacoes_interna || undefined,
            vendedor: erpVenda.nome_vendedor,
            desconto: 0, // Calculado a partir dos descontos dos itens
            frete: parseFloat(erpVenda.valor_frete) || 0
        };
    }
    // Buscar vendas do ERP
    async getVendas(filtros = {}) {
        console.log('[VendasService] Buscando vendas com filtros:', filtros);
        try {
            // Converter filtros para formato do ERP
            const erpFiltros = {
                data_inicio: filtros.dataInicio,
                data_fim: filtros.dataFim,
                cliente_id: filtros.clienteId ? parseInt(filtros.clienteId) : undefined,
                situacao_id: filtros.status ? parseInt(filtros.status) : undefined,
                // vendedor e formaPagamento não existem no ERP, serão filtrados localmente
                // page, limit, ordenarPor, ordem não existem no ERP, serão tratados localmente
            };
            // Buscar dados do ERP
            const erpVendas = await this.erpService.getVendas(erpFiltros);
            // Mapear para formato do frontend
            const vendas = erpVendas.map(venda => this.mapERPToVenda(venda));
            // Calcular paginação (assumindo que o ERP retorna dados paginados)
            const total = erpVendas.length; // Em produção, o ERP deve retornar o total real
            const pagina = filtros.page || 1;
            const totalPaginas = Math.ceil(total / (filtros.limit || 20));
            console.log(`[VendasService] Retornando ${vendas.length} vendas de ${total} total`);
            return {
                vendas,
                total,
                pagina,
                totalPaginas
            };
        }
        catch (error) {
            console.error('[VendasService] Erro ao buscar vendas:', error);
            throw error;
        }
    }
    // Buscar venda específica
    async getVendaById(id) {
        console.log(`[VendasService] Buscando venda por ID: ${id}`);
        try {
            const erpVenda = await this.erpService.getVendaById(id);
            return this.mapERPToVenda(erpVenda);
        }
        catch (error) {
            console.error(`[VendasService] Erro ao buscar venda ${id}:`, error);
            throw error;
        }
    }
    // Gerar analytics de vendas
    async getVendasAnalytics(filtros = {}) {
        console.log('[VendasService] Gerando analytics de vendas');
        try {
            // Buscar todas as vendas para análise (sem paginação)
            const { vendas } = await this.getVendas({
                ...filtros,
                page: 1,
                limit: 1000 // Buscar mais dados para análise
            });
            // Calcular métricas
            const totalVendas = vendas.length;
            const valorTotal = vendas.reduce((sum, venda) => sum + venda.valorTotal, 0);
            const valorMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
            // Vendas por status
            const vendasPorStatus = {};
            vendas.forEach(venda => {
                const status = venda.status;
                vendasPorStatus[status] = (vendasPorStatus[status] || 0) + 1;
            });
            // Vendas por mês (últimos 12 meses)
            const vendasPorMes = [];
            const meses = new Map();
            vendas.forEach(venda => {
                const data = new Date(venda.data);
                const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                const atual = meses.get(mesAno) || { quantidade: 0, valor: 0 };
                atual.quantidade++;
                atual.valor += venda.valorTotal;
                meses.set(mesAno, atual);
            });
            // Converter para array ordenado
            Array.from(meses.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([mes, dados]) => {
                vendasPorMes.push({
                    mes,
                    quantidade: dados.quantidade,
                    valor: dados.valor
                });
            });
            // Top clientes
            const clientesMap = new Map();
            vendas.forEach(venda => {
                const clienteId = venda.cliente.id;
                const atual = clientesMap.get(clienteId) || {
                    nome: venda.cliente.nome,
                    quantidade: 0,
                    valor: 0
                };
                atual.quantidade++;
                atual.valor += venda.valorTotal;
                clientesMap.set(clienteId, atual);
            });
            const topClientes = Array.from(clientesMap.entries())
                .map(([clienteId, dados]) => ({
                clienteId,
                clienteNome: dados.nome,
                quantidade: dados.quantidade,
                valor: dados.valor
            }))
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 10);
            // Top produtos
            const produtosMap = new Map();
            vendas.forEach(venda => {
                venda.itens.forEach(item => {
                    const produtoId = item.produto.id;
                    const atual = produtosMap.get(produtoId) || {
                        nome: item.produto.nome,
                        quantidade: 0,
                        valor: 0
                    };
                    atual.quantidade += item.quantidade;
                    atual.valor += item.valorTotal;
                    produtosMap.set(produtoId, atual);
                });
            });
            const topProdutos = Array.from(produtosMap.entries())
                .map(([produtoId, dados]) => ({
                produtoId,
                produtoNome: dados.nome,
                quantidade: dados.quantidade,
                valor: dados.valor
            }))
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 10);
            const analytics = {
                totalVendas,
                valorTotal,
                valorMedio,
                vendasPorStatus,
                vendasPorMes,
                topClientes,
                topProdutos
            };
            console.log('[VendasService] Analytics gerados com sucesso');
            return analytics;
        }
        catch (error) {
            console.error('[VendasService] Erro ao gerar analytics:', error);
            throw error;
        }
    }
    // Buscar vendas por período (para dashboard)
    async getVendasPorPeriodo(dataInicio, dataFim) {
        console.log(`[VendasService] Buscando vendas do período: ${dataInicio} até ${dataFim}`);
        try {
            const filtros = { dataInicio, dataFim };
            const { vendas } = await this.getVendas(filtros);
            const analytics = await this.getVendasAnalytics(filtros);
            return { vendas, analytics };
        }
        catch (error) {
            console.error('[VendasService] Erro ao buscar vendas por período:', error);
            throw error;
        }
    }
}
exports.VendasService = VendasService;
//# sourceMappingURL=vendasService.js.map