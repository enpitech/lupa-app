# Lupa

A React Native app for Lupa.

### Technology Stack
- **Framework**: React Native v0.81, Expo SDK 54
- **Language**: TypeScript
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Navigation**: Expo Router v6.0
- **Platforms**: iOS, Android 
- **Localization**: expo-localization + i18n-js
- **Theming**: Custom theme layer (Ignite-style)

Notice there should not be any optimization to accomodate Web as a platform since a web app already exists on a seperate project. The only platforms this repo requires to fully support is iOS + Android. Do not make any customizations to optimize or enable Web capabilities.

## Dependencies

**Prefer Expo libraries** over community packages when available. Expo packages are better maintained, offer consistent APIs across platforms, and integrate seamlessly with the Expo ecosystem.

**All solutions must be grounded in dependency documentation.** Before implementing features or suggesting solutions, verify APIs, configurations, and patterns against the official docs for each library being used. Do not rely on outdated examples or deprecated patterns.

## React Compiler

React Compiler is installed and handles optimization automatically. **Do not use `React.memo`, `useMemo`, or `useCallback`** unless your analysis reveals a specific issue the compiler cannot handle.

## Architecture

### State Management

- **TanStack Query**: All server state (API data, caching, synchronization). This is the source of truth for any data from the API.
- **Zustand**: Client-only state (auth tokens, UI preferences, transient app state). Do not duplicate server data in Zustand stores.

#### TanStack Query (Server State)

**Use TanStack Query for:**
- API data fetching and caching
- Server synchronization
- Background refetching
- Optimistic updates
- Request deduplication

**Key Files:**
- `hooks/` - Query hooks (e.g., `useUserProfile.ts`)
- `services/api/` - API fetch functions
- `services/api/queryClientConfig.ts` - Global query client configuration

**Best Practices:**

1. **Create custom hooks for queries** - Encapsulate query logic in hooks:

```tsx
// hooks/useUserProfile.ts
import { fetchUser } from '@/services/api/fetchUser';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';

export const useUserProfile = () => {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: ['user-profile', user?.token],
    queryFn: () => fetchUser({ token: user!.token }),
    enabled: !!user?.token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

2. **Query Keys** - Use structured, hierarchical keys:

```tsx
// ✅ Good - Hierarchical, specific
queryKey: ['users', userId, 'posts']
queryKey: ['albums', { filter, sort }]

// ❌ Bad - Flat, generic
queryKey: ['userPosts']
queryKey: ['data']
```

3. **Separation of Concerns** - Keep API logic separate from hooks:

```tsx
// services/api/fetchPosts.ts
export const fetchPosts = async (userId: string) => {
  const response = await fetch(`/api/posts?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

// hooks/usePosts.ts
export const usePosts = (userId: string) => {
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
  });
};
```

4. **Mutations** - Use for data modifications:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: Post) => updatePost(post),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Or update cache directly
      queryClient.setQueryData(['posts', variables.id], data);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    },
  });
};
```

5. **Optimistic Updates** - Update UI immediately, rollback on error:

```tsx
useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries({ queryKey: ['posts', newPost.id] });
    const previousPost = queryClient.getQueryData(['posts', newPost.id]);
    queryClient.setQueryData(['posts', newPost.id], newPost);
    return { previousPost };
  },
  onError: (err, newPost, context) => {
    queryClient.setQueryData(['posts', newPost.id], context?.previousPost);
  },
  onSettled: (newPost) => {
    queryClient.invalidateQueries({ queryKey: ['posts', newPost?.id] });
  },
});
```

6. **Don't store server data in Zustand** - Let TanStack Query manage it:

```tsx
// ❌ Bad - Duplicating server state
const useAppStore = create((set) => ({
  posts: [],
  fetchPosts: async () => {
    const posts = await api.getPosts();
    set({ posts });
  },
}));

// ✅ Good - Use TanStack Query
const { data: posts } = useQuery({
  queryKey: ['posts'],
  queryFn: api.getPosts,
});
```

#### Zustand (Client State)

**Use Zustand for:**
- Authentication state (tokens, user session)
- UI state (modals, themes, preferences)
- Transient app state (form drafts, scroll positions)
- Client-only data that doesn't come from the server

**Key Files:**
- `stores/` - Zustand stores, organized by domain
- `stores/{domain}/index.ts` - Store definition
- `stores/{domain}/actions/*.action.ts` - Action creators
- `stores/{domain}/types.ts` - Store types (deprecated - use global `/types/`)

**Store Structure:**

```
stores/
├── user/
│   ├── index.ts              # Store definition
│   ├── actions/
│   │   ├── login.action.ts   # Login action
│   │   ├── logout.action.ts  # Logout action
│   │   └── refresh.action.ts # Token refresh
│   └── types.ts              # Types (prefer /types/ instead)
└── authLoader/
    └── index.ts
```

**Best Practices:**

1. **Use action files for complex logic** - Keep store clean:

```tsx
// stores/user/actions/login.action.ts
import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';

export const getLoginAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['login']
> = (set) => (user: User) => {
  set({ isLoading: true, error: null });
  try {
    set({ user: { ...user, isAuthenticated: true }, isLoading: false });
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Login action failed');
    set({ error: errorObj.message, isLoading: false });
  }
};

// stores/user/index.ts
import { create } from 'zustand';
import { getLoginAction } from './actions/login.action';

export const useUserStore = create<UserStore>()((set, get, store) => ({
  user: null,
  isLoading: false,
  error: null,
  login: getLoginAction(set, get, store),
}));
```

2. **Use middleware for persistence and side effects**:

```tsx
import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { secureStorage } from '@/utils/secure-storage';

export const useUserStore = create<UserStore>()(
  subscribeWithSelector(
    persist(
      (set, get, store) => ({
        // ... store implementation
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ user: state.user }), // Only persist user
        storage: createJSONStorage(() => secureStorage),
      }
    )
  )
);
```

3. **Subscribe to state changes for side effects**:

```tsx
// Side effect subscriptions (outside the store)
useUserStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user?.isAuthenticated) {
      useAuthLoaderStore.getState().setAuthenticated();
    } else {
      useAuthLoaderStore.getState().setUnauthenticated();
    }
  }
);
```

4. **Selector pattern for performance**:

```tsx
// ✅ Good - Subscribe only to what you need
const user = useUserStore((state) => state.user);
const isLoading = useUserStore((state) => state.isLoading);

// ❌ Bad - Rerenders on any state change
const { user, isLoading, error } = useUserStore();
```

5. **Type-safe actions**:

```tsx
// types/user.ts
export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserActions {
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  setUser: (user: User | null) => void;
}

export type UserStore = UserState & UserActions;
```

6. **Access store outside components**:

```tsx
// Get current state
const user = useUserStore.getState().user;

// Call actions
useUserStore.getState().login(userData);

// Subscribe to changes
const unsubscribe = useUserStore.subscribe(
  (state) => state.user,
  (user) => console.log('User changed:', user)
);
```

#### When to Use Which

| Use Case | Solution |
|----------|----------|
| Fetching user posts from API | **TanStack Query** |
| Storing auth token | **Zustand** |
| Caching API responses | **TanStack Query** |
| UI modal open/closed state | **Zustand** |
| Background data refetching | **TanStack Query** |
| Theme preference | **Zustand** |
| Optimistic updates | **TanStack Query** |
| Form draft (not submitted) | **Zustand** or local state |
| Submitted form data | **TanStack Query mutation** |

#### Common Patterns

**Pattern 1: Auth token in Zustand, user data in Query**

```tsx
// Zustand stores auth credentials
const token = useUserStore((state) => state.user?.token);

// TanStack Query fetches user profile
const { data: profile } = useQuery({
  queryKey: ['user-profile', token],
  queryFn: () => fetchUserProfile(token),
  enabled: !!token,
});
```

**Pattern 2: Mutation with Zustand side effects**

```tsx
const updateProfile = useMutation({
  mutationFn: (data: ProfileData) => api.updateProfile(data),
  onSuccess: (newProfile) => {
    // Update Zustand if needed (e.g., update cached token)
    if (newProfile.token) {
      useUserStore.getState().setUser({ 
        ...useUserStore.getState().user, 
        token: newProfile.token 
      });
    }
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  },
});
```

**Pattern 3: Loading states**

```tsx
// Use TanStack Query's built-in loading states
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});

// Don't duplicate in Zustand
// ❌ Bad
const [isLoading, setIsLoading] = useState(false);
```

### Internationalization (i18n)

**Stack**: `expo-localization` + `i18n-js`

The app uses `expo-localization` for device locale detection and `i18n-js` for translation management. The locale system handles:
- Automatic device locale detection
- Language preference persistence
- RTL/LTR direction management
- Type-safe translation keys

**Key Files:**
- `i18n.ts`: Core i18n configuration and helpers
- `contexts/locale-context.tsx`: Unified locale provider with RTL support
- `hooks/useTranslation.ts`: Translation hook (similar to react-i18next API)
- `hooks/useDirection.ts`: Direction hook for RTL layouts
- `translations/`: Translation files organized by language

**Usage:**
```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, i18n, direction } = useTranslation();
  
  return (
    <View style={{ flexDirection: direction === 'rtl' ? 'row-reverse' : 'row' }}>
      <Text>{t('common.hello', { name: 'John' })}</Text>
      <Button onPress={() => i18n.changeLanguage('en')}>
        {t('common.switchLanguage')}
      </Button>
    </View>
  );
}
```

**Adding Translations:**
1. Add translation keys to `/translations/en.ts` and `/translations/he.ts`
2. Use dot-notation for namespacing: `'screen.component.action'`
3. Translations are type-checked - TypeScript will warn about missing keys
4. Support parameter interpolation: `t('greeting', { name: 'John' })`

**RTL Support:**
- Hebrew (`he`) is automatically RTL
- Use `direction` from `useTranslation()` or `useDirection()` for layouts
- React Native's `I18nManager` is configured automatically
- Device locale is detected on app launch and persisted

**Best Practices:**
- Never hardcode user-facing strings
- Use descriptive, namespaced keys: `'photoStack.deleteConfirm.minImagesHeader'`
- Keep translations in sync between languages
- Test RTL layouts when changing UI

### Theming System

**Stack**: Custom theme layer (Ignite-style)

The app uses a comprehensive, type-safe theming system for consistent design across all components. The theme provides standardized values for colors, spacing, typography, shadows, borders, and animation timing.

**Key Files:**
- `constants/theme/index.ts`: Main theme export - import from here
- `constants/theme/colors.ts`: Color palette and semantic colors
- `constants/theme/spacing.ts`: Spacing scale and screen padding
- `constants/theme/typography.ts`: Typography presets, font sizes, weights, families
- `constants/theme/shadows.ts`: Platform-specific shadow presets
- `constants/theme/borders.ts`: Border radius and width values
- `constants/theme/timing.ts`: Animation duration constants

**Usage:**
```tsx
import { theme } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
});
```

**Theme Tokens:**

**Colors:**
- `theme.colors.text` - Primary text color
- `theme.colors.background` - Background color
- `theme.colors.tint` - Primary tint/brand color
- `theme.colors.border` - Border color
- `theme.colors.error`, `theme.colors.success`, `theme.colors.warning`, `theme.colors.info` - Semantic colors
- `theme.colors.palette.*` - Full color palette (100-900 shades for primary, neutral, error, success, warning, info)

**Spacing:**
- `theme.spacing.xs` (8px), `theme.spacing.sm` (12px), `theme.spacing.md` (16px), `theme.spacing.lg` (20px), `theme.spacing.xl` (24px)
- `theme.spacing.xxl` (32px), `theme.spacing.xxxl` (40px), `theme.spacing.huge` (48px), `theme.spacing.massive` (64px)
- `theme.screenPadding.horizontal`, `theme.screenPadding.vertical` - Consistent screen padding

**Typography:**
- Presets: `theme.typography.display`, `theme.typography.h1` through `theme.typography.h5`, `theme.typography.body`, `theme.typography.bodyLarge`, `theme.typography.bodySmall`, `theme.typography.caption`, `theme.typography.label`, `theme.typography.button`
- Individual tokens: `theme.fontSize.*`, `theme.lineHeight.*`, `theme.fontWeight.*`, `theme.fontFamilies.*`

**Shadows:**
- `theme.shadows.sm`, `theme.shadows.md`, `theme.shadows.lg`, `theme.shadows.xl`, `theme.shadows.xxl`
- Platform-specific (elevation on Android, shadow on iOS)

**Borders:**
- Radius: `theme.borderRadius.xs` (2px), `theme.borderRadius.sm` (4px), `theme.borderRadius.md` (8px), `theme.borderRadius.lg` (12px), `theme.borderRadius.xl` (16px), `theme.borderRadius.xxl` (24px), `theme.borderRadius.full` (999px)
- Width: `theme.borderWidth.thin` (1px), `theme.borderWidth.medium` (2px), `theme.borderWidth.thick` (3px)

**Timing:**
- `theme.timing.instant` (100ms), `theme.timing.quick` (200ms), `theme.timing.normal` (300ms), `theme.timing.slow` (500ms), `theme.timing.slower` (800ms)

**Best Practices:**
- **Never hardcode colors, spacing, or font sizes** - Always use theme tokens
- Use semantic colors (`theme.colors.text`) instead of palette colors directly
- Use typography presets (`theme.typography.h1`) for consistent text styling
- Spread typography presets first, then override specific properties if needed
- Use `theme.screenPadding` for consistent screen-level padding
- Apply shadows using spread operator: `...theme.shadows.md`
- All theme tokens are type-safe - TypeScript will autocomplete and validate

**When Implementing New Features:**
1. Import theme: `import { theme } from '@/constants/theme';`
2. Use theme tokens in all StyleSheet definitions
3. Prefer semantic colors over palette colors
4. Use typography presets for all text
5. Ensure consistency with existing components

### Architecture

<fill>

### Directory Structure

```
/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, signup)
│   ├── (tabs)/            # Tab navigation
│   └── _layout.tsx        # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── hooks/                  # TanStack Query hooks + utility hooks
├── services/               # API client
├── stores/                 # Zustand stores
├── utils/                  # Utility functions
├── types/                  # TypeScript types
├── constants/              # App constants (theme, config)
└── assets/                 # Images, fonts
```

## Conventions

**Naming**: Use kebab-case for file and folder names (e.g., `user-profile.tsx`, `api-client.ts`).

## TypeScript

**Type Placement**: Types must be organized and placed in the correct location:
- **Global types**: Export from `/types/` directory
- **Feature-specific types**: Export from feature's local types file or co-located with feature code
- **Component types**: Export from the component file if reusable, otherwise keep internal

**All types must be exported** to enable reuse and maintain type safety across the codebase. Do not use inline anonymous types for shared data structures.
