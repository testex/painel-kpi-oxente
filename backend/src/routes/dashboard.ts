// Rotas para dashboard - KPIs e status do sistema
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros

import { Router, Request, Response } from 'express'
import { DashboardService } from '../services/dashboardService'

const router = Router()
const dashboardService = new DashboardService()

// Middleware para tratamento de erros assíncronos
const asyncHandler = (fn: (req: Request, res: Response, next?: any) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// GET /api/dashboard/analytics - KPIs principais do dashboard
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  console.log('[DashboardRoutes] GET /api/dashboard/analytics')
  
  try {
    const analytics = await dashboardService.getDashboardAnalytics()
    
    console.log('[DashboardRoutes] Analytics retornados com sucesso')
    res.json(analytics)
  } catch (error) {
    console.error('[DashboardRoutes] Erro ao buscar analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar analytics do dashboard',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/dashboard/system/status - Status do sistema e integrações
router.get('/system/status', asyncHandler(async (req: Request, res: Response) => {
  console.log('[DashboardRoutes] GET /api/dashboard/system/status')
  
  try {
    const status = await dashboardService.getSystemStatus()
    
    console.log('[DashboardRoutes] Status do sistema retornado com sucesso')
    res.json(status)
  } catch (error) {
    console.error('[DashboardRoutes] Erro ao verificar status:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao verificar status do sistema',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/dashboard/alerts/summary - Resumo de alertas do sistema
router.get('/alerts/summary', asyncHandler(async (req: Request, res: Response) => {
  console.log('[DashboardRoutes] GET /api/dashboard/alerts/summary')
  
  try {
    const alertas = await dashboardService.getAlertsSummary()
    
    console.log('[DashboardRoutes] Alertas retornados com sucesso')
    res.json(alertas)
  } catch (error) {
    console.error('[DashboardRoutes] Erro ao buscar alertas:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar alertas do sistema',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

export default router 