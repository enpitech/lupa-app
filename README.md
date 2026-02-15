# Lupa

A React Native app built with Expo.

## Get Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run start:dev
   ```

3. Open the app:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Tech Stack

- React Native 0.81
- Expo SDK 54
- TypeScript
- TanStack Query + Zustand
- Expo Router v6.0

See [CLAUDE.md](CLAUDE.md) for architecture and development guidelines.

## Environment Configuration

The app uses environment variables with Expo's `EXPO_PUBLIC_` prefix. Different environments are managed through `.env` files.

### Available Environments

- **Development** (`.env.development`) - Default environment
- **Staging** (`.env.staging`) - Staging servers
- **Production** (`.env.production`) - Production servers
- **Debug** (`.env.debug`) - Debug/test servers

### Running Different Environments

```bash
# Development
npm run start:dev
npm run ios:dev
npm run android:dev

# Staging
npm run start:staging
npm run ios:staging
npm run android:staging

# Production
npm run start:prod
npm run ios:prod
npm run android:prod

# Debug
npm run start:debug
npm run ios:debug
npm run android:debug
```

### Using Environment Variables in Code

Always import from the centralized config:

```typescript
import { env } from '@/config/env';

const apiUrl = env.API_URL;
const cloudCode = env.CLOUD_CODE;
```

**Never use `process.env` directly** - use the `env` object from `@/config/env` for type safety and consistency.

### Adding New Environment Variables

1. Add to all `.env` files with `EXPO_PUBLIC_` prefix:
   ```
   EXPO_PUBLIC_NEW_VAR=value
   ```

2. Add to `config/env.ts`:
   ```typescript
   export const env = {
     // ... existing
     NEW_VAR: process.env.EXPO_PUBLIC_NEW_VAR || 'default',
   } as const;
   ```

3. Use in code:
   ```typescript
   import { env } from '@/config/env';
   const value = env.NEW_VAR;
   ```

### Important Notes

- ⚠️ All `EXPO_PUBLIC_` variables are bundled into your app - never store secrets
- 🔄 Restart Metro bundler after changing `.env` files
- 📱 Each environment uses a unique bundle identifier for side-by-side installation
