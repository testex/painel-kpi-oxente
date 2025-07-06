import { ERPIntegrationService } from './erpIntegrationService'
import { ERPProduto, ERPProdutoFiltros } from '../types/erp'
import { 
  Produto, 
  ProdutoResponse, 
  SazonalidadeItem, 
  SazonalidadeResponse,
  MatrizABCItem,
  MatrizABCResponse,
  ProdutoFiltros
} from '../types/produtos'

export class ProdutoService {
  private erpService: ERPIntegrationService

  constructor() {
    this.erpService = new ERPIntegrationService()
  }

  // Dados mockados para produtos
  private produtos: Produto[] = [
    {
      id: 1,
      nome: 'Smartphone Galaxy S24',
      categoria: 'Eletrônicos',
      preco: 3500.00,
      estoque: 45,
      vendas: 180,
      receita: 630000,
      ticketMedio: 3500,
      crescimento: 0.15
    },
    {
      id: 2,
      nome: 'Notebook Dell Inspiron',
      categoria: 'Informática',
      preco: 4200.00,
      estoque: 28,
      vendas: 95,
      receita: 399000,
      ticketMedio: 4200,
      crescimento: 0.08
    },
    {
      id: 3,
      nome: 'Fone Bluetooth JBL',
      categoria: 'Acessórios',
      preco: 450.00,
      estoque: 120,
      vendas: 320,
      receita: 144000,
      ticketMedio: 450,
      crescimento: 0.22
    },
    {
      id: 4,
      nome: 'Smart TV Samsung 55"',
      categoria: 'Eletrônicos',
      preco: 2800.00,
      estoque: 15,
      vendas: 65,
      receita: 182000,
      ticketMedio: 2800,
      crescimento: 0.12
    },
    {
      id: 5,
      nome: 'Mouse Gamer Logitech',
      categoria: 'Acessórios',
      preco: 280.00,
      estoque: 85,
      vendas: 210,
      receita: 58800,
      ticketMedio: 280,
      crescimento: 0.18
    },
    {
      id: 6,
      nome: 'Tablet iPad Air',
      categoria: 'Eletrônicos',
      preco: 3800.00,
      estoque: 22,
      vendas: 48,
      receita: 182400,
      ticketMedio: 3800,
      crescimento: 0.05
    },
    {
      id: 7,
      nome: 'Teclado Mecânico Corsair',
      categoria: 'Acessórios',
      preco: 650.00,
      estoque: 60,
      vendas: 125,
      receita: 81250,
      ticketMedio: 650,
      crescimento: 0.25
    },
    {
      id: 8,
      nome: 'Monitor LG 27"',
      categoria: 'Informática',
      preco: 1200.00,
      estoque: 35,
      vendas: 88,
      receita: 105600,
      ticketMedio: 1200,
      crescimento: 0.10
    }
  ]

  // Mapear produto do ERP para o formato do frontend
  private mapERPToProduto(erpProduto: ERPProduto): Produto {
    return {
      id: parseInt(erpProduto.id, 10),
      nome: erpProduto.nome,
      categoria: erpProduto.nome_grupo || 'Sem categoria',
      preco: parseFloat(erpProduto.valor_venda || '0'),
      estoque: erpProduto.estoque || 0,
      vendas: 0, // Não disponível diretamente
      receita: 0, // Não disponível diretamente
      ticketMedio: parseFloat(erpProduto.valor_venda || '0'),
      crescimento: 0 // Não disponível diretamente
    }
  }

  // Buscar produtos do ERP com filtros e paginação
  async getProdutos(filtros: ProdutoFiltros): Promise<ProdutoResponse> {
    const { page = 1, limit = 20, categoria, busca } = filtros
    const erpFiltros: ERPProdutoFiltros = {}
    if (categoria && categoria !== 'todos') {
      erpFiltros.grupo_id = parseInt(categoria, 10)
    }
    if (busca) {
      erpFiltros.nome = busca
    }
    // Buscar do ERP
    const erpProdutos = await this.erpService.getProdutos(erpFiltros)
    // Paginação manual (ERP pode não suportar paginação nativa)
    const total = erpProdutos.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const produtosPaginados = erpProdutos.slice(startIndex, endIndex).map(p => this.mapERPToProduto(p))
    return {
      success: true,
      data: produtosPaginados,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: endIndex < total,
        hasPrev: page > 1
      }
    }
  }

  // Buscar produtos top (mais vendidos)
  async getTopProdutos(limit: number = 10): Promise<Produto[]> {
    return this.produtos
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, limit)
  }

  // Calcular sazonalidade dos produtos
  async getSazonalidade(periodo: string = 'ano-atual'): Promise<SazonalidadeResponse> {
    const sazonalidade: SazonalidadeItem[] = this.produtos.map(produto => {
      // Simular cálculo de coeficiente de variação
      const coeficienteVariacao = Math.random() * 0.8 + 0.2
      const tendencia = coeficienteVariacao > 0.6 ? 'alta' : coeficienteVariacao > 0.4 ? 'moderada' : 'baixa'
      const status = coeficienteVariacao > 0.7 ? 'atencao' : coeficienteVariacao > 0.5 ? 'moderado' : 'estavel'

      return {
        produto: produto.nome,
        coeficienteVariacao,
        totalVendas: produto.vendas,
        totalReceita: produto.receita,
        tendencia,
        status
      }
    })

    const altaSazonalidade = sazonalidade.filter(s => s.status === 'atencao').length
    const mediaSazonalidade = sazonalidade.filter(s => s.status === 'moderado').length
    const baixaSazonalidade = sazonalidade.filter(s => s.status === 'estavel').length

    return {
      success: true,
      data: sazonalidade,
      meta: {
        periodo,
        totalProdutos: sazonalidade.length,
        altaSazonalidade,
        mediaSazonalidade,
        baixaSazonalidade
      }
    }
  }

  // Calcular matriz ABC
  async getMatrizABC(): Promise<MatrizABCResponse> {
    // Ordenar produtos por receita (decrescente)
    const produtosOrdenados = [...this.produtos].sort((a, b) => b.receita - a.receita)
    
    // Calcular receita total
    const receitaTotal = produtosOrdenados.reduce((sum, p) => sum + p.receita, 0)
    
    // Calcular receita acumulada para classificação
    let receitaAcumulada = 0
    const produtosComClassificacao: MatrizABCItem[] = produtosOrdenados.map(produto => {
      receitaAcumulada += produto.receita
      const percentualReceita = (produto.receita / receitaTotal) * 100
      const percentualAcumulado = (receitaAcumulada / receitaTotal) * 100
      
      // Classificação por receita (Pareto 80/20)
      let classificacaoReceita: 'A' | 'B' | 'C'
      if (percentualAcumulado <= 80) {
        classificacaoReceita = 'A'
      } else if (percentualAcumulado <= 95) {
        classificacaoReceita = 'B'
      } else {
        classificacaoReceita = 'C'
      }

      // Classificação por frequência (baseada no número de vendas)
      const frequencia = produto.vendas
      const frequenciaMedia = this.produtos.reduce((sum, p) => sum + p.vendas, 0) / this.produtos.length
      let classificacaoFrequencia: 'A' | 'B' | 'C'
      
      if (frequencia >= frequenciaMedia * 1.5) {
        classificacaoFrequencia = 'A'
      } else if (frequencia >= frequenciaMedia * 0.8) {
        classificacaoFrequencia = 'B'
      } else {
        classificacaoFrequencia = 'C'
      }

      // Determinar quadrante
      const quadrante = `${classificacaoReceita}${classificacaoFrequencia}`
      
      // Determinar prioridade
      let prioridade: string
      if (quadrante === 'AA') {
        prioridade = 'alta'
      } else if (['AB', 'BA'].includes(quadrante)) {
        prioridade = 'media'
      } else {
        prioridade = 'baixa'
      }

      return {
        nome: produto.nome,
        vendas: produto.vendas,
        receita: produto.receita,
        frequencia: frequencia,
        classificacaoReceita,
        classificacaoFrequencia,
        quadrante,
        prioridade,
        percentualReceita
      }
    })

    // Agrupar por quadrantes
    const quadrantes: Record<string, MatrizABCItem[]> = {}
    produtosComClassificacao.forEach(produto => {
      if (!quadrantes[produto.quadrante]) {
        quadrantes[produto.quadrante] = []
      }
      quadrantes[produto.quadrante].push(produto)
    })

    // Calcular resumo
    const classeA_receita = produtosComClassificacao.filter(p => p.classificacaoReceita === 'A').length
    const classeA_frequencia = produtosComClassificacao.filter(p => p.classificacaoFrequencia === 'A').length
    const produtosCriticos = quadrantes['AA']?.length || 0
    const produtosOportunidade = (quadrantes['AC']?.length || 0) + (quadrantes['CA']?.length || 0)
    const receita80_20 = produtosComClassificacao
      .filter(p => p.classificacaoReceita === 'A')
      .reduce((sum, p) => sum + p.receita, 0)

    return {
      success: true,
      data: produtosComClassificacao,
      quadrantes,
      resumo: {
        totalProdutos: produtosComClassificacao.length,
        classeA_receita,
        classeA_frequencia,
        produtosCriticos,
        produtosOportunidade,
        receita80_20
      },
      meta: {
        algoritmo: 'Pareto 80/20 para receita + distribuição percentual para frequência',
        criterios: {
          receita: 'A: 80% acumulado, B: 95% acumulado, C: restante',
          frequencia: 'A: ≥150% da média, B: ≥80% da média, C: <80% da média'
        }
      }
    }
  }
} 