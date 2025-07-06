// Carrega variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();

// Log das variáveis de ambiente para debug
console.log('[Server] Variáveis de ambiente carregadas:');
console.log('[Server] ERP_API_KEY:', process.env.ERP_API_KEY ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('[Server] ERP_SECRET:', process.env.ERP_SECRET ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('[Server] ERP_BASE_URL:', process.env.ERP_BASE_URL);

import express from 'express';
import cors from 'cors';
import { produtosRoutes } from './routes/produtos';
import { erpRoutes } from './routes/erp';
import vendasRoutes from './routes/vendas';
import clientesRoutes from './routes/clientes';
import dashboardRoutes from './routes/dashboard';
import systemRoutes from './routes/system';
import sequelize from './config/database';
import cacheService from './services/cacheService';
import syncService from './services/syncService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para logs de debug
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', process.env.FRONTEND_URL].filter(Boolean) as string[],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing JSON
app.use(express.json());

// Rotas da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/system', systemRoutes);

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  console.log('[Server] Health check endpoint called');
  res.json({ 
    status: 'OK', 
    message: 'Backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para KPI
app.get('/api/kpi/test', (req, res) => {
  console.log('[Server] KPI test endpoint called');
  res.json({
    success: true,
    data: {
      metric: 'Test KPI',
      value: 85.5,
      unit: '%',
      trend: 'up'
    }
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Rota para requisições não encontradas
app.use('*', (req, res) => {
  console.log(`[Server] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

// Inicialização do servidor
app.listen(PORT, async () => {
  console.log(`[Server] Servidor rodando na porta ${PORT}`);
  console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] URL: http://localhost:${PORT}`);
  
  try {
    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('[Server] Conexão com PostgreSQL estabelecida com sucesso');
    
    // Sincronizar modelos (criar tabelas se não existirem)
    await sequelize.sync({ alter: true });
    console.log('[Server] Modelos sincronizados com o banco de dados');
    
    // Conectar ao Redis
    await cacheService.connect();
    console.log('[Server] Cache Redis inicializado');
    
    // Iniciar sincronização automática
    syncService.startAutoSync();
    console.log('[Server] Sincronização automática iniciada');
    
  } catch (error) {
    console.error('[Server] Erro na inicialização:', error);
  }
}); 