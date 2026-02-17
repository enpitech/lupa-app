# Hooks

Custom React hooks for the Lupa application.

## Available Hooks

### `useTranslation()`

Returns the translation function `t`, the `i18n` instance, and the current text `direction`.

**File:** `use-translation.ts`

**Usage:**
```tsx
const { t, i18n, direction } = useTranslation();
```

---

### `useDirection()`

Returns the current text direction (`'ltr'` or `'rtl'`) based on the active locale.

**File:** `use-direction.ts`

**Usage:**
```tsx
const direction = useDirection();
```

---

### `useUserProfile()`

TanStack Query hook that fetches the current user's profile using the stored auth token.

**File:** `use-user-profile.ts`

**Usage:**
```tsx
const { data: profile, isLoading, error } = useUserProfile();
```

---

### `useTokenRefresh()`

Automatically refreshes the user's auth token when the app returns to the foreground.

**File:** `use-token-refresh.ts`

**Usage:** Call once at app root level.
```tsx
useTokenRefresh();
```

---

## Adding New Hooks

1. Create file in `hooks/` using kebab-case (e.g., `use-album-list.ts`)
2. Use TanStack Query for any server-state fetching
3. Use centralized query keys from `@/constants/query-keys`
4. Export the hook as a named export
5. Update this README
