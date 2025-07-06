export interface ERPConfig {
    baseUrl: string;
    accessToken: string;
    secretAccessToken: string;
    rateLimit: {
        requestsPerSecond: number;
        requestsPerDay: number;
    };
    timeout: number;
    retryAttempts: number;
}
export declare const erpConfig: ERPConfig;
export declare const getERPHeaders: () => Record<string, string>;
export declare const validateERPConfig: () => boolean;
//# sourceMappingURL=erpConfig.d.ts.map