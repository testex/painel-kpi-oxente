import { Router, Request, Response } from 'express'
import { ProdutoService } from '../services/produtoService'

const router = Router()
const produtoService = new ProdutoService()

// Middleware para tratamento de erros assíncronos
const asyncHandler = (fn: (req: Request, res: Response, next?: any) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// GET /api/produtos - Lista de produtos com filtros e paginação
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      periodo,
      dataInicio,
      dataFim,
      categoria,
      busca
    } = req.query

    const filtros = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      periodo: periodo as string,
      dataInicio: dataInicio as string,
      dataFim: dataFim as string,
      categoria: categoria as string,
      busca: busca as string
    }

    const resultado = await produtoService.getProdutos(filtros)
    
    console.log(`[Produtos] GET /api/produtos - ${resultado.data.length} produtos retornados`)
    res.json(resultado)
  } catch (error) {
    console.error('[Produtos] Erro ao buscar produtos:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar produtos',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/produtos/top - Produtos mais vendidos
router.get('/top', asyncHandler(async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const topProdutos = await produtoService.getTopProdutos(limit)
    
    console.log(`[Produtos] GET /api/produtos/top - ${topProdutos.length} produtos top retornados`)
    res.json({
      success: true,
      data: topProdutos,
      meta: {
        limit,
        total: topProdutos.length
      }
    })
  } catch (error) {
    console.error('[Produtos] Erro ao buscar produtos top:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar produtos top',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/produtos/sazonalidade - Análise de sazonalidade
router.get('/sazonalidade', asyncHandler(async (req: Request, res: Response) => {
  try {
    const periodo = req.query.periodo as string || 'ano-atual'
    const resultado = await produtoService.getSazonalidade(periodo)
    
    console.log(`[Produtos] GET /api/produtos/sazonalidade - ${resultado.data.length} produtos analisados`)
    res.json(resultado)
  } catch (error) {
    console.error('[Produtos] Erro ao calcular sazonalidade:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao calcular sazonalidade',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/produtos/matriz-abc - Matriz ABC de produtos
router.get('/matriz-abc', asyncHandler(async (req: Request, res: Response) => {
  try {
    const resultado = await produtoService.getMatrizABC()
    
    console.log(`[Produtos] GET /api/produtos/matriz-abc - ${resultado.data.length} produtos classificados`)
    res.json(resultado)
  } catch (error) {
    console.error('[Produtos] Erro ao calcular matriz ABC:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao calcular matriz ABC',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

// GET /api/produtos/categorias - Lista de categorias disponíveis
router.get('/categorias', asyncHandler(async (req: Request, res: Response) => {
  try {
    const categorias = ['Eletrônicos', 'Informática', 'Acessórios']
    
    console.log(`[Produtos] GET /api/produtos/categorias - ${categorias.length} categorias retornadas`)
    res.json({
      success: true,
      data: categorias,
      meta: {
        total: categorias.length
      }
    })
  } catch (error) {
    console.error('[Produtos] Erro ao buscar categorias:', error)
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar categorias',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}))

export { router as produtosRoutes } 