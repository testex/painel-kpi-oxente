// Rotas para verificação de status da integração com ERP
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros

import { Router, Request, Response } from 'express'
import { ERPIntegrationService } from '../services/erpIntegrationService'
import { validateERPConfig } from '../config/erpConfig'

const router = Router()
const erpService = new ERPIntegrationService()

// Middleware para tratamento de erros assíncronos
const asyncHandler = (fn: (req: Request, res: Response, next?: any) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// GET /api/erp/status - Verificar status da integração
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  console.log('[ERP Routes] GET /api/erp/status - Verificando status da integração')
  
  try {
    const configValid = validateERPConfig()
    const connectionStatus = await erpService.checkConnection()
    
    const status = {
      success: true,
      data: {
        configValid,
        connectionStatus,
        timestamp: new Date().toISOString(),
        message: configValid 
          ? (connectionStatus ? 'ERP conectado e funcionando' : 'ERP configurado mas sem conexão')
          : 'ERP não configurado - usando dados mock'
      }
    }
    
    console.log('[ERP Routes] Status da integração:', status.data)
    res.json(status)
  } catch (error) {
    console.error('[ERP Routes] Erro ao verificar status:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status da integração',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// POST /api/erp/cache/clear - Limpar cache
router.post('/cache/clear', asyncHandler(async (req: Request, res: Response) => {
  console.log('[ERP Routes] POST /api/erp/cache/clear - Limpando cache')
  
  try {
    erpService.clearCache()
    
    res.json({
      success: true,
      data: {
        message: 'Cache limpo com sucesso',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[ERP Routes] Erro ao limpar cache:', error)
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/erp/test - Teste de conexão
router.get('/test', asyncHandler(async (req: Request, res: Response) => {
  console.log('[ERP Routes] GET /api/erp/test - Testando conexão com ERP')
  
  try {
    const isConnected = await erpService.checkConnection()
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        timestamp: new Date().toISOString(),
        message: isConnected 
          ? 'Conexão com ERP estabelecida com sucesso'
          : 'Falha na conexão com ERP'
      }
    })
  } catch (error) {
    console.error('[ERP Routes] Erro no teste de conexão:', error)
    res.status(500).json({
      success: false,
      error: 'Erro no teste de conexão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

export { router as erpRoutes } 