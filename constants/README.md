# Environment Configuration

## Overview

This project uses environment-based configuration to manage different settings for development, staging, and production environments.

## Files

- **`env.ts`** - Main environment configuration with type-safe access to all environment variables
- **`.env.example`** - Template for local environment variables

## Usage

### In your app code

```typescript
import { env } from '@/constants/env';

// Access environment-specific values
const apiUrl = env.API_URL;
const isDevMode = env.IS_DEV;

// Check feature flags
if (env.ENABLE_ANALYTICS) {
  // Initialize analytics
}

// Environment-aware logging
if (env.LOG_API_REQUESTS) {
  console.log('API Request:', endpoint);
}
```

### Example use cases

**API Client:**
```typescript
import { env } from '@/constants/env';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
});
```

**Logger Service:**
```typescript
import { env } from '@/constants/env';

export const log = {
  debug: (msg: string) => env.LOG_LEVEL === 'debug' && console.log(msg),
  info: (msg: string) => ['debug', 'info'].includes(env.LOG_LEVEL) && console.log(msg),
  error: (msg: string) => console.error(msg),
};
```

**Feature Flags:**
```typescript
import { env } from '@/constants/env';

export function DevMenu() {
  if (!env.ENABLE_DEV_MENU) return null;
  return <DeveloperTools />;
}
```

## Environment Variables

### Build-time Variables (EAS)

Set in `eas.json` under each profile:

```json
{
  "build": {
    "staging": {
      "env": {
        "EXPO_PUBLIC_APP_VARIANT": "staging",
        "EXPO_PUBLIC_API_URL": "https://api-staging.example.com"
      }
    }
  }
}
```

### Secrets (EAS)

For sensitive values, use EAS Secrets:

```bash
# Set secrets for staging
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "your-dsn" --type string

# Secrets are automatically available in builds
```

## Environments

### Development
- Local development with `expo start`
- Points to staging APIs by default
- Enables all debug tools
- Verbose logging

### Staging
- TestFlight/Internal Testing builds
- Same staging APIs as development
- Enables analytics and error tracking for testing
- Standard logging

### Production
- App Store/Play Store releases
- Production APIs
- Full analytics and error reporting
- Minimal logging

## Best Practices

1. **Never commit secrets** - Use EAS Secrets or `.env.local` (gitignored)
2. **Use type-safe access** - Import from `env.ts` rather than accessing `process.env` directly
3. **Set defaults** - Always provide fallback values in `env.ts`
4. **Keep it simple** - Don't over-engineer; add config as you need it
5. **Document changes** - Update this README when adding new environment variables

## Adding New Variables

1. Add the variable to `EnvConfig` type in `env.ts`
2. Set values for each environment (development, staging, production)
3. Document it in `.env.example`
4. Update this README with the new variable

## Common Patterns

### Conditional Rendering
```typescript
{env.IS_DEV && <DebugPanel />}
```

### API Configuration
```typescript
const config = {
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  headers: env.IS_PROD ? { 'X-App-Version': Constants.expoConfig?.version } : {},
};
```

### Feature Detection
```typescript
const shouldTrack = env.ENABLE_ANALYTICS && !env.IS_DEV;
```
