"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const produtos_1 = require("./routes/produtos");
const erp_1 = require("./routes/erp");
const vendas_1 = __importDefault(require("./routes/vendas"));
const clientes_1 = __importDefault(require("./routes/clientes"));
// Carrega variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware para logs de debug
app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});
// Configuração do CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// Middleware para parsing JSON
app.use(express_1.default.json());
// Rotas da API
app.use('/api/produtos', produtos_1.produtosRoutes);
app.use('/api/erp', erp_1.erpRoutes);
app.use('/api/vendas', vendas_1.default);
app.use('/api/clientes', clientes_1.default);
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
app.use((err, req, res, next) => {
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
//# sourceMappingURL=server.js.map