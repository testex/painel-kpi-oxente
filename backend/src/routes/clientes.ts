// Rotas para clientes - integração com ERP GestãoClick
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros
// IMPORTANTE: Somente leitura - nunca modifica dados no ERP

import { Router, Request, Response } from 'express'
import { ClientesService, ClientesFiltros } from '../services/clientesService'

const router = Router()
const clientesService = new ClientesService()

// GET /api/clientes - Listar clientes com filtros
router.get('/', async (req: Request, res: Response) => {
  console.log('[ClientesRoutes] GET /api/clientes - Parâmetros:', req.query)
  
  try {
    const filtros: ClientesFiltros = {
      nome: req.query.nome as string,
      documento: req.query.documento as string,
      email: req.query.email as string,
      telefone: req.query.telefone as string,
      tipoPessoa: req.query.tipoPessoa as 'PF' | 'PJ' | 'ES',
      ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined,
      cidade: req.query.cidade as string,
      estado: req.query.estado as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      ordenarPor: req.query.ordenarPor as 'nome' | 'documento' | 'ultimaCompra' | 'valorTotal',
      ordem: req.query.ordem as 'asc' | 'desc'
    }

    const resultado = await clientesService.getClientes(filtros)
    
    console.log(`[ClientesRoutes] Retornando ${resultado.clientes.length} clientes`)
    
    res.json({
      success: true,
      data: resultado.clientes,
      pagination: {
        total: resultado.total,
        pagina: resultado.pagina,
        totalPaginas: resultado.totalPaginas,
        porPagina: filtros.limit || 20
      }
    })

  } catch (error) {
    console.error('[ClientesRoutes] Erro ao buscar clientes:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/clientes/:id - Buscar cliente específico
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  console.log(`[ClientesRoutes] GET /api/clientes/${id}`)
  
  try {
    const cliente = await clientesService.getClienteById(id)
    
    console.log(`[ClientesRoutes] Cliente ${id} encontrado`)
    
    res.json({
      success: true,
      data: cliente
    })

  } catch (error) {
    console.error(`[ClientesRoutes] Erro ao buscar cliente ${id}:`, error)
    
    if (error instanceof Error && error.message.includes('não encontrado')) {
      res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      })
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      })
    }
  }
})

// GET /api/clientes/analytics/geral - Analytics gerais de clientes
router.get('/analytics/geral', async (req: Request, res: Response) => {
  console.log('[ClientesRoutes] GET /api/clientes/analytics/geral')
  
  try {
    const analytics = await clientesService.getClientesAnalytics()
    
    console.log('[ClientesRoutes] Analytics gerados com sucesso')
    
    res.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('[ClientesRoutes] Erro ao gerar analytics:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/clientes/analytics/rfm - Análise RFM
router.get('/analytics/rfm', async (req: Request, res: Response) => {
  console.log('[ClientesRoutes] GET /api/clientes/analytics/rfm')
  
  try {
    const rfmAnalytics = await clientesService.getRFMAnalytics()
    
    console.log('[ClientesRoutes] Análise RFM gerada com sucesso')
    
    res.json({
      success: true,
      data: rfmAnalytics
    })

  } catch (error) {
    console.error('[ClientesRoutes] Erro ao gerar análise RFM:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/clientes/tipos/lista - Listar tipos de pessoa
router.get('/tipos/lista', async (req: Request, res: Response) => {
  console.log('[ClientesRoutes] GET /api/clientes/tipos/lista')
  
  try {
    const tipos = [
      { codigo: 'PF', nome: 'Pessoa Física' },
      { codigo: 'PJ', nome: 'Pessoa Jurídica' },
      { codigo: 'ES', nome: 'Estrangeiro' }
    ]
    
    console.log('[ClientesRoutes] Tipos de pessoa retornados')
    
    res.json({
      success: true,
      data: tipos
    })

  } catch (error) {
    console.error('[ClientesRoutes] Erro ao listar tipos:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/clientes/estados/lista - Listar estados disponíveis
router.get('/estados/lista', async (req: Request, res: Response) => {
  console.log('[ClientesRoutes] GET /api/clientes/estados/lista')
  
  try {
    // Buscar alguns clientes para extrair os estados únicos
    const { clientes } = await clientesService.getClientes({ limit: 1000 })
    
    const estadosUnicos = [...new Set(
      clientes
        .flatMap(cliente => cliente.enderecos.map(endereco => endereco.estado))
        .filter(estado => estado && estado.trim() !== '')
    )].sort()
    
    console.log(`[ClientesRoutes] Encontrados ${estadosUnicos.length} estados únicos`)
    
    res.json({
      success: true,
      data: estadosUnicos
    })

  } catch (error) {
    console.error('[ClientesRoutes] Erro ao listar estados:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

// GET /api/clientes/cidades/lista - Listar cidades por estado
router.get('/cidades/lista', async (req: Request, res: Response) => {
  const { estado } = req.query
  
  if (!estado) {
    return res.status(400).json({
      success: false,
      error: 'Parâmetro estado é obrigatório'
    })
  }
  
  console.log(`[ClientesRoutes] GET /api/clientes/cidades/lista - Estado: ${estado}`)
  
  try {
    // Buscar clientes do estado específico
    const { clientes } = await clientesService.getClientes({ 
      estado: estado as string,
      limit: 1000 
    })
    
    const cidadesUnicas = [...new Set(
      clientes
        .flatMap(cliente => 
          cliente.enderecos
            .filter(endereco => endereco.estado === estado)
            .map(endereco => endereco.cidade)
        )
        .filter(cidade => cidade && cidade.trim() !== '')
    )].sort()
    
    console.log(`[ClientesRoutes] Encontradas ${cidadesUnicas.length} cidades no estado ${estado}`)
    
    res.json({
      success: true,
      data: cidadesUnicas
    })

  } catch (error) {
    console.error('[ClientesRoutes] Erro ao listar cidades:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    })
  }
})

export default router 