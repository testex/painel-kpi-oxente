import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Interface para dados de KPI
interface KPIData {
  metric: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
}

// Interface para resposta da API
interface APIResponse {
  success: boolean
  data: KPIData
}

function App() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<string>('checking')

  // Handler para carregar dados do KPI
  const handleLoadKPIData = async () => {
    console.log('[App] handleLoadKPIData - Iniciando carregamento de dados KPI')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get<APIResponse>('http://localhost:3001/api/kpi/test')
      console.log('[App] handleLoadKPIData - Dados recebidos:', response.data)
      
      setKpiData(response.data.data)
    } catch (err) {
      console.error('[App] handleLoadKPIData - Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do KPI')
    } finally {
      setLoading(false)
    }
  }

  // Handler para verificar status do servidor
  const handleCheckServerStatus = async () => {
    console.log('[App] handleCheckServerStatus - Verificando status do servidor')
    
    try {
      const response = await axios.get('http://localhost:3001/api/health')
      console.log('[App] handleCheckServerStatus - Status recebido:', response.data)
      setServerStatus('online')
    } catch (err) {
      console.error('[App] handleCheckServerStatus - Servidor offline:', err)
      setServerStatus('offline')
    }
  }

  // Handler para recarregar dados
  const handleRefresh = () => {
    console.log('[App] handleRefresh - Recarregando dados')
    handleLoadKPIData()
  }

  // Efeito para carregar dados iniciais
  useEffect(() => {
    console.log('[App] useEffect - Carregando dados iniciais')
    handleCheckServerStatus()
    handleLoadKPIData()
  }, [])

  return (
    <div className="app-container" data-testid="app-container">
      <header className="app-header" data-testid="app-header">
        <h1 data-testid="app-title">Painel KPI V3</h1>
        <div className="server-status" data-testid="server-status">
          <span>Servidor: </span>
          <span className={`status-indicator ${serverStatus}`} data-testid="status-indicator">
            {serverStatus === 'online' ? '🟢 Online' : 
             serverStatus === 'offline' ? '🔴 Offline' : '🟡 Verificando...'}
          </span>
        </div>
      </header>

      <main className="app-main" data-testid="app-main">
        <div className="kpi-card" data-testid="kpi-card">
          <div className="kpi-header" data-testid="kpi-header">
            <h2 data-testid="kpi-title">Métrica Principal</h2>
            <button 
              onClick={handleRefresh}
              className="refresh-button"
              data-testid="btn-refresh-kpi"
              disabled={loading}
            >
              {loading ? '🔄' : '🔄'}
            </button>
          </div>

          <div className="kpi-content" data-testid="kpi-content">
            {loading ? (
              <div className="loading" data-testid="loading-indicator">
                Carregando...
              </div>
            ) : error ? (
              <div className="error" data-testid="error-message">
                {error}
              </div>
            ) : kpiData ? (
              <div className="kpi-value" data-testid="kpi-value">
                <span className="value" data-testid="kpi-value-number">
                  {kpiData.value}
                </span>
                <span className="unit" data-testid="kpi-value-unit">
                  {kpiData.unit}
                </span>
                <span className={`trend ${kpiData.trend}`} data-testid="kpi-trend">
                  {kpiData.trend === 'up' ? '📈' : 
                   kpiData.trend === 'down' ? '📉' : '➡️'}
                </span>
              </div>
            ) : (
              <div className="no-data" data-testid="no-data-message">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
