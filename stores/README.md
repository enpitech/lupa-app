# Stores

Zustand stores for client-only state management.

## Available Stores

### `user` — User & Authentication

Manages user authentication, profile data, and auth-related actions.

- **Location:** `stores/user/`
- **Features:** Login, logout, profile updates, token refresh
- **Persistence:** `expo-secure-store` via Zustand persist middleware
- **Actions:** `stores/user/actions/*.action.ts`

**Usage:**
```tsx
const user = useUserStore((state) => state.user);
const login = useUserStore((state) => state.login);
```

---

### `auth-loader` — Auth Initialization State

Tracks the authentication initialization lifecycle during app startup (`idle` → `loading` → `authenticated` | `unauthenticated`).

- **Location:** `stores/auth-loader/`
- **Types:** `types/auth-loader.ts`
- **Persistence:** None (transient state)

**Usage:**
```tsx
const status = useAuthLoaderStore((state) => state.status);
```

---

## Conventions

- One store per domain, each in its own directory
- Complex logic goes in `actions/*.action.ts` files
- Types go in `/types/` (global) — not co-located with the store
- Use selectors for performance: `useStore((s) => s.field)` instead of destructuring
- Access stores outside React with `useStore.getState()`
- Use `subscribeWithSelector` middleware for side-effect subscriptions
