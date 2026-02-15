# <Your App Name>

A React Native <Describe your App>...

### Technology Stack
- **Framework**: React Native v0.81, Expo SDK 54
- **Language**: TypeScript
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Navigation**: Expo Router v6.0
- **Platforms**: iOS, Android

## Dependencies

**Prefer Expo libraries** over community packages when available. Expo packages are better maintained, offer consistent APIs across platforms, and integrate seamlessly with the Expo ecosystem.

**All solutions must be grounded in dependency documentation.** Before implementing features or suggesting solutions, verify APIs, configurations, and patterns against the official docs for each library being used. Do not rely on outdated examples or deprecated patterns.

## React Compiler

React Compiler is installed and handles optimization automatically. **Do not use `React.memo`, `useMemo`, or `useCallback`** unless your analysis reveals a specific issue the compiler cannot handle.

## Architecture

### State Management

- **TanStack Query**: All server state (API data, caching, synchronization). This is the source of truth for any data from the API.
- **Zustand**: Client-only state (auth tokens, UI preferences, transient app state). Do not duplicate server data in Zustand stores.

### Online-First Architecture

Auth0 → API Client (singleton) → Custom Hooks (TanStack Query) → Components

- All data fetched from API, no offline persistence
- TanStack Query for caching (5min staleTime) and request deduplication
- Components consume hooks, never call API Client directly

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
