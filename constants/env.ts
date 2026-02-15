/**
 * Environment Configuration
 * 
 * This file provides environment-specific constants based on the EXPO_PUBLIC_APP_VARIANT.
 * Values are determined at build time and embedded into the app.
 */

type Environment = 'development' | 'staging' | 'production';

type EnvConfig = {
  /** Current environment */
  ENV: Environment;
  /** Whether this is a development build */
  IS_DEV: boolean;
  /** Whether this is a staging build */
  IS_STAGING: boolean;
  /** Whether this is a production build */
  IS_PROD: boolean;
  
  /** API Configuration */
  API_URL: string;
  API_TIMEOUT: number;
  
  /** Feature Flags */
  ENABLE_DEV_MENU: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  SHOW_PERFORMANCE_MONITOR: boolean;
  
  /** Logging */
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_API_REQUESTS: boolean;
  
  /** External Services (replace with your actual keys) */
  SENTRY_DSN?: string;
  ANALYTICS_KEY?: string;
};

// Get the current environment from the build-time variable
const APP_VARIANT = process.env.EXPO_PUBLIC_APP_VARIANT as Environment | undefined;
const ENV: Environment = APP_VARIANT || 'development';

/**
 * Environment-specific configuration
 */
const configs: Record<Environment, EnvConfig> = {
  development: {
    ENV: 'development',
    IS_DEV: true,
    IS_STAGING: false,
    IS_PROD: false,
    
    // Development APIs (local or staging)
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api-staging.example.com',
    API_TIMEOUT: 30000,
    
    // Features enabled for development
    ENABLE_DEV_MENU: true,
    ENABLE_ANALYTICS: false,
    ENABLE_ERROR_REPORTING: false,
    SHOW_PERFORMANCE_MONITOR: true,
    
    // Verbose logging for development
    LOG_LEVEL: 'debug',
    LOG_API_REQUESTS: true,
    
    // No external services in dev
    SENTRY_DSN: undefined,
    ANALYTICS_KEY: undefined,
  },
  
  staging: {
    ENV: 'staging',
    IS_DEV: false,
    IS_STAGING: true,
    IS_PROD: false,
    
    // Staging APIs
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api-staging.example.com',
    API_TIMEOUT: 30000,
    
    // Test external services with staging builds
    ENABLE_DEV_MENU: false,
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_REPORTING: true,
    SHOW_PERFORMANCE_MONITOR: false,
    
    // Standard logging for testing
    LOG_LEVEL: 'info',
    LOG_API_REQUESTS: true,
    
    // Staging keys for testing integrations
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    ANALYTICS_KEY: process.env.EXPO_PUBLIC_ANALYTICS_KEY,
  },
  
  production: {
    ENV: 'production',
    IS_DEV: false,
    IS_STAGING: false,
    IS_PROD: true,
    
    // Production APIs
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
    API_TIMEOUT: 15000,
    
    // Production features
    ENABLE_DEV_MENU: false,
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_REPORTING: true,
    SHOW_PERFORMANCE_MONITOR: false,
    
    // Minimal logging for production
    LOG_LEVEL: 'error',
    LOG_API_REQUESTS: false,
    
    // Production keys
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    ANALYTICS_KEY: process.env.EXPO_PUBLIC_ANALYTICS_KEY,
  },
};

/**
 * Current environment configuration
 * Import this in your app to access environment-specific values
 */
export const env = configs[ENV];

/**
 * Helper to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof EnvConfig): boolean => {
  const value = env[feature];
  return typeof value === 'boolean' ? value : false;
};

/**
 * Type-safe access to environment variables
 */
export type { EnvConfig, Environment };
