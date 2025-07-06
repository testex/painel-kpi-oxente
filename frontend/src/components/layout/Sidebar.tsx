import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, Users, Package, Target, 
  TrendingUp, Settings, AlertTriangle, Clock 
} from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: BarChart3,
      description: 'Visão geral dos KPIs'
    },
    { 
      name: 'Executivo', 
      href: '/executivo', 
      icon: TrendingUp,
      description: 'Dashboard executivo'
    },
    { 
      name: 'Análise RFM', 
      href: '/rfm', 
      icon: Target,
      description: 'Segmentação de clientes'
    },
    { 
      name: 'Alertas RFM', 
      href: '/alertas', 
      icon: AlertTriangle,
      description: 'Alertas e notificações'
    },
    { 
      name: 'Métricas Tempo', 
      href: '/metricas', 
      icon: Clock,
      description: 'Análise temporal'
    },
    { 
      name: 'Clientes', 
      href: '/clientes', 
      icon: Users,
      description: 'Gestão de clientes'
    },
    { 
      name: 'Vendas', 
      href: '/vendas', 
      icon: TrendingUp,
      description: 'Análise de vendas'
    },
    { 
      name: 'Produtos', 
      href: '/produtos', 
      icon: Package,
      description: 'Gestão de produtos'
    },
  ]

  return (
    <div className="w-64 bg-card shadow-elegant flex flex-col h-full border-r">
      {/* Header da Sidebar */}
      <div className="p-6 gradient-header">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-card">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">📊 Painel KPIs</h1>
            <p className="text-primary-light text-sm font-medium">Sistema V2</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 mt-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus-visible
                  ${isActive 
                    ? 'nav-active' 
                    : 'nav-inactive'
                  }
                `}
                title={item.description}
              >
                <Icon 
                  className={`
                    mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                  `} 
                />
                <span className="flex-1">{item.name}</span>
                
                {/* Indicador de estado ativo */}
                {isActive && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-4 bg-muted/30 border-t">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Sprint 2 - Sistema Funcional</p>
          <p className="text-xs text-muted-foreground">v2.0.0</p>
          <div className="mt-3 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-success font-medium">Sistema Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}