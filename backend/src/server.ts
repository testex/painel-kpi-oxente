import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para logs de debug
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Configuração do CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`[Server] Servidor rodando na porta ${PORT}`);
  console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] URL: http://localhost:${PORT}`);
}); 