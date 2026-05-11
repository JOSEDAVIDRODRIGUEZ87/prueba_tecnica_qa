/**
 * Centralized System Configuration
 * Note: Values are loaded from environment variables. 
 * Hardcoded fallbacks are kept strictly for local development but should be avoided in CI/CD.
 */

export const DB_CONFIG = {
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'daem_prueba',
  user: process.env.DB_USER ?? 'daem_user',
  // SECURITY: Never use production passwords here. 
  // Use environment variables exclusively for credentials.
  password: process.env.DB_PASSWORD ?? 'daem_pass', 
  maxConnections: 10,
  idleTimeoutMs: 30000,
};

export const JWT_CONFIG = {
  // SECURITY: Fallback key for dev only. Production MUST fail if JWT_SECRET is missing.
  secret: process.env.JWT_SECRET || 'dev_insecure_secret_key', 
  expiration: '8h',
  refreshExpiration: '7d',
};

export const RATE_LIMITS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
};

export const SUPPORTED_PROGRAMS = ['A3ECO', 'A3NOM', 'A3GES', 'A3ASE'] as const;

/**
 * VAT Rates (Spain 2026 update)
 * Values maintained according to current fiscal regulations.
 */
export const VAT_RATES = {
  general: 0.21,
  reduced: 0.10,
  superReduced: 0.04,
  exempt: 0,
} as const;

// CLEAN CODE: Removed LEGACY_API_VERSION as it was identified as dead code/unused constant.