# Hooks Documentation

This directory contains all React hooks for the Lupa application. Hooks are organized by feature domain and use TanStack Query for server state management.

## Table of Contents

- [Core Hooks](#core-hooks)
- [Album Management](#album-management)
- [Editor Hooks](#editor-hooks)
- [Friends & Sharing](#friends--sharing)
- [Utility Hooks](#utility-hooks)

---

## Core Hooks

### `useAcceptScreen()`

Fetches and manages the accept screen data.

**Parameters:** None

**Returns:**
- `data` - Accept screen data
- `isLoading` - Loading state
- `error` - Error state
- Standard TanStack Query return values

**Example:**
```tsx
const { data, isLoading, error } = useAcceptScreen();
```

---

### `useTranslationData()`

Gets the current language from i18n.

**Parameters:** None

**Returns:**
- `language: string` - Current language code (e.g., 'en', 'he')

**Example:**
```tsx
const { language } = useTranslationData();
```

---

### `useTokenRefresh()`

Automatically refreshes user authentication token at regular intervals.

**Parameters:** None

**Returns:** `void`

**Usage:** Call once at app root level
```tsx
useTokenRefresh();
```

---

## Album Management

### `useUserAlbums()`

Fetches all albums for the current user.

**Parameters:** None

**Returns:**
- `data: Album[]` - Array of user's albums
- Standard TanStack Query return values

**Example:**
```tsx
const { data: albums, isLoading } = useUserAlbums();
```

---

### `useAlbumsByEventToken(options)`

Fetches a specific album by its event token with optional polling.

**Parameters:**
- `eventToken: string` (required) - Album event token
- `enablePolling?: boolean` (default: `false`) - Enable automatic refetching
- `pollingInterval?: number` (default: `5000`) - Polling interval in ms
- `shouldFetch: boolean` (required) - Whether to enable the query

**Returns:**
- `data` - Album data
- Standard TanStack Query return values

**Example:**
```tsx
const { data: album } = useAlbumsByEventToken({
  eventToken: 'abc123',
  enablePolling: true,
  pollingInterval: 3000,
  shouldFetch: true,
});
```

---

### `useAlbumTree({ eventToken })`

Fetches the album tree structure (layouts and pages).

**Parameters:**
- `eventToken: string` (required) - Album event token

**Returns:**
- Standard TanStack Query return values with album tree data

**Example:**
```tsx
const { data: tree, isLoading } = useAlbumTree({ eventToken: 'abc123' });
```

---

### `useAlbumProgress({ event_token, pollingInterval, enabled })`

Polls album processing progress.

**Parameters:**
- `event_token: string` (required) - Album event token
- `pollingInterval?: number` (default: `50000`) - Polling interval in ms
- `enabled?: boolean` (default: `true`) - Enable/disable polling

**Returns:**
- `data.payload.progress_status: string` - Progress status
- Standard TanStack Query return values

**Example:**
```tsx
const { data } = useAlbumProgress({
  event_token: 'abc123',
  pollingInterval: 10000,
  enabled: true,
});
```

---

### `useAlbumPrice()`

Calculates album pricing based on format, pages, and custom settings.

**Parameters:** None (reads from album stores)

**Returns:**
- `price: number | null` - Calculated price
- `isLoading: boolean` - Loading state
- `error` - Error state

**Example:**
```tsx
const { price, isLoading } = useAlbumPrice();
```

---

### `useAlbumName(initialValue)`

Manages album name input with validation.

**Parameters:**
- `initialValue?: string` (default: `''`) - Initial album name

**Returns:**
- `albumName: string` - Current album name
- `setAlbumName: (name: string) => void` - Set album name
- `getInputError: () => string | undefined` - Get validation error
- `isValid: boolean` - Whether name is valid

**Example:**
```tsx
const { albumName, setAlbumName, isValid, getInputError } = useAlbumName('My Album');
```

---

### `useCreateAlbum()`

Mutation hook to create or update an album.

**Parameters:** None

**Returns:**
- `mutate: (params: CreateAlbumParams) => void` - Trigger mutation
- Standard TanStack Query mutation return values

**CreateAlbumParams:**
- `albumName: string` (required)
- `eventType: string` (required)
- `flipbookNew: boolean` (required)
- `appVersion: string` (required)
- `deviceType: string` (required)
- `albumToken?: string` - For updates
- `isOnEditor?: boolean` - Context flag

**Example:**
```tsx
const { mutate: createAlbum, isPending } = useCreateAlbum();

createAlbum({
  albumName: 'Summer 2024',
  eventType: 'REGULAR',
  flipbookNew: true,
  appVersion: '3.5.27',
  deviceType: 'mobile',
});
```

---

### `useDuplicateAlbum(options)`

Duplicates an existing album.

**Parameters:**
- `onSuccessCallback?: (newAlbum: Album) => void`
- `onErrorCallback?: (errorMessage: string, errorCode?: number) => void`

**Returns:**
- `mutate: (params: { eventToken: string }) => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: duplicate } = useDuplicateAlbum({
  onSuccessCallback: (newAlbum) => {
    console.log('Duplicated:', newAlbum.name);
  },
});

duplicate({ eventToken: 'abc123' });
```

---

### `useRenameAlbum()`

Opens modal to rename an album.

**Parameters:** None

**Returns:**
- Modal management functions

**Example:**
```tsx
const renameAlbum = useRenameAlbum();
```

---

### `useCloseAlbum()`

Closes/finalizes an album for production.

**Parameters:** None

**Returns:**
- `mutate: (params: CloseAlbumParams) => void`
- Standard TanStack Query mutation return values

**CloseAlbumParams:**
- `eventToken: string`
- `lang: string`
- `format: string`
- `density: string`
- `direction: string`
- `album_theme: string`
- `is_cover_edited: boolean`
- `flipbook_new: boolean`

**Example:**
```tsx
const { mutate: closeAlbum } = useCloseAlbum();

closeAlbum({
  eventToken: 'abc123',
  lang: 'en',
  format: 'square_big',
  density: 'normal',
  direction: 'ltr',
  album_theme: 'theme_1',
  is_cover_edited: false,
  flipbook_new: true,
});
```

---

### `useCloseAlbumCovers({ eventToken, setCovers })`

Fetches and sets album cover data.

**Parameters:**
- `eventToken: string` (required)
- `setCovers: (album: PhotoAlbum) => void` (required)

**Returns:**
- Standard TanStack Query return values

**Example:**
```tsx
const { isLoading } = useCloseAlbumCovers({
  eventToken: 'abc123',
  setCovers: (album) => console.log(album),
});
```

---

### `useUpdateTree()`

Updates the album tree structure.

**Parameters:** None

**Returns:**
- `mutate: (params: UpdateTreeParams) => void`
- Standard TanStack Query mutation return values

**UpdateTreeParams:**
- `eventToken: string` (required)
- `tree: TreeV5 | null` (required)
- `deleteIds?: number[]`
- `force?: 'false' | 'true'`
- `invalidateAlbumCacheOnError?: boolean`

**Example:**
```tsx
const { mutate: updateTree } = useUpdateTree();

updateTree({
  eventToken: 'abc123',
  tree: albumTreeData,
  deleteIds: [1, 2, 3],
});
```

---

### `useTreeUpdateChecker({ eventToken, enabled, intervalMs })`

Monitors for external album tree changes and updates.

**Parameters:**
- `eventToken?: string`
- `enabled?: boolean` (default: `true`)
- `intervalMs?: number` (default: `30000`)

**Returns:**
- Standard TanStack Query return values
- `refetch: () => void` - Manual refetch

**Example:**
```tsx
const { data } = useTreeUpdateChecker({
  eventToken: 'abc123',
  enabled: true,
  intervalMs: 30000,
});
```

---

## Images & Media

### `useDeleteImage({ eventToken })`

Deletes an image from the album with optimistic updates.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `mutate: (params: { image_name: string; uniqueId: number }) => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: deleteImage } = useDeleteImage({ eventToken: 'abc123' });

deleteImage({ image_name: 'photo_001.jpg', uniqueId: 123 });
```

---

### `useRemoveImagesFromCache(eventToken)`

Utility to remove images from cache without API call.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `removeImagesFromCache: (imageIds: number[]) => void`

**Example:**
```tsx
const { removeImagesFromCache } = useRemoveImagesFromCache('abc123');
removeImagesFromCache([1, 2, 3]);
```

---

### `useCarousel()`

Fetches carousel data for the home screen.

**Parameters:** None

**Returns:**
- `data: CarouselResponse` - Carousel data
- Standard TanStack Query return values

**Example:**
```tsx
const { data: carousel, isLoading } = useCarousel();
```

---

## Themes & Formats

### `useThemes()`

Fetches available album themes based on album format and settings.

**Parameters:** None (reads from album store)

**Returns:**
- `data: Themes` - Available themes
- Standard TanStack Query return values

**Example:**
```tsx
const { data: themes, isLoading } = useThemes();
```

---

### `useEditTheme()`

Changes the album theme.

**Parameters:** None

**Returns:**
- `mutate: (params: EditThemeParams) => void`
- Standard TanStack Query mutation return values

**EditThemeParams:**
- `eventToken: string` (required)
- `album_theme: string` (required)
- `tree: PhotoAlbum | null` (required)

**Example:**
```tsx
const { mutate: editTheme } = useEditTheme();

editTheme({
  eventToken: 'abc123',
  album_theme: 'theme_modern',
  tree: albumTree,
});
```

---

### `useGetFormats({ eventToken, lang })`

Fetches available book formats.

**Parameters:**
- `eventToken: string` (required)
- `lang: string` (required)

**Returns:**
- Standard TanStack Query return values with formats data

**Example:**
```tsx
const { data: formats } = useGetFormats({
  eventToken: 'abc123',
  lang: 'en',
});
```

---

### `useLayoutFamily(pageId, layoutId)`

Gets layout family type for a page or layout.

**Parameters:**
- `pageId?: number` - Page ID (alternative to layoutId)
- `layoutId?: number` - Layout ID (alternative to pageId)

**Returns:**
- `LayoutFamilyType | null` - Layout family type

**Example:**
```tsx
const layoutFamily = useLayoutFamily(pageId);
```

---

## Epilog/Prolog

### `useGetEpilogProlog({ eventToken, lang, isEpilog, enabled })`

Fetches epilog or prolog content.

**Parameters:**
- `eventToken: string` (required)
- `lang: string` (required)
- `isEpilog: boolean` (required) - true for epilog, false for prolog
- `enabled?: boolean` (default: `true`)

**Returns:**
- Standard TanStack Query return values with epilog/prolog data

**Example:**
```tsx
const { data: epilog } = useGetEpilogProlog({
  eventToken: 'abc123',
  lang: 'en',
  isEpilog: true,
});
```

---

### `useCreateEpilogPrologMutation()`

Creates or updates epilog/prolog content.

**Parameters:** None

**Returns:**
- `mutate: (params: CreateEpilogPrologParams) => void`
- Standard TanStack Query mutation return values

**CreateEpilogPrologParams:**
- `eventToken: string` (required)
- `lang: string` (required)
- `isEpilog: boolean` (required)
- `data?: FormTextData`

**Example:**
```tsx
const { mutate: createEpilog } = useCreateEpilogPrologMutation();

createEpilog({
  eventToken: 'abc123',
  lang: 'en',
  isEpilog: true,
  data: { text: 'The End' },
});
```

---

### `useDeleteEpilogPrologMutation({ eventToken })`

Deletes epilog or prolog.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `mutate: (params: { isEpilog: boolean }) => void`
- `deletingType: boolean | null` - Current deletion type
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: deleteEpilog, deletingType } = useDeleteEpilogPrologMutation({
  eventToken: 'abc123',
});

deleteEpilog({ isEpilog: true });
```

---

### `useEpilogPrologPreviewMutation()`

Generates preview for epilog/prolog.

**Parameters:** None

**Returns:**
- `mutate: (params: EpilogPrologPreviewParams) => void`
- Standard TanStack Query mutation return values

**EpilogPrologPreviewParams:**
- `eventToken: string` (required)
- `lang: string` (required)
- `isEpilog: boolean` (required)
- `data?: FormTextData`

**Example:**
```tsx
const { mutate: preview } = useEpilogPrologPreviewMutation();

preview({
  eventToken: 'abc123',
  lang: 'en',
  isEpilog: false,
  data: { text: 'Once upon a time...' },
});
```

---

## Editor Hooks

### `useEditorPage()`

Main hook for editor page functionality including drag & drop.

**Parameters:** None

**Returns:**
- `album: PhotoAlbum | null` - Current album
- `dragType` - Current drag type
- `handleDragStart` - Drag start handler
- `handleDragEnd` - Drag end handler
- `handleDragOver` - Drag over handler
- `handleDragCancel` - Drag cancel handler
- `currentPageIndex: number` - Current page index
- `currentPageInFolder: number` - Current page in folder
- Many more editor-specific utilities

**Example:**
```tsx
const {
  album,
  handleDragStart,
  handleDragEnd,
  currentPageIndex,
} = useEditorPage();
```

---

### `useAutoSave()`

Automatically saves album changes at regular intervals.

**Parameters:** None

**Returns:** `void`

**Usage:** Call once in editor component
```tsx
useAutoSave();
```

---

### `useEditorSnapshot()`

Generates and manages page snapshots for preview/basket.

**Parameters:** None

**Returns:**
- `getSnapshotImages: () => Promise<SnapshotImage[]>` - Generate snapshots
- Helper functions for snapshot management

**Example:**
```tsx
const { getSnapshotImages } = useEditorSnapshot();
const snapshots = await getSnapshotImages();
```

---

### `useAddToBasket(options)`

Adds album to basket with snapshot generation.

**Parameters:**
- `onSuccess?: () => void` - Success callback

**Returns:**
- `processAddToBasket: () => Promise<void>` - Add to basket
- `processingAddToBasket: 'loading' | 'success' | 'error' | null` - Status
- `loadingProgress: number` - Progress percentage (0-100)

**Example:**
```tsx
const { processAddToBasket, processingAddToBasket, loadingProgress } = useAddToBasket({
  onSuccess: () => console.log('Added to basket!'),
});

await processAddToBasket();
```

---

### `useDeleteImages(props)`

Manages bulk image deletion in editor.

**Parameters:**
- `setSelectedImages: React.Dispatch<SetStateAction<ImageToDelete[]>>`
- `setViewDeletionBar: (show: boolean) => void`
- `deleteImage: (params: { image_name: string; uniqueId: number }) => void`
- `removeImageById: (ids: number[]) => void`
- `removeImagesFromCache: (imageIds: number[]) => void`
- `updateTree: (params) => void`
- `isOpenBook: boolean`

**Returns:**
- `deleteImagesInOpenBook: (selectedImages: ImageToDelete[]) => void`
- `deleteImagesInClosedBook: (selectedImages: ImageToDelete[]) => void`

**Example:**
```tsx
const { deleteImagesInOpenBook } = useDeleteImages({
  setSelectedImages,
  setViewDeletionBar,
  deleteImage,
  removeImageById,
  removeImagesFromCache,
  updateTree,
  isOpenBook: true,
});
```

---

### `useLayoutProcessing(layout, images, eventToken, maxPageHeight, pageWidth, album, options)`

Processes layout data for rendering with backgrounds, drop zones, etc.

**Parameters:**
- `layout: Folder` (required)
- `images: Image[]` (required)
- `eventToken: string` (required)
- `maxPageHeight: number` (required)
- `pageWidth: number` (required)
- `album: PhotoAlbum | null` (required)
- `options: LayoutOptions` (required)
  - `isCover: boolean`
  - `isSideBar: boolean`
  - `isSingleCoverPage?: boolean`

**Returns:**
- Processed layout data with backgrounds, drop zones, dimensions

**Example:**
```tsx
const processedLayout = useLayoutProcessing(
  layout,
  images,
  eventToken,
  800,
  600,
  album,
  { isCover: false, isSideBar: false }
);
```

---

### `usePageImageCount()`

Gets image count for a specific page.

**Parameters:** None

**Returns:**
- `getPageImageCount: (pageId: number) => number`

**Example:**
```tsx
const { getPageImageCount } = usePageImageCount();
const count = getPageImageCount(42);
```

---

## Friends & Sharing

### Admin Hooks (Album Owner)

#### `useFriendList(eventToken, enabled)`

Fetches list of friends/collaborators for an album.

**Parameters:**
- `eventToken: string` (required)
- `enabled?: boolean` (default: `true`)

**Returns:**
- `data: FriendListResponse` - Friends list
- Standard TanStack Query return values

**Example:**
```tsx
const { data: friendList } = useFriendList('abc123');
```

---

#### `useFriendInvite(eventToken, linkType, enabled)`

Gets invite link for sharing album.

**Parameters:**
- `eventToken: string` (required)
- `linkType?: InviteType` (default: `'PUBLIC'`) - PUBLIC or PRIVATE
- `enabled?: boolean` (default: `true`)

**Returns:**
- `data: FriendInviteResponse` - Invite link data
- Standard TanStack Query return values

**Example:**
```tsx
const { data: inviteLink } = useFriendInvite('abc123', 'PUBLIC');
```

---

#### `useChangeFriendInviteType(eventToken)`

Changes invite link type between PUBLIC/PRIVATE.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `mutate: (newLinkType: InviteType) => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: changeType } = useChangeFriendInviteType('abc123');
changeType('PRIVATE');
```

---

#### `useApproveFriend(eventToken)`

Approves a friend request.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `mutate: (nickname: string) => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: approve } = useApproveFriend('abc123');
approve('john_doe');
```

---

#### `useDeleteFriend(eventToken)`

Removes a friend/collaborator.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `mutate: (nickname: string) => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: remove } = useDeleteFriend('abc123');
remove('john_doe');
```

---

#### `useDestroyInvite(eventToken)`

Destroys/invalidates an invite link.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `mutate: () => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: destroyLink } = useDestroyInvite('abc123');
destroyLink();
```

---

#### `useFriendsModal({ eventToken })`

Opens the friends management modal.

**Parameters:**
- `eventToken: string` (required)

**Returns:**
- `handleOpenModal: (event?: React.MouseEvent) => void`

**Example:**
```tsx
const { handleOpenModal } = useFriendsModal({ eventToken: 'abc123' });
```

---

### Receiver Hooks (Friend Joining)

#### `useFriendShareInfo(sharedToken)`

Fetches information about a shared album.

**Parameters:**
- `sharedToken: string | null` (required)

**Returns:**
- `data: FriendShareInfoResponse` - Shared album info
- Standard TanStack Query return values

**Example:**
```tsx
const { data: shareInfo } = useFriendShareInfo(sharedToken);
```

---

#### `useFriendRequest(onSuccess)`

Approves a friend request to join album.

**Parameters:**
- `onSuccess?: (data: FriendRequestResponse) => void`

**Returns:**
- `mutate: (sharedToken: string) => void`
- Standard TanStack Query mutation return values

**Example:**
```tsx
const { mutate: approve } = useFriendRequest((data) => {
  console.log('Approved!', data);
});

approve(sharedToken);
```

---

#### `useSharedToken()`

Manages the entire shared token flow from URL.

**Parameters:** None

**Returns:**
- `sharedToken: string | null` - Token from URL
- `shareInfo` - Share information
- `isLoading: boolean` - Loading state
- `handleConnect: () => void` - Connect to album
- Modal management functions

**Example:**
```tsx
const { sharedToken, shareInfo, handleConnect } = useSharedToken();
```

---

#### `useFriendReceiverModal(props)`

Opens modal for friend to view and accept invite.

**Parameters:**
- `shareInfo: FriendShareInfo | null` (required)
- `isLoading: boolean` (required)
- `onConnect: () => void` (required)
- `onClose?: () => void`

**Returns:**
- `openModal: () => void`
- `closeModal: () => void`

**Example:**
```tsx
const { openModal } = useFriendReceiverModal({
  shareInfo,
  isLoading: false,
  onConnect: handleConnect,
});
```

---

#### `useFriendSuccessModal()`

Opens success modal after joining album.

**Parameters:** None

**Returns:**
- `openSuccessModal: (shareInfo: FriendShareInfo) => void`
- `closeModal: () => void`

**Example:**
```tsx
const { openSuccessModal } = useFriendSuccessModal();
openSuccessModal(shareInfo);
```

---

## Help & License

### `useHelpContent()`

Fetches help documentation and support content.

**Parameters:** None

**Returns:**
- `data: HelpContent` - Help content including articles and videos
- Standard TanStack Query return values

**Example:**
```tsx
const { data: helpContent } = useHelpContent();
```

---

### `useLicenseApproval()`

Manages license/terms approval flow.

**Parameters:** None

**Returns:**
- `needsApproval: boolean` - Whether user needs to approve
- `showRegulationsDialog: boolean` - Dialog visibility state
- `setShowRegulationsDialog: (show: boolean) => void`
- `handleRegulationsConfirm: () => void` - Approve handler
- `licenseData: LicenseResponse` - License data

**Example:**
```tsx
const {
  needsApproval,
  showRegulationsDialog,
  setShowRegulationsDialog,
  handleRegulationsConfirm,
} = useLicenseApproval();

if (needsApproval) {
  setShowRegulationsDialog(true);
}
```

---

## Upload & Processing

### `useUploadSnapshotsComplete({ eventToken, orderId, uploadStatus, enabled })`

Checks if snapshot upload is complete.

**Parameters:**
- `eventToken: string` (required)
- `orderId: string` (required)
- `uploadStatus: string` (required)
- `enabled: boolean` (required)

**Returns:**
- Standard TanStack Query return values

**Example:**
```tsx
const { data } = useUploadSnapshotsComplete({
  eventToken: 'abc123',
  orderId: 'order_456',
  uploadStatus: 'uploading',
  enabled: true,
});
```

---

### `useProcessingProgress()`

Tracks file upload/processing progress.

**Parameters:** None

**Returns:**
- `processingTotal: number` - Total files to process
- `processingDone: number` - Files processed
- `processingPercent: number` - Progress percentage (0-100)
- `isProcessingActive: boolean` - Whether processing is active

**Example:**
```tsx
const {
  processingTotal,
  processingDone,
  processingPercent,
  isProcessingActive,
} = useProcessingProgress();
```

---

## Wizard & Onboarding

### `useWizardData()`

Manages wizard (format selection) data.

**Parameters:** None

**Returns:**
- `data` - Wizard data
- `isLoading: boolean` - Loading state
- `error` - Error state

**Example:**
```tsx
const { data: wizardData, isLoading } = useWizardData();
```

---

### `useWizardSteps()`

Generates wizard step configuration based on album settings. Returns only uncompleted steps.

**Parameters:** None

**Returns:**
- `WizardStepConfig[]` - Array of step configurations
  - `id: WizardStepId` - Step identifier ('formats', 'densities', 'directions', 'bookCoverType', 'themes')
  - `label: string` - Translated step label
  - `canGoBack: boolean` - Whether user can navigate back from this step
  - `mode?: string` - Additional mode data (e.g., for themes step)

**Example:**
```tsx
const steps = useWizardSteps();
// Returns: [
//   { id: 'formats', label: 'Choose Format', canGoBack: false },
//   { id: 'densities', label: 'Choose Density', canGoBack: true },
//   // ... only uncompleted steps
// ]

// Render based on step IDs
{steps.map(step => {
  switch(step.id) {
    case 'formats': 
      return <FormatsScreen key={step.id} canGoBack={step.canGoBack} />;
    case 'densities': 
      return <DensitiesScreen key={step.id} canGoBack={step.canGoBack} />;
    // ...
  }
})}
```

**Note:** This hook also syncs existing album settings to the album store on mount.

---

## Utility Hooks

### `useDebounce(value, delay)`

Debounces a value.

**Parameters:**
- `value: T` (required) - Value to debounce
- `delay: number` (required) - Delay in milliseconds

**Returns:**
- `T` - Debounced value

**Example:**
```tsx
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

---

### `useDebouncedCallback(func, wait)`

Debounces a callback function.

**Parameters:**
- `func: (...args: Args) => void` (required) - Function to debounce
- `wait: number` (required) - Wait period in milliseconds

**Returns:**
- `(...args: Args) => void` - Debounced function

**Example:**
```tsx
const debouncedSave = useDebouncedCallback((value: string) => {
  saveToServer(value);
}, 1000);
```

---

### `useSaveLock()`

Provides mechanism to wait for auto-save lock.

**Parameters:** None

**Returns:**
- `waitForSaveLock: () => Promise<void>` - Wait for lock to release

**Example:**
```tsx
const { waitForSaveLock } = useSaveLock();
await waitForSaveLock();
// Proceed with operation
```

---

### `useReportBI()`

Reports business intelligence events.

**Parameters:** None

**Returns:** `void`

**Example:**
```tsx
useReportBI();
```

---

## Hook Patterns

### TanStack Query Patterns

All data-fetching hooks use TanStack Query and return:
```tsx
{
  data: T | undefined,
  isLoading: boolean,
  isFetching: boolean,
  isError: boolean,
  error: Error | null,
  refetch: () => void,
  // ... other TanStack Query properties
}
```

### Mutation Patterns

All mutation hooks return:
```tsx
{
  mutate: (params: TParams) => void,
  mutateAsync: (params: TParams) => Promise<TData>,
  isPending: boolean,
  isSuccess: boolean,
  isError: boolean,
  error: Error | null,
  data: TData | undefined,
  reset: () => void,
}
```

---

## Best Practices

1. **Always check loading states:**
   ```tsx
   const { data, isLoading } = useUserAlbums();
   if (isLoading) return <Spinner />;
   ```

2. **Handle errors gracefully:**
   ```tsx
   const { error } = useAlbumTree({ eventToken });
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Use enabled flag for conditional fetching:**
   ```tsx
   const { data } = useAlbumsByEventToken({
     eventToken,
     shouldFetch: !!eventToken, // Only fetch when token exists
   });
   ```

4. **Leverage callbacks for side effects:**
   ```tsx
   const { mutate } = useDuplicateAlbum({
     onSuccessCallback: (album) => navigate(`/album/${album.event_token}`),
   });
   ```

5. **Always pass required parameters:**
   ```tsx
   // ❌ Don't
   const { data } = useAlbumTree({});
   
   // ✅ Do
   const { data } = useAlbumTree({ eventToken: 'abc123' });
   ```

---

## State Management Integration

These hooks integrate with Zustand stores:
- `useUserStore` - User authentication
- `useAlbumStore` - Current album data
- `useAlbumTreeStore` - Album tree structure
- `useModalStore` - Modal management
- `useAlertDialogStore` - Alert dialogs

Hooks read from and update these stores automatically.

---

## Testing Hooks

Example test pattern:
```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserAlbums } from './useUserAlbums';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('fetches user albums', async () => {
  const { result } = renderHook(() => useUserAlbums(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

---

## Contributing

When adding new hooks:

1. **Location:** Place in appropriate subdirectory (`/editor`, `/friends`, or root)
2. **Naming:** Use descriptive names starting with `use`
3. **TypeScript:** Fully type parameters and return values
4. **Documentation:** Update this README with:
   - Hook signature
   - Parameters with types and defaults
   - Return values
   - Usage example
5. **Testing:** Add unit tests for business logic

---

## Migration Notes

### React Native Considerations

Some hooks reference web-specific features that need React Native equivalents:

- **Navigation:** Replace `useNavigate`/`useSearchParams` with React Navigation hooks
- **Modal Components:** Replace web modal components with RN equivalents
- **DOM Operations:** Replace `dom-to-image` in `useEditorSnapshot` with RN screenshot libraries

---

## Related Documentation

- [Store Documentation](/stores/README.md)
- [API Services Documentation](/services/api/README.md)
- [Type Definitions](/types/README.md)
