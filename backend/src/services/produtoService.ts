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

  // Mapear produto do ERP para o formato do frontend
  private mapERPToProduto(erpProduto: ERPProduto): Produto {
    // Mapear apenas os campos vindos do ERP, sem simulação
    const preco = parseFloat(erpProduto.valor_venda || '0')
    const estoque = erpProduto.estoque || 0
    // Calcular vendas baseado no estoque (assumindo que estoque inicial era maior)
    // Se não houver dados de vendas no ERP, usar 0
    const vendas = 0 // Será calculado a partir das vendas reais do ERP
    const receita = vendas * preco
    return {
      id: parseInt(erpProduto.id, 10),
      nome: erpProduto.nome,
      categoria: erpProduto.nome_grupo || 'Sem categoria',
      preco: preco,
      estoque: estoque,
      vendas: vendas,
      receita: receita,
      ticketMedio: preco,
      crescimento: 0 // Será calculado a partir de dados históricos do ERP
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
    
    try {
      // Buscar do ERP
      const erpProdutos = await this.erpService.getProdutos(erpFiltros)
      if (erpProdutos.length === 0) {
        throw new Error('[ProdutoService] Nenhum produto encontrado no ERP. Não é permitido usar dados mockados.')
      }
      
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
    } catch (error) {
      console.error('[ProdutoService] Erro ao buscar produtos do ERP:', error)
      throw error
    }
  }

  // Buscar top produtos por vendas
  async getTopProdutos(limit: number = 10): Promise<Produto[]> {
    console.log(`[ProdutoService] Buscando top ${limit} produtos`)
    
    try {
      const produtos = await this.getProdutos({ limit: 1000 })
      if (!produtos.success || !produtos.data) {
        throw new Error('[ProdutoService] Erro ao buscar produtos para ranking')
      }
      
      return produtos.data
        .sort((a, b) => b.vendas - a.vendas)
        .slice(0, limit)
    } catch (error) {
      console.error('[ProdutoService] Erro ao buscar top produtos:', error)
      throw error
    }
  }

  // Buscar sazonalidade dos produtos
  async getSazonalidade(periodo: string = 'ano-atual'): Promise<SazonalidadeResponse> {
    console.log(`[ProdutoService] Buscando sazonalidade para período: ${periodo}`)
    
    try {
      const produtos = await this.getProdutos({ limit: 1000 })
      if (!produtos.success || !produtos.data) {
        throw new Error('[ProdutoService] Erro ao buscar produtos para sazonalidade')
      }
      
      const sazonalidade: SazonalidadeItem[] = produtos.data.map(produto => {
        // Calcular coeficiente de variação baseado em dados reais
        const coeficienteVariacao = produto.vendas > 0 ? (produto.receita / produto.vendas) / produto.preco : 0
        
        return {
          produto: produto.nome,
          coeficienteVariacao: parseFloat(coeficienteVariacao.toFixed(2)),
          totalVendas: produto.vendas,
          totalReceita: produto.receita,
          tendencia: coeficienteVariacao > 1.2 ? 'Alta' : coeficienteVariacao > 0.8 ? 'Média' : 'Baixa',
          status: produto.estoque > 10 ? 'Estável' : produto.estoque > 0 ? 'Atenção' : 'Crítico'
        }
      })
      
      const totalProdutos = sazonalidade.length
      const altaSazonalidade = sazonalidade.filter(s => s.tendencia === 'Alta').length
      const mediaSazonalidade = sazonalidade.filter(s => s.tendencia === 'Média').length
      const baixaSazonalidade = sazonalidade.filter(s => s.tendencia === 'Baixa').length
      
      return {
        success: true,
        data: sazonalidade,
        meta: {
          periodo,
          totalProdutos,
          altaSazonalidade,
          mediaSazonalidade,
          baixaSazonalidade
        }
      }
    } catch (error) {
      console.error('[ProdutoService] Erro ao buscar sazonalidade:', error)
      throw error
    }
  }

  // Buscar matriz ABC dos produtos
  async getMatrizABC(): Promise<MatrizABCResponse> {
    console.log('[ProdutoService] Gerando matriz ABC')
    
    try {
      const produtos = await this.getProdutos({ limit: 1000 })
      if (!produtos.success || !produtos.data) {
        throw new Error('[ProdutoService] Erro ao buscar produtos para matriz ABC')
      }
      
      const produtosOrdenados = [...produtos.data].sort((a, b) => b.receita - a.receita)
      
      // Calcular totais para percentuais
      const totalReceita = produtosOrdenados.reduce((sum, p) => sum + p.receita, 0)
      const totalVendas = produtosOrdenados.reduce((sum, p) => sum + p.vendas, 0)
      
      // Calcular frequência média
      const frequenciaMedia = produtosOrdenados.length > 0 
        ? produtosOrdenados.reduce((sum, p) => sum + p.vendas, 0) / produtosOrdenados.length
        : 0
      
      const matrizABC: MatrizABCItem[] = produtosOrdenados.map((produto, index) => {
        const percentualReceita = totalReceita > 0 ? (produto.receita / totalReceita) * 100 : 0
        const percentualFrequencia = totalVendas > 0 ? (produto.vendas / totalVendas) * 100 : 0
        
        // Classificação por receita (80-15-5)
        let classificacaoReceita: 'A' | 'B' | 'C'
        if (index < Math.floor(produtosOrdenados.length * 0.2)) classificacaoReceita = 'A'
        else if (index < Math.floor(produtosOrdenados.length * 0.35)) classificacaoReceita = 'B'
        else classificacaoReceita = 'C'
        
        // Classificação por frequência
        let classificacaoFrequencia: 'A' | 'B' | 'C'
        if (produto.vendas >= frequenciaMedia * 1.5) classificacaoFrequencia = 'A'
        else if (produto.vendas >= frequenciaMedia * 0.5) classificacaoFrequencia = 'B'
        else classificacaoFrequencia = 'C'
        
        const quadrante = `${classificacaoReceita}${classificacaoFrequencia}`
        const prioridade = quadrante === 'AA' ? 'Alta' : quadrante === 'AB' || quadrante === 'BA' ? 'Média' : 'Baixa'
        
        return {
          nome: produto.nome,
          vendas: produto.vendas,
          receita: produto.receita,
          frequencia: produto.vendas,
          classificacaoReceita,
          classificacaoFrequencia,
          quadrante,
          prioridade,
          percentualReceita: parseFloat(percentualReceita.toFixed(2))
        }
      })
      
      // Agrupar por quadrantes
      const quadrantes: Record<string, MatrizABCItem[]> = {}
      matrizABC.forEach(item => {
        if (!quadrantes[item.quadrante]) {
          quadrantes[item.quadrante] = []
        }
        quadrantes[item.quadrante].push(item)
      })
      
      // Calcular resumo
      const classeA_receita = matrizABC.filter(p => p.classificacaoReceita === 'A').length
      const classeA_frequencia = matrizABC.filter(p => p.classificacaoFrequencia === 'A').length
      const produtosCriticos = matrizABC.filter(p => p.quadrante === 'CA').length
      const produtosOportunidade = matrizABC.filter(p => p.quadrante === 'AC').length
      const receita80_20 = matrizABC
        .filter(p => p.classificacaoReceita === 'A')
        .reduce((sum, p) => sum + p.receita, 0)
      
      return {
        success: true,
        data: matrizABC,
        quadrantes,
        resumo: {
          totalProdutos: matrizABC.length,
          classeA_receita,
          classeA_frequencia,
          produtosCriticos,
          produtosOportunidade,
          receita80_20
        },
        meta: {
          algoritmo: 'Pareto 80-20',
          criterios: {
            receita: '20% dos produtos geram 80% da receita',
            frequencia: 'Baseado na média de vendas'
          }
        }
      }
    } catch (error) {
      console.error('[ProdutoService] Erro ao gerar matriz ABC:', error)
      throw error
    }
  }
} 