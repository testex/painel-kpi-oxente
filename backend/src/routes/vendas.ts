// Rotas para vendas - integração com ERP GestãoClick
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros
// IMPORTANTE: Somente leitura - nunca modifica dados no ERP

import { Router, Request, Response } from 'express'
import { VendasService, VendasFiltros } from '../services/vendasService'

const router = Router()
const vendasService = new VendasService()

// Middleware para validar parâmetros de data
const validateDateParams = (req: Request, res: Response, next: Function) => {
  const { dataInicio, dataFim } = req.query
  
  if (dataInicio && !isValidDate(dataInicio as string)) {
    return res.status(400).json({ 
      error: 'Data de início inválida. Use o formato YYYY-MM-DD' 
    })
  }
  
  if (dataFim && !isValidDate(dataFim as string)) {
    return res.status(400).json({ 
      error: 'Data de fim inválida. Use o formato YYYY-MM-DD' 
    })
  }
  
  if (dataInicio && dataFim && new Date(dataInicio as string) > new Date(dataFim as string)) {
    return res.status(400).json({ 
      error: 'Data de início deve ser anterior à data de fim' 
    })
  }
  
  next()
}

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// GET /api/vendas - Listar vendas com filtros
router.get('/', validateDateParams, async (req: Request, res: Response) => {
  console.log('[VendasRoutes] GET /api/vendas - Parâmetros:', req.query)
  
  try {
    const filtros: VendasFiltros = {
      dataInicio: req.query.dataInicio as string,
      dataFim: req.query.dataFim as string,
      clienteId: req.query.clienteId as string,
      status: req.query.status as string,
      vendedor: req.query.vendedor as string,
      formaPagamento: req.query.formaPagamento as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      ordenarPor: req.query.ordenarPor as 'data' | 'valor' | 'cliente',
      ordem: req.query.ordem as 'asc' | 'desc'
    }

    const resultado = await vendasService.getVendas(filtros)
    
    console.log(`[VendasRoutes] Retornando ${resultado.vendas.length} vendas`)
    
    res.json({
      success: true,
      data: resultado.vendas,
      pagination: {
        total: resultado.total,
        pagina: resultado.pagina,
        totalPaginas: resultado.totalPaginas,
        porPagina: filtros.limit || 20
      }
    })

  } catch (error) {
    console.error('[VendasRoutes] Erro ao buscar vendas:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/vendas/:id - Buscar venda específica
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  console.log(`[VendasRoutes] GET /api/vendas/${id}`)
  
  try {
    const venda = await vendasService.getVendaById(id)
    
    console.log(`[VendasRoutes] Venda ${id} encontrada`)
    
    res.json({
      success: true,
      data: venda
    })

  } catch (error) {
    console.error(`[VendasRoutes] Erro ao buscar venda ${id}:`, error)
    
    if (error instanceof Error && error.message.includes('não encontrada')) {
      res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      })
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      })
    }
  }
})

// GET /api/vendas/analytics/geral - Analytics gerais de vendas
router.get('/analytics/geral', validateDateParams, async (req: Request, res: Response) => {
  console.log('[VendasRoutes] GET /api/vendas/analytics/geral - Parâmetros:', req.query)
  
  try {
    const filtros: VendasFiltros = {
      dataInicio: req.query.dataInicio as string,
      dataFim: req.query.dataFim as string,
      clienteId: req.query.clienteId as string,
      status: req.query.status as string,
      vendedor: req.query.vendedor as string,
      formaPagamento: req.query.formaPagamento as string
    }

    const analytics = await vendasService.getVendasAnalytics(filtros)
    
    console.log('[VendasRoutes] Analytics gerados com sucesso')
    
    res.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('[VendasRoutes] Erro ao gerar analytics:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/vendas/analytics/periodo - Vendas por período específico
router.get('/analytics/periodo', validateDateParams, async (req: Request, res: Response) => {
  const { dataInicio, dataFim } = req.query
  
  if (!dataInicio || !dataFim) {
    return res.status(400).json({
      success: false,
      error: 'Data de início e data de fim são obrigatórias'
    })
  }
  
  console.log(`[VendasRoutes] GET /api/vendas/analytics/periodo - ${dataInicio} até ${dataFim}`)
  
  try {
    const resultado = await vendasService.getVendasPorPeriodo(
      dataInicio as string,
      dataFim as string
    )
    
    console.log(`[VendasRoutes] Dados do período retornados: ${resultado.vendas.length} vendas`)
    
    res.json({
      success: true,
      data: {
        vendas: resultado.vendas,
        analytics: resultado.analytics
      }
    })

  } catch (error) {
    console.error('[VendasRoutes] Erro ao buscar vendas por período:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/vendas/status/lista - Listar status disponíveis
router.get('/status/lista', async (req: Request, res: Response) => {
  console.log('[VendasRoutes] GET /api/vendas/status/lista')
  
  try {
    // Buscar algumas vendas para extrair os status únicos
    const { vendas } = await vendasService.getVendas({ limit: 1000 })
    
    const statusUnicos = [...new Set(vendas.map(venda => venda.status))]
      .filter(status => status && status.trim() !== '')
      .sort()
    
    console.log(`[VendasRoutes] Encontrados ${statusUnicos.length} status únicos`)
    
    res.json({
      success: true,
      data: statusUnicos
    })

  } catch (error) {
    console.error('[VendasRoutes] Erro ao listar status:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/vendas/formas-pagamento/lista - Listar formas de pagamento
router.get('/formas-pagamento/lista', async (req: Request, res: Response) => {
  console.log('[VendasRoutes] GET /api/vendas/formas-pagamento/lista')
  
  try {
    // Buscar algumas vendas para extrair as formas de pagamento únicas
    const { vendas } = await vendasService.getVendas({ limit: 1000 })
    
    const formasPagamento = [...new Set(vendas.map(venda => venda.formaPagamento))]
      .filter(forma => forma && forma.trim() !== '')
      .sort()
    
    console.log(`[VendasRoutes] Encontradas ${formasPagamento.length} formas de pagamento`)
    
    res.json({
      success: true,
      data: formasPagamento
    })

  } catch (error) {
    console.error('[VendasRoutes] Erro ao listar formas de pagamento:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

export default router 