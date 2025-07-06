// Configurações da API do ERP GestãoClick
// Seguindo o guia de desenvolvimento - configurações centralizadas

export interface ERPConfig {
  baseUrl: string
  accessToken: string
  secretAccessToken: string
  rateLimit: {
    requestsPerSecond: number
    requestsPerDay: number
  }
  timeout: number
  retryAttempts: number
}

// Configuração padrão do ERP GestãoClick
export const erpConfig: ERPConfig = {
  baseUrl: process.env.ERP_BASE_URL || 'https://api.gestaoclick.com',
  accessToken: process.env.ERP_API_KEY || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  secretAccessToken: process.env.ERP_SECRET || 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
  rateLimit: {
    requestsPerSecond: parseInt(process.env.ERP_RATE_LIMIT_REQUESTS_PER_SECOND || '3'),
    requestsPerDay: parseInt(process.env.ERP_RATE_LIMIT_REQUESTS_PER_DAY || '30000')
  },
  timeout: parseInt(process.env.ERP_TIMEOUT || '30000'), // 30 segundos
  retryAttempts: 3
}

// Headers padrão para todas as requisições
export const getERPHeaders = (): Record<string, string> => {
  console.log('[ERPConfig] Gerando headers para requisição')
  return {
    'access-token': erpConfig.accessToken,
    'secret-access-token': erpConfig.secretAccessToken,
    'Content-Type': 'application/json'
  }
}

// Validação de configuração
export const validateERPConfig = (): boolean => {
  console.log('[ERPConfig] Validando configuração do ERP')
  
  const isValid = !!(
    erpConfig.accessToken && 
    erpConfig.accessToken !== 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' &&
    erpConfig.secretAccessToken && 
    erpConfig.secretAccessToken !== 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'
  )

  if (!isValid) {
    console.warn('[ERPConfig] ⚠️ Credenciais do ERP não configuradas - usando dados mock')
  } else {
    console.log('[ERPConfig] ✅ Configuração do ERP válida')
  }

  return isValid
} 