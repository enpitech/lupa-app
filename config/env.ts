/**
 * Environment Configuration
 *
 * Centralized access to environment variables for the Lupa app.
 * All environment variables must be prefixed with EXPO_PUBLIC_ to be accessible.
 *
 * @see https://docs.expo.dev/guides/environment-variables/
 */

export const env = {
  // API URLs
  CONNECT_URL: process.env.EXPO_PUBLIC_CONNECT_URL || '',
  API_URL: process.env.EXPO_PUBLIC_API_URL || '',
  API_URL_EDITOR: process.env.EXPO_PUBLIC_API_URL_EDITOR || '',
  API_URL_UPLOAD: process.env.EXPO_PUBLIC_API_URL_UPLOAD || '',
  IMAGE_URL: process.env.EXPO_PUBLIC_IMAGE_URL || '',
  COVER_IMAGE_URL: process.env.EXPO_PUBLIC_COVER_IMAGE_URL || '',
  API_EPILOG_PROLOG_URL: process.env.EXPO_PUBLIC_API_EPILOG_PROLOG_URL || '',
  RESOURCES_IMAGE_URL: process.env.EXPO_PUBLIC_RESOURCES_IMAGE_URL || '',
  API_PAYMENT_URL: process.env.EXPO_PUBLIC_API_PAYMENT_URL || '',
  UPLOAD_SNAPSHOTS_URL: process.env.EXPO_PUBLIC_UPLOAD_SNAPSHOTS_URL || '',
  API_PAYMENT_UI_URL: process.env.EXPO_PUBLIC_API_PAYMENT_UI_URL || '',
  PRICELIST_URL: process.env.EXPO_PUBLIC_PRICELIST_URL || 'https://pricelist.lupa.co.il/pricelist',

  // Google Photos
  GOOGLE_PHOTOS_COMPANION_URL: process.env.EXPO_PUBLIC_GOOGLE_PHOTOS_COMPANION_URL || '',
  GOOGLE_PHOTOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_PHOTOS_CLIENT_ID || '',

  // Configuration
  CLOUD_CODE: process.env.EXPO_PUBLIC_CLOUD_CODE || 'test',
  ENV: process.env.EXPO_PUBLIC_ENV || 'development',
  DEFAULT_APPROVAL_VERSION: process.env.EXPO_PUBLIC_DEFAULT_APPROVAL_VERSION || '1.2',
} as const;

/**
 * Validates that all required environment variables are set.
 * Throws an error if any required variable is missing.
 */
export function validateEnv(): void {
  const requiredVars: (keyof typeof env)[] = [
    'CONNECT_URL',
    'API_URL',
    'API_URL_EDITOR',
    'API_URL_UPLOAD',
    'IMAGE_URL',
    'COVER_IMAGE_URL',
    'API_EPILOG_PROLOG_URL',
    'RESOURCES_IMAGE_URL',
    'API_PAYMENT_URL',
    'UPLOAD_SNAPSHOTS_URL',
    'API_PAYMENT_UI_URL',
    'PRICELIST_URL',
    'CLOUD_CODE',
    'ENV',
  ];

  const missingVars = requiredVars.filter((key) => !env[key]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please check your .env file and ensure all EXPO_PUBLIC_ variables are set.`
    );
  }
}

/**
 * Returns the current environment name.
 */
export function getEnvironment(): 'production' | 'staging' | 'development' | 'debug' {
  return (env.ENV as any) || 'development';
}

/**
 * Checks if the app is running in production.
 */
export function isProduction(): boolean {
  return env.ENV === 'production';
}

/**
 * Checks if the app is running in development.
 */
export function isDevelopment(): boolean {
  return env.ENV === 'development' || env.ENV === 'debug';
}
