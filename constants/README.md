# Constants

App-wide constants and configuration.

## Contents

### `theme/`

Design system tokens — colors, spacing, typography, shadows, borders, and timing.

```tsx
import { theme } from '@/constants/theme';
```

See [theme/README.md](./theme/README.md) for full documentation.

---

### `query-keys.ts`

Centralized TanStack Query key definitions. All query hooks should reference keys from here.

```tsx
import { queryKeys } from '@/constants/query-keys';

// queryKeys.user.profile(token)
// queryKeys.user.validate
```

---

## Environment Configuration

Environment variables are managed in `config/env.ts` (not in this directory). See the Expo docs on [environment variables](https://docs.expo.dev/guides/environment-variables/) for details.

```tsx
import { env } from '@/config/env';
```
