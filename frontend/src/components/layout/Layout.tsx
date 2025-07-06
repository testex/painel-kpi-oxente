import React from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  showSidebar?: boolean
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = "Painel KPI V2",
  showSidebar = true 
}) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      {showSidebar && (
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
      )}
      
      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        {/* Header do Conteúdo */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Atualizado em {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-success font-medium">Dados Atualizados</span>
            </div>
          </div>
        </header>
        
        {/* Conteúdo da Página */}
        <main className="p-4 lg:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}