// Serviço de clientes - integração com ERP GestãoClick
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros
// IMPORTANTE: Somente leitura - nunca modifica dados no ERP

import { ERPIntegrationService } from './erpIntegrationService'
import { ERPCliente, ERPClienteFiltros } from '../types/erp'

// Tipos para o frontend
export interface Cliente {
  id: string
  nome: string
  razaoSocial?: string
  tipoPessoa: 'PF' | 'PJ' | 'ES'
  documento: string // CPF ou CNPJ
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  telefone: string
  celular: string
  email: string
  ativo: boolean
  dataNascimento?: string
  enderecos: ClienteEndereco[]
  contatos: ClienteContato[]
  // Campos calculados para RFM
  ultimaCompra?: string
  totalCompras?: number
  valorTotalCompras?: number
  frequenciaCompras?: number
  recencia?: number // dias desde última compra
  valorMedio?: number
  dataCadastro: string
  valorTotal: number
  rfm: {
    recencia: number
    frequencia: number
    valor: number
    segmento: string
  }
}

export interface ClienteEndereco {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface ClienteContato {
  tipo?: string
  nome: string
  contato: string
  cargo?: string
  observacao?: string
}

export interface ClientesFiltros {
  nome?: string
  documento?: string
  email?: string
  telefone?: string
  tipoPessoa?: 'PF' | 'PJ' | 'ES'
  ativo?: boolean
  cidade?: string
  estado?: string
  page?: number
  limit?: number
  ordenarPor?: 'nome' | 'documento' | 'ultimaCompra' | 'valorTotal'
  ordem?: 'asc' | 'desc'
}

export interface ClientesAnalytics {
  totalClientes: number
  clientesAtivos: number
  clientesInativos: number
  clientesPorTipo: Record<string, number>
  clientesPorEstado: Record<string, number>
  topClientes: Array<{
    clienteId: string
    clienteNome: string
    totalCompras: number
    valorTotal: number
    ultimaCompra: string
  }>
  clientesNovos: Array<{
    clienteId: string
    clienteNome: string
    dataCadastro: string
  }>
  segmentacaoRFM: {
    campeoes: number
    clientesLeais: number
    clientesEmRisco: number
    clientesPerdidos: number
    novosClientes: number
  }
}

export interface RFMAnalytics {
  clientes: Array<{
    clienteId: string
    clienteNome: string
    recencia: number // dias desde última compra
    frequencia: number // número de compras
    valorMonetario: number // valor total gasto
    scoreRFM: number // pontuação RFM (1-5)
    segmento: string // segmento baseado no RFM
  }>
  segmentos: Record<string, number>
  mediaRFM: {
    recencia: number
    frequencia: number
    valorMonetario: number
  }
}

export class ClientesService {
  private erpService: ERPIntegrationService

  constructor() {
    console.log('[ClientesService] Inicializando serviço de clientes')
    this.erpService = new ERPIntegrationService()
  }

  // Converter dados do ERP para formato do frontend
  private mapERPToCliente(erpCliente: ERPCliente): Cliente {
    console.log(`[ClientesService] Mapeando cliente ERP ID: ${erpCliente.id}`)
    
    // Calcular campos que o frontend espera
    const dataCadastro = erpCliente.data_nascimento || new Date().toISOString().split('T')[0]
    const ultimaCompra = new Date().toISOString().split('T')[0] // TODO: Calcular da tabela de vendas
    const totalCompras = 0 // TODO: Calcular da tabela de vendas
    const valorTotal = 0 // TODO: Calcular da tabela de vendas
    
    // Calcular RFM básico (placeholder)
    const rfm = {
      recencia: 30, // TODO: Calcular dias desde última compra
      frequencia: totalCompras,
      valor: valorTotal,
      segmento: this.calcularSegmentoRFM(30, totalCompras, valorTotal)
    }
    
    return {
      id: erpCliente.id,
      nome: erpCliente.nome,
      razaoSocial: erpCliente.razao_social || undefined,
      tipoPessoa: erpCliente.tipo_pessoa as 'PF' | 'PJ' | 'ES',
      documento: erpCliente.cpf || erpCliente.cnpj || '',
      inscricaoEstadual: erpCliente.inscricao_estadual || undefined,
      inscricaoMunicipal: erpCliente.inscricao_municipal || undefined,
      telefone: erpCliente.telefone,
      celular: erpCliente.celular,
      email: erpCliente.email,
      ativo: erpCliente.ativo === '1',
      dataNascimento: erpCliente.data_nascimento || undefined,
      // Campos que o frontend espera
      dataCadastro,
      ultimaCompra,
      totalCompras,
      valorTotal,
      rfm,
      // Campos originais
      enderecos: (erpCliente.enderecos || []).map(endereco => ({
        cep: endereco.endereco.cep,
        logradouro: endereco.endereco.logradouro,
        numero: endereco.endereco.numero,
        complemento: endereco.endereco.complemento || undefined,
        bairro: endereco.endereco.bairro,
        cidade: endereco.endereco.nome_cidade,
        estado: endereco.endereco.estado
      })),
      contatos: (erpCliente.contatos || []).map(contato => ({
        tipo: contato.contato.tipo_id || undefined,
        nome: contato.contato.nome,
        contato: contato.contato.contato,
        cargo: contato.contato.cargo,
        observacao: contato.contato.observacao
      }))
    }
  }

  // Calcular segmento RFM básico
  private calcularSegmentoRFM(recencia: number, frequencia: number, valor: number): string {
    if (recencia <= 30 && frequencia >= 10 && valor >= 1000) return 'Champions'
    if (recencia <= 60 && frequencia >= 5 && valor >= 500) return 'Loyal Customers'
    if (recencia <= 90 && frequencia >= 3 && valor >= 200) return 'Potential Loyalists'
    if (recencia > 90 && frequencia >= 5 && valor >= 500) return 'At Risk'
    if (recencia <= 30 && frequencia <= 2) return 'New Customers'
    return 'At Risk'
  }

  // Buscar clientes do ERP
  async getClientes(filtros: ClientesFiltros = {}): Promise<{ clientes: Cliente[], total: number, pagina: number, totalPaginas: number }> {
    console.log('[ClientesService] Buscando clientes com filtros:', filtros)

    try {
      // Converter filtros para formato do ERP
      const erpFiltros: ERPClienteFiltros = {
        nome: filtros.nome,
        cpf_cnpj: filtros.documento,
        email: filtros.email,
        telefone: filtros.telefone,
        tipo_pessoa: filtros.tipoPessoa,
        situacao: filtros.ativo !== undefined ? (filtros.ativo ? 1 : 0) : undefined,
        estado: filtros.estado
      }

      // Buscar dados do ERP
      const erpClientes = await this.erpService.getClientes(erpFiltros)
      
      // Mapear para formato do frontend
      let clientes = erpClientes.map(cliente => this.mapERPToCliente(cliente))
      
      // Aplicar filtros locais que não existem no ERP
      if (filtros.cidade) {
        clientes = clientes.filter(cliente => 
          cliente.enderecos.some(endereco => 
            endereco.cidade.toLowerCase().includes(filtros.cidade!.toLowerCase())
          )
        )
      }

      // Ordenação local
      if (filtros.ordenarPor) {
        clientes.sort((a, b) => {
          let aValue: any, bValue: any
          
          switch (filtros.ordenarPor) {
            case 'nome':
              aValue = a.nome
              bValue = b.nome
              break
            case 'documento':
              aValue = a.documento
              bValue = b.documento
              break
            case 'ultimaCompra':
              aValue = a.ultimaCompra || ''
              bValue = b.ultimaCompra || ''
              break
            case 'valorTotal':
              aValue = a.valorTotalCompras || 0
              bValue = b.valorTotalCompras || 0
              break
            default:
              return 0
          }
          
          if (filtros.ordem === 'desc') {
            return bValue > aValue ? 1 : -1
          }
          return aValue > bValue ? 1 : -1
        })
      }

      // Paginação local
      const total = clientes.length
      const pagina = filtros.page || 1
      const limit = filtros.limit || 20
      const inicio = (pagina - 1) * limit
      const fim = inicio + limit
      const clientesPaginados = clientes.slice(inicio, fim)
      const totalPaginas = Math.ceil(total / limit)

      console.log(`[ClientesService] Retornando ${clientesPaginados.length} clientes de ${total} total`)

      return {
        clientes: clientesPaginados,
        total,
        pagina,
        totalPaginas
      }

    } catch (error) {
      console.error('[ClientesService] Erro ao buscar clientes:', error)
      throw error
    }
  }

  // Buscar cliente específico
  async getClienteById(id: string): Promise<Cliente> {
    console.log(`[ClientesService] Buscando cliente por ID: ${id}`)

    try {
      const erpCliente = await this.erpService.getClienteById(id)
      return this.mapERPToCliente(erpCliente)
    } catch (error) {
      console.error(`[ClientesService] Erro ao buscar cliente ${id}:`, error)
      throw error
    }
  }

  // Gerar analytics de clientes
  async getClientesAnalytics(): Promise<ClientesAnalytics> {
    console.log('[ClientesService] Gerando analytics de clientes')

    try {
      // Buscar todos os clientes
      const { clientes } = await this.getClientes({ page: 1, limit: 1000 })

      // Calcular métricas básicas
      const totalClientes = clientes.length
      const clientesAtivos = clientes.filter(c => c.ativo).length
      const clientesInativos = totalClientes - clientesAtivos

      // Clientes por tipo
      const clientesPorTipo: Record<string, number> = {}
      clientes.forEach(cliente => {
        const tipo = cliente.tipoPessoa
        clientesPorTipo[tipo] = (clientesPorTipo[tipo] || 0) + 1
      })

      // Clientes por estado
      const clientesPorEstado: Record<string, number> = {}
      clientes.forEach(cliente => {
        const enderecoPrincipal = cliente.enderecos[0]
        if (enderecoPrincipal) {
          const estado = enderecoPrincipal.estado
          clientesPorEstado[estado] = (clientesPorEstado[estado] || 0) + 1
        }
      })

      // Top clientes (será calculado com dados de vendas)
      const topClientes: Array<{
        clienteId: string
        clienteNome: string
        totalCompras: number
        valorTotal: number
        ultimaCompra: string
      }> = []

      // Clientes novos (últimos 30 dias)
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
      
      const clientesNovos = clientes
        .filter(cliente => {
          // Como não temos data de cadastro no ERP, vamos simular
          // Em produção, isso viria do histórico de vendas
          return true // Placeholder
        })
        .slice(0, 10)
        .map(cliente => ({
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          dataCadastro: new Date().toISOString() // Placeholder
        }))

      // Segmentação RFM (será calculada separadamente)
      const segmentacaoRFM = {
        campeoes: 0,
        clientesLeais: 0,
        clientesEmRisco: 0,
        clientesPerdidos: 0,
        novosClientes: 0
      }

      const analytics: ClientesAnalytics = {
        totalClientes,
        clientesAtivos,
        clientesInativos,
        clientesPorTipo,
        clientesPorEstado,
        topClientes,
        clientesNovos,
        segmentacaoRFM
      }

      console.log('[ClientesService] Analytics gerados com sucesso')
      return analytics

    } catch (error) {
      console.error('[ClientesService] Erro ao gerar analytics:', error)
      throw error
    }
  }

  // Gerar análise RFM
  async getRFMAnalytics(): Promise<RFMAnalytics> {
    console.log('[ClientesService] Gerando análise RFM')

    try {
      // Buscar todos os clientes
      const { clientes } = await this.getClientes({ page: 1, limit: 1000 })

      // Em produção, aqui buscaríamos dados de vendas para calcular RFM
      // Por enquanto, vamos simular com dados mock
      const clientesRFM = clientes.map(cliente => {
        // Simular dados RFM (em produção viriam das vendas)
        const recencia = Math.floor(Math.random() * 365) + 1
        const frequencia = Math.floor(Math.random() * 20) + 1
        const valorMonetario = Math.random() * 10000

        // Calcular score RFM (1-5)
        const scoreR = recencia <= 30 ? 5 : recencia <= 60 ? 4 : recencia <= 90 ? 3 : recencia <= 180 ? 2 : 1
        const scoreF = frequencia >= 20 ? 5 : frequencia >= 10 ? 4 : frequencia >= 5 ? 3 : frequencia >= 2 ? 2 : 1
        const scoreM = valorMonetario >= 5000 ? 5 : valorMonetario >= 2000 ? 4 : valorMonetario >= 1000 ? 3 : valorMonetario >= 500 ? 2 : 1

        const scoreRFM = scoreR * 100 + scoreF * 10 + scoreM

        // Determinar segmento
        let segmento = 'Perdidos'
        if (scoreRFM >= 500) segmento = 'Campeões'
        else if (scoreRFM >= 400) segmento = 'Clientes Leais'
        else if (scoreRFM >= 300) segmento = 'Em Risco'
        else if (scoreRFM >= 200) segmento = 'Novos Clientes'

        return {
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          recencia,
          frequencia,
          valorMonetario,
          scoreRFM,
          segmento
        }
      })

      // Calcular segmentos
      const segmentos: Record<string, number> = {}
      clientesRFM.forEach(cliente => {
        segmentos[cliente.segmento] = (segmentos[cliente.segmento] || 0) + 1
      })

      // Calcular médias
      const mediaRFM = {
        recencia: clientesRFM.reduce((sum, c) => sum + c.recencia, 0) / clientesRFM.length,
        frequencia: clientesRFM.reduce((sum, c) => sum + c.frequencia, 0) / clientesRFM.length,
        valorMonetario: clientesRFM.reduce((sum, c) => sum + c.valorMonetario, 0) / clientesRFM.length
      }

      const rfmAnalytics: RFMAnalytics = {
        clientes: clientesRFM,
        segmentos,
        mediaRFM
      }

      console.log('[ClientesService] Análise RFM gerada com sucesso')
      return rfmAnalytics

    } catch (error) {
      console.error('[ClientesService] Erro ao gerar análise RFM:', error)
      throw error
    }
  }
} 