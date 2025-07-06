"use strict";
// Rotas para verificação de status da integração com ERP
// Seguindo o guia de desenvolvimento - logs de debug e tratamento de erros
Object.defineProperty(exports, "__esModule", { value: true });
exports.erpRoutes = void 0;
const express_1 = require("express");
const erpIntegrationService_1 = require("../services/erpIntegrationService");
const erpConfig_1 = require("../config/erpConfig");
const router = (0, express_1.Router)();
exports.erpRoutes = router;
const erpService = new erpIntegrationService_1.ERPIntegrationService();
// Middleware para tratamento de erros assíncronos
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// GET /api/erp/status - Verificar status da integração
router.get('/status', asyncHandler(async (req, res) => {
    console.log('[ERP Routes] GET /api/erp/status - Verificando status da integração');
    try {
        const configValid = (0, erpConfig_1.validateERPConfig)();
        const connectionStatus = await erpService.checkConnection();
        const status = {
            success: true,
            data: {
                configValid,
                connectionStatus,
                timestamp: new Date().toISOString(),
                message: configValid
                    ? (connectionStatus ? 'ERP conectado e funcionando' : 'ERP configurado mas sem conexão')
                    : 'ERP não configurado - usando dados mock'
            }
        };
        console.log('[ERP Routes] Status da integração:', status.data);
        res.json(status);
    }
    catch (error) {
        console.error('[ERP Routes] Erro ao verificar status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar status da integração',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}));
// POST /api/erp/cache/clear - Limpar cache
router.post('/cache/clear', asyncHandler(async (req, res) => {
    console.log('[ERP Routes] POST /api/erp/cache/clear - Limpando cache');
    try {
        erpService.clearCache();
        res.json({
            success: true,
            data: {
                message: 'Cache limpo com sucesso',
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('[ERP Routes] Erro ao limpar cache:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar cache',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}));
// GET /api/erp/test - Teste de conexão
router.get('/test', asyncHandler(async (req, res) => {
    console.log('[ERP Routes] GET /api/erp/test - Testando conexão com ERP');
    try {
        const isConnected = await erpService.checkConnection();
        res.json({
            success: true,
            data: {
                connected: isConnected,
                timestamp: new Date().toISOString(),
                message: isConnected
                    ? 'Conexão com ERP estabelecida com sucesso'
                    : 'Falha na conexão com ERP'
            }
        });
    }
    catch (error) {
        console.error('[ERP Routes] Erro no teste de conexão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no teste de conexão',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
}));
//# sourceMappingURL=erp.js.map