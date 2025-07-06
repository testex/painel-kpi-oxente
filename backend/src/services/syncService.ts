import cron from 'node-cron'
import { ERPIntegrationService } from './erpIntegrationService'
import cacheService from './cacheService'
import Venda from '../models/Venda'
import Cliente from '../models/Cliente'
import Produto from '../models/Produto'
import dotenv from 'dotenv'

dotenv.config()

interface SyncLog {
  entity: string
  lastSync: Date
  recordsUpdated: number
  status: 'success' | 'error' | 'in_progress'
  errorMessage?: string
}

class SyncService {
  private erpService: ERPIntegrationService
  private syncLogs: Map<string, SyncLog> = new Map()
  private isRunning = false

  constructor() {
    this.erpService = new ERPIntegrationService()
    console.log('[SyncService] Inicializando serviço de sincronização')
  }

  // Iniciar sincronização automática
  startAutoSync() {
    const interval = parseInt(process.env.SYNC_INTERVAL || '60000') // 1 minuto
    const cronExpression = `*/${Math.floor(interval / 60000)} * * * * *`
    
    console.log(`[SyncService] Iniciando sincronização automática a cada ${interval / 1000} segundos`)
    
    cron.schedule(cronExpression, async () => {
      if (!this.isRunning) {
        await this.syncAll()
      } else {
        console.log('[SyncService] Sincronização anterior ainda em andamento, pulando...')
      }
    })
  }

  // Sincronizar todas as entidades
  async syncAll() {
    this.isRunning = true
    console.log('[SyncService] Iniciando sincronização completa')
    
    try {
      await Promise.all([
        this.syncVendas(),
        this.syncClientes(),
        this.syncProdutos()
      ])
      
      console.log('[SyncService] Sincronização completa finalizada com sucesso')
    } catch (error) {
      console.error('[SyncService] Erro na sincronização completa:', error)
    } finally {
      this.isRunning = false
    }
  }

  // Sincronizar vendas
  async syncVendas() {
    const entity = 'vendas'
    console.log(`[SyncService] Sincronizando ${entity}`)
    
    try {
      this.updateSyncLog(entity, 'in_progress')
      
      // Buscar vendas do ERP
      const erpVendas = await this.erpService.getVendas({})
      let updatedCount = 0
      
      for (const erpVenda of erpVendas) {
        try {
          const [venda, created] = await Venda.findOrCreate({
            where: { erp_id: erpVenda.id },
                         defaults: {
               erp_id: erpVenda.id,
               codigo: erpVenda.codigo,
               cliente_id: erpVenda.cliente_id,
               nome_cliente: erpVenda.nome_cliente,
               vendedor_id: erpVenda.vendedor_id,
               nome_vendedor: erpVenda.nome_vendedor,
               data: new Date(erpVenda.data),
               situacao_id: erpVenda.situacao_id,
               nome_situacao: erpVenda.nome_situacao,
               valor_total: parseFloat(erpVenda.valor_total),
               valor_custo: parseFloat(erpVenda.valor_custo || '0'),
               valor_frete: parseFloat(erpVenda.valor_frete || '0'),
               nome_canal_venda: erpVenda.nome_canal_venda,
               nome_loja: erpVenda.nome_loja,
               condicao_pagamento: erpVenda.condicao_pagamento,
               situacao_financeiro: erpVenda.situacao_financeiro,
               situacao_estoque: erpVenda.situacao_estoque,
               observacoes: erpVenda.observacoes || undefined,
               observacoes_interna: erpVenda.observacoes_interna || undefined
             }
          })
          
          if (!created) {
                         // Atualizar se já existe
             await venda.update({
               codigo: erpVenda.codigo,
               cliente_id: erpVenda.cliente_id,
               nome_cliente: erpVenda.nome_cliente,
               vendedor_id: erpVenda.vendedor_id,
               nome_vendedor: erpVenda.nome_vendedor,
               data: new Date(erpVenda.data),
               situacao_id: erpVenda.situacao_id,
               nome_situacao: erpVenda.nome_situacao,
               valor_total: parseFloat(erpVenda.valor_total),
               valor_custo: parseFloat(erpVenda.valor_custo || '0'),
               valor_frete: parseFloat(erpVenda.valor_frete || '0'),
               nome_canal_venda: erpVenda.nome_canal_venda,
               nome_loja: erpVenda.nome_loja,
               condicao_pagamento: erpVenda.condicao_pagamento,
               situacao_financeiro: erpVenda.situacao_financeiro,
               situacao_estoque: erpVenda.situacao_estoque,
               observacoes: erpVenda.observacoes || undefined,
               observacoes_interna: erpVenda.observacoes_interna || undefined
             })
          }
          
          updatedCount++
        } catch (error) {
          console.error(`[SyncService] Erro ao sincronizar venda ${erpVenda.id}:`, error)
        }
      }
      
      // Invalidar cache relacionado
      await cacheService.invalidateEntity('vendas')
      
      this.updateSyncLog(entity, 'success', updatedCount)
      console.log(`[SyncService] ${entity} sincronizados: ${updatedCount} registros`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.updateSyncLog(entity, 'error', 0, errorMessage)
      console.error(`[SyncService] Erro ao sincronizar ${entity}:`, error)
    }
  }

  // Sincronizar clientes
  async syncClientes() {
    const entity = 'clientes'
    console.log(`[SyncService] Sincronizando ${entity}`)
    
    try {
      this.updateSyncLog(entity, 'in_progress')
      
      const erpClientes = await this.erpService.getClientes({})
      let updatedCount = 0
      
      for (const erpCliente of erpClientes) {
        try {
          const [cliente, created] = await Cliente.findOrCreate({
            where: { erp_id: erpCliente.id },
            defaults: {
              erp_id: erpCliente.id,
              tipo_pessoa: erpCliente.tipo_pessoa,
              nome: erpCliente.nome,
              razao_social: erpCliente.razao_social || undefined,
              cnpj: erpCliente.cnpj || undefined,
              inscricao_estadual: erpCliente.inscricao_estadual || undefined,
              inscricao_municipal: erpCliente.inscricao_municipal || undefined,
              cpf: erpCliente.cpf || undefined,
              rg: erpCliente.rg || undefined,
              data_nascimento: erpCliente.data_nascimento ? new Date(erpCliente.data_nascimento) : undefined,
              telefone: erpCliente.telefone,
              celular: erpCliente.celular,
              fax: erpCliente.fax || undefined,
              email: erpCliente.email,
              ativo: erpCliente.ativo === '1'
            }
          })
          
          if (!created) {
            await cliente.update({
              tipo_pessoa: erpCliente.tipo_pessoa,
              nome: erpCliente.nome,
              razao_social: erpCliente.razao_social || undefined,
              cnpj: erpCliente.cnpj || undefined,
              inscricao_estadual: erpCliente.inscricao_estadual || undefined,
              inscricao_municipal: erpCliente.inscricao_municipal || undefined,
              cpf: erpCliente.cpf || undefined,
              rg: erpCliente.rg || undefined,
              data_nascimento: erpCliente.data_nascimento ? new Date(erpCliente.data_nascimento) : undefined,
              telefone: erpCliente.telefone,
              celular: erpCliente.celular,
              fax: erpCliente.fax || undefined,
              email: erpCliente.email,
              ativo: erpCliente.ativo === '1'
            })
          }
          
          updatedCount++
        } catch (error) {
          console.error(`[SyncService] Erro ao sincronizar cliente ${erpCliente.id}:`, error)
        }
      }
      
      await cacheService.invalidateEntity('clientes')
      
      this.updateSyncLog(entity, 'success', updatedCount)
      console.log(`[SyncService] ${entity} sincronizados: ${updatedCount} registros`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.updateSyncLog(entity, 'error', 0, errorMessage)
      console.error(`[SyncService] Erro ao sincronizar ${entity}:`, error)
    }
  }

  // Sincronizar produtos
  async syncProdutos() {
    const entity = 'produtos'
    console.log(`[SyncService] Sincronizando ${entity}`)
    
    try {
      this.updateSyncLog(entity, 'in_progress')
      
      const erpProdutos = await this.erpService.getProdutos({})
      let updatedCount = 0
      
      for (const erpProduto of erpProdutos) {
        try {
          const [produto, created] = await Produto.findOrCreate({
            where: { erp_id: erpProduto.id },
            defaults: {
              erp_id: erpProduto.id,
              nome: erpProduto.nome,
              nome_grupo: erpProduto.nome_grupo,
              grupo_id: erpProduto.grupo_id,
              valor_venda: parseFloat(erpProduto.valor_venda || '0'),
              valor_custo: parseFloat(erpProduto.valor_custo || '0'),
              estoque: erpProduto.estoque || 0,
              codigo_barras: erpProduto.codigo_barra || undefined,
              descricao: erpProduto.descricao,
              ativo: erpProduto.ativo === '1'
            }
          })
          
          if (!created) {
            await produto.update({
              nome: erpProduto.nome,
              nome_grupo: erpProduto.nome_grupo,
              grupo_id: erpProduto.grupo_id,
              valor_venda: parseFloat(erpProduto.valor_venda || '0'),
              valor_custo: parseFloat(erpProduto.valor_custo || '0'),
              estoque: erpProduto.estoque || 0,
              codigo_barras: erpProduto.codigo_barra || undefined,
              descricao: erpProduto.descricao,
              ativo: erpProduto.ativo === '1'
            })
          }
          
          updatedCount++
        } catch (error) {
          console.error(`[SyncService] Erro ao sincronizar produto ${erpProduto.id}:`, error)
        }
      }
      
      await cacheService.invalidateEntity('produtos')
      
      this.updateSyncLog(entity, 'success', updatedCount)
      console.log(`[SyncService] ${entity} sincronizados: ${updatedCount} registros`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      this.updateSyncLog(entity, 'error', 0, errorMessage)
      console.error(`[SyncService] Erro ao sincronizar ${entity}:`, error)
    }
  }

  // Atualizar log de sincronização
  private updateSyncLog(entity: string, status: SyncLog['status'], recordsUpdated: number = 0, errorMessage?: string) {
    this.syncLogs.set(entity, {
      entity,
      lastSync: new Date(),
      recordsUpdated,
      status,
      errorMessage
    })
  }

  // Obter logs de sincronização
  getSyncLogs(): SyncLog[] {
    return Array.from(this.syncLogs.values())
  }

  // Obter status de sincronização
  getSyncStatus(): { isRunning: boolean; lastSyncs: SyncLog[] } {
    return {
      isRunning: this.isRunning,
      lastSyncs: this.getSyncLogs()
    }
  }

  // Parar sincronização
  stopAutoSync() {
    console.log('[SyncService] Parando sincronização automática')
    cron.getTasks().forEach((task: any) => task.stop())
  }
}

export default new SyncService() 