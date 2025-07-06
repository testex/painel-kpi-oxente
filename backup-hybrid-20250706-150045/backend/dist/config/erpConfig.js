"use strict";
// Configurações da API do ERP GestãoClick
// Seguindo o guia de desenvolvimento - configurações centralizadas
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateERPConfig = exports.getERPHeaders = exports.erpConfig = void 0;
// Configuração padrão do ERP GestãoClick
exports.erpConfig = {
    baseUrl: 'https://api.beteltecnologia.com',
    accessToken: process.env.ERP_ACCESS_TOKEN || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    secretAccessToken: process.env.ERP_SECRET_ACCESS_TOKEN || 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    rateLimit: {
        requestsPerSecond: 3,
        requestsPerDay: 30000
    },
    timeout: 30000, // 30 segundos
    retryAttempts: 3
};
// Headers padrão para todas as requisições
const getERPHeaders = () => {
    console.log('[ERPConfig] Gerando headers para requisição');
    return {
        'access-token': exports.erpConfig.accessToken,
        'secret-access-token': exports.erpConfig.secretAccessToken,
        'Content-Type': 'application/json'
    };
};
exports.getERPHeaders = getERPHeaders;
// Validação de configuração
const validateERPConfig = () => {
    console.log('[ERPConfig] Validando configuração do ERP');
    const isValid = !!(exports.erpConfig.accessToken &&
        exports.erpConfig.accessToken !== 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' &&
        exports.erpConfig.secretAccessToken &&
        exports.erpConfig.secretAccessToken !== 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
    if (!isValid) {
        console.warn('[ERPConfig] ⚠️ Credenciais do ERP não configuradas - usando dados mock');
    }
    else {
        console.log('[ERPConfig] ✅ Configuração do ERP válida');
    }
    return isValid;
};
exports.validateERPConfig = validateERPConfig;
//# sourceMappingURL=erpConfig.js.map