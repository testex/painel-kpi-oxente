import { Router } from 'express'
import cacheService from '../services/cacheService'
import syncService from '../services/syncService'
import sequelize from '../config/database'

const router = Router()

// GET /api/system/status - Status completo do sistema
router.get('/status', async (req, res) => {
  try {
    console.log('[SystemRoutes] Verificando status do sistema')
    
    // Verificar status do banco de dados
    const dbStatus = await sequelize.authenticate()
      .then(() => ({ status: 'connected', message: 'Conexão ativa' }))
      .catch((error) => ({ status: 'error', message: error.message }))
    
    // Verificar status do cache
    const cacheStats = await cacheService.getStats()
    
    // Verificar status da sincronização
    const syncStatus = syncService.getSyncStatus()
    
    const systemStatus = {
      database: dbStatus,
      cache: cacheStats,
      sync: syncStatus,
      timestamp: new Date().toISOString()
    }
    
    console.log('[SystemRoutes] Status do sistema verificado')
    
    res.json({
      success: true,
      data: systemStatus
    })
    
  } catch (error) {
    console.error('[SystemRoutes] Erro ao verificar status:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status do sistema'
    })
  }
})

// GET /api/system/cache/stats - Estatísticas do cache
router.get('/cache/stats', async (req, res) => {
  try {
    console.log('[SystemRoutes] Buscando estatísticas do cache')
    
    const stats = await cacheService.getStats()
    
    res.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error('[SystemRoutes] Erro ao buscar estatísticas do cache:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas do cache'
    })
  }
})

// POST /api/system/cache/clear - Limpar cache
router.post('/cache/clear', async (req, res) => {
  try {
    console.log('[SystemRoutes] Limpando cache')
    
    const { pattern } = req.body
    
    if (pattern) {
      await cacheService.delPattern(pattern)
      console.log(`[SystemRoutes] Cache limpo com padrão: ${pattern}`)
    } else {
      // Limpar todo o cache
      await cacheService.delPattern('*')
      console.log('[SystemRoutes] Todo o cache foi limpo')
    }
    
    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    })
    
  } catch (error) {
    console.error('[SystemRoutes] Erro ao limpar cache:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache'
    })
  }
})

// GET /api/system/sync/status - Status da sincronização
router.get('/sync/status', async (req, res) => {
  try {
    console.log('[SystemRoutes] Verificando status da sincronização')
    
    const status = syncService.getSyncStatus()
    
    res.json({
      success: true,
      data: status
    })
    
  } catch (error) {
    console.error('[SystemRoutes] Erro ao verificar status da sincronização:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status da sincronização'
    })
  }
})

// POST /api/system/sync/trigger - Forçar sincronização manual
router.post('/sync/trigger', async (req, res) => {
  try {
    console.log('[SystemRoutes] Iniciando sincronização manual')
    
    const { entity } = req.body
    
    if (entity) {
      // Sincronizar entidade específica
      switch (entity) {
        case 'vendas':
          await syncService.syncVendas()
          break
        case 'clientes':
          await syncService.syncClientes()
          break
        case 'produtos':
          await syncService.syncProdutos()
          break
        default:
          return res.status(400).json({
            success: false,
            error: 'Entidade inválida'
          })
      }
    } else {
      // Sincronizar todas as entidades
      await syncService.syncAll()
    }
    
    res.json({
      success: true,
      message: 'Sincronização iniciada com sucesso'
    })
    
  } catch (error) {
    console.error('[SystemRoutes] Erro ao iniciar sincronização:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar sincronização'
    })
  }
})

// GET /api/system/database/health - Health check do banco
router.get('/database/health', async (req, res) => {
  try {
    console.log('[SystemRoutes] Verificando saúde do banco de dados')
    
    const startTime = Date.now()
    await sequelize.authenticate()
    const responseTime = Date.now() - startTime
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[SystemRoutes] Erro no health check do banco:', error)
    res.status(500).json({
      success: false,
      error: 'Banco de dados não está saudável'
    })
  }
})

export default router 