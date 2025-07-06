export interface Cliente {
    id: string;
    nome: string;
    razaoSocial?: string;
    tipoPessoa: 'PF' | 'PJ' | 'ES';
    documento: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    telefone: string;
    celular: string;
    email: string;
    ativo: boolean;
    dataNascimento?: string;
    enderecos: ClienteEndereco[];
    contatos: ClienteContato[];
    ultimaCompra?: string;
    totalCompras?: number;
    valorTotalCompras?: number;
    frequenciaCompras?: number;
    recencia?: number;
    valorMedio?: number;
}
export interface ClienteEndereco {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
}
export interface ClienteContato {
    tipo?: string;
    nome: string;
    contato: string;
    cargo?: string;
    observacao?: string;
}
export interface ClientesFiltros {
    nome?: string;
    documento?: string;
    email?: string;
    telefone?: string;
    tipoPessoa?: 'PF' | 'PJ' | 'ES';
    ativo?: boolean;
    cidade?: string;
    estado?: string;
    page?: number;
    limit?: number;
    ordenarPor?: 'nome' | 'documento' | 'ultimaCompra' | 'valorTotal';
    ordem?: 'asc' | 'desc';
}
export interface ClientesAnalytics {
    totalClientes: number;
    clientesAtivos: number;
    clientesInativos: number;
    clientesPorTipo: Record<string, number>;
    clientesPorEstado: Record<string, number>;
    topClientes: Array<{
        clienteId: string;
        clienteNome: string;
        totalCompras: number;
        valorTotal: number;
        ultimaCompra: string;
    }>;
    clientesNovos: Array<{
        clienteId: string;
        clienteNome: string;
        dataCadastro: string;
    }>;
    segmentacaoRFM: {
        campeoes: number;
        clientesLeais: number;
        clientesEmRisco: number;
        clientesPerdidos: number;
        novosClientes: number;
    };
}
export interface RFMAnalytics {
    clientes: Array<{
        clienteId: string;
        clienteNome: string;
        recencia: number;
        frequencia: number;
        valorMonetario: number;
        scoreRFM: number;
        segmento: string;
    }>;
    segmentos: Record<string, number>;
    mediaRFM: {
        recencia: number;
        frequencia: number;
        valorMonetario: number;
    };
}
export declare class ClientesService {
    private erpService;
    constructor();
    private mapERPToCliente;
    getClientes(filtros?: ClientesFiltros): Promise<{
        clientes: Cliente[];
        total: number;
        pagina: number;
        totalPaginas: number;
    }>;
    getClienteById(id: string): Promise<Cliente>;
    getClientesAnalytics(): Promise<ClientesAnalytics>;
    getRFMAnalytics(): Promise<RFMAnalytics>;
}
//# sourceMappingURL=clientesService.d.ts.map