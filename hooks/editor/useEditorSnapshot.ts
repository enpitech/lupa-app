import domtoimage from 'dom-to-image-more';
import useAlbumTreeStore from '@/stores/albumTree';
import { uploadSnapshot } from '@/services/api/uploadSnapshot';
import { trackError } from '@/utils/datadogErrorTracking';

// Type definition for snapshot images
export interface SnapshotImage {
  url: string;
  fileName: string;
  pageIndex: number;
  timestamp: number;
}

// Global storage for generated snapshots
let generatedSnapshots: SnapshotImage[] = [];

// Helper functions for snapshot management
export const storeSnapshot = (snapshot: SnapshotImage) => {
  generatedSnapshots.push(snapshot);
};

export const getGeneratedSnapshots = (): SnapshotImage[] => {
  return [...generatedSnapshots];
};

export const clearGeneratedSnapshots = () => {
  // Clean up blob URLs to prevent memory leaks
  generatedSnapshots.forEach((snapshot) => {
    if (snapshot.url.startsWith('blob:')) {
      URL.revokeObjectURL(snapshot.url);
    }
  });
  generatedSnapshots = [];
};

const imageToFile = async (image: string, name: string) => {
  const imageBlob = await fetch(image).then((res) => res.blob());
  const imageFile = new File([imageBlob], name, { type: 'image/jpg' });
  return imageFile;
};

const getImageName = (pageIndex: number) => {
  if (pageIndex === -1) return 'thumb_cover.jpg';
  const leftPageNumber = (pageIndex * 2).toString().padStart(3, '0');
  const rightPageNumber = (pageIndex * 2 + 1).toString().padStart(3, '0');
  return `thumb_${leftPageNumber}_${rightPageNumber}.jpg`;
};

const validateImagesLoaded = () => {
  const renderedPageLayout = document.querySelector(SNAPSHOT_SELECTOR);
  if (!renderedPageLayout) return false;

  // Check for loading indicators
  const loadingImages = renderedPageLayout.querySelectorAll(
    '[data-indicator="image-loading"]'
  );

  // Check for images that haven't loaded yet
  const allImages = renderedPageLayout.querySelectorAll('img[src]');
  const unloadedImages = Array.from(allImages).filter((img) => {
    const htmlImg = img as HTMLImageElement;
    return !htmlImg.complete || htmlImg.naturalHeight === 0;
  });

  return loadingImages.length === 0 && unloadedImages.length === 0;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clickOpenFullCoverEditor = async () => {
  const coverToggle = document.getElementById('cover-view-toggle');
  if (coverToggle) {
    coverToggle.click();
    // Small delay to allow the UI to update
    await delay(100);
  }
};
// resource pre-loading
const preloadImagesInPage = async () => {
  try {
    // Find all images in the current page that haven't loaded yet
    const pageElement = document.querySelector(SNAPSHOT_SELECTOR);
    if (pageElement) {
      const images = pageElement.querySelectorAll(
        'img[src]:not([data-preloaded])'
      );
      const loadPromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          if ((img as HTMLImageElement).complete) {
            resolve();
          } else {
            const onLoad = () => {
              (img as HTMLImageElement).setAttribute('data-preloaded', 'true');
              resolve();
            };
            const onError = () => resolve(); // Don't fail on individual errors

            img.addEventListener('load', onLoad, { once: true });
            img.addEventListener('error', onError, { once: true });
          }
        });
      });

      await Promise.allSettled(loadPromises);
    }
  } catch (error) {
    console.warn('Image pre-loading failed:', error);
  }
};

const SNAPSHOT_SELECTOR = '[data-indicator="rendered-page-layout"]';

const waitForImagesLoaded = async () => {
  const MAX_WAIT_TIME = 2500;
  const imageLoadPromise = new Promise<boolean>((resolve) => {
    let i = 0;
    const MAX_ITERATIONS = 500;
    const CHECK_INTERVAL = 20;

    const checkImages = () => {
      if (i >= MAX_ITERATIONS) {
        resolve(false);
        return;
      }

      delay(CHECK_INTERVAL).then(() => {
        if (validateImagesLoaded()) {
          resolve(true);
        } else {
          i++;
          checkImages();
        }
      });
    };
    checkImages();
  });
  // break out if it takes too long
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.warn(`Image loading timeout after ${MAX_WAIT_TIME}ms`);
      resolve(false);
    }, MAX_WAIT_TIME);
  });

  return Promise.race([imageLoadPromise, timeoutPromise]);
};

const waitForRenderedPage = async (pageIndex: number) => {
  const maxWaitMs = 2000;
  const checkInterval = 50;
  const targetTestId =
    pageIndex === -1
      ? 'editor-album-page-cover'
      : `editor-album-page-${pageIndex}`;

  const startedAt = Date.now();
  while (Date.now() - startedAt < maxWaitMs) {
    const element = document.querySelector(
      `[data-testid="${targetTestId}"]`
    );
    if (element) {
      return element as HTMLElement;
    }
    await delay(checkInterval);
  }

  console.warn(
    `[DEV] waitForRenderedPage timeout for ${targetTestId}, proceeding with current layout`
  );
  return null;
};

const capturePageSnapshot = async () => {
  const renderedPageLayout = document.querySelector(SNAPSHOT_SELECTOR);
  await waitForImagesLoaded();

  if (!renderedPageLayout) {
    throw new Error('Rendered page layout not found');
  }
  const image = await domtoimage.toJpeg(renderedPageLayout, {
    quality: 0.4,
    copyDefaultStyles: false,
    bgcolor: 'white',
    cacheBust: false,
    // Use onclone to safely modify the cloned DOM without affecting live UI
    onclone: (clonedDoc: Document) => {
      const elements = clonedDoc.querySelectorAll('*');
      elements.forEach((element) => {
        if (element.nodeType === Node.ELEMENT_NODE) {
          const htmlElement = element as HTMLElement;

          // Apply font to text-containing elements
          if (htmlElement.textContent && htmlElement.textContent.trim()) {
            htmlElement.style.fontFamily =
              'LUPASANS-REGULAR, "Open Sans", Arial, sans-serif';
          }

          if (
            ['P', 'SPAN', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(
              htmlElement.tagName
            )
          ) {
            htmlElement.style.fontFamily =
              'LUPASANS-REGULAR, "Open Sans", Arial, sans-serif';
          }
        }
      });
    },
    filter: (node: HTMLElement) => {
      return node?.dataset?.indicator !== 'page-numbers';
    },
  });
  return image;
};

const capturePageWithRetry = async (pageIndex: number, maxAttempts = 3) => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Ensure the target page is rendered before snapshot
      await waitForRenderedPage(pageIndex);
      await preloadImagesInPage();
      return await capturePageSnapshot();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await delay(150);
      }
    }
  }
  throw lastError;
};

export const useEditorSnapshot = () => {
  // fix progress bar animation updates with batching
  const createSmoothProgress = (setProgress: (value: number) => void) => {
    let currentProgress = 0;
    let targetProgress = 0;
    let animationId: number | null = null;

    const updateProgress = () => {
      if (Math.abs(targetProgress - currentProgress) < 0.1) {
        currentProgress = targetProgress;
        setProgress(currentProgress);
        animationId = null;
        return;
      }

      // apply smooth animation 0.3 factor will slow down as it approaches target
      currentProgress += (targetProgress - currentProgress) * 0.3;
      setProgress(currentProgress);
      animationId = requestAnimationFrame(updateProgress);
    };

    return (newProgress: number) => {
      targetProgress = newProgress;
      if (!animationId) {
        animationId = requestAnimationFrame(updateProgress);
      }
    };
  };

  const getSnapshotImages = async (
    setProgress: (value: number) => void,
    uploadOptions?: {
      orderId: string;
      eventToken: string;
      totalSnapshots: number;
      onUploadProgress?: (uploadedCount: number) => void;
    }
  ) => {
    // Clear any previous snapshots
    clearGeneratedSnapshots();

    // Create smooth progress updater
    const smoothProgress = createSmoothProgress(setProgress);

    // Initial progress
    const currentPageIndex = useAlbumTreeStore.getState().currentPageIndex;
    const setCurrentPageIndex =
      useAlbumTreeStore.getState().setCurrentPageIndex;
    const setSnapshotMode = useAlbumTreeStore.getState().setSnapshotMode;
    const albumForSpreads = useAlbumTreeStore.getState().album;
    const albumSpreads =
      albumForSpreads?.m_treeV5?.m_book_subtree?.m_spread_folders || [];
    const totalSpreads =
      albumSpreads.length || useAlbumTreeStore.getState().totalSpreads;
    const totalTasks = totalSpreads + 1; // +1 for cover
    let completedTasks = 0;
    const snapshotImages = new Map<number, File>();

    // Enable snapshot mode for faster image loading
    setSnapshotMode(true);

    // Track async uploads for final completion
    const uploadPromises: Promise<void>[] = [];
    let uploadedCount = 0;

    try {
      // Capture cover page
      setCurrentPageIndex(-1);
      await delay(55);
      if (currentPageIndex === -1) {
        await clickOpenFullCoverEditor();
      }
      // Pre-load images in the current page
      const coverImage = await capturePageWithRetry(-1);
      const coverImageFile = await imageToFile(coverImage, 'thumb_cover.jpg');

      // Store cover snapshot for viewer
      const coverSnapshotImage: SnapshotImage = {
        url: URL.createObjectURL(coverImageFile),
        fileName: 'thumb_cover.jpg',
        pageIndex: -1,
        timestamp: Date.now(),
      };
      storeSnapshot(coverSnapshotImage);

      snapshotImages.set(0, coverImageFile);
      completedTasks++;
      const captureProgress = Math.min(95, (completedTasks / totalTasks) * 95);
      smoothProgress(captureProgress);

      // Start async upload for cover (non-blocking)
      if (uploadOptions) {
        const coverUploadPromise = uploadSnapshot({
          orderId: uploadOptions.orderId,
          eventToken: uploadOptions.eventToken,
          spreadIndex: 0,
          fileName: coverImageFile.name,
          imageBlob: coverImageFile,
        })
          .then(() => {
            uploadedCount++;
            if (uploadOptions.onUploadProgress) {
              uploadOptions.onUploadProgress(uploadedCount);
            }
          })
          .catch((uploadError) => {
            trackError(uploadError as Error, {
              errorType: 'snapshot_error',
              component: 'useEditorSnapshot',
              action: 'uploadCoverSnapshot',
              eventToken: uploadOptions.eventToken,
              orderId: uploadOptions.orderId,
              fileName: coverImageFile.name,
            });
          });

        uploadPromises.push(coverUploadPromise);
      }

      // Process spreads
      for (let i = 0; i < totalSpreads; i++) {
        try {
          setCurrentPageIndex(i);
          await delay(55);

          const image = await capturePageWithRetry(i);
          const imageName = getImageName(i);
          const imageFile = await imageToFile(image, imageName);

          // Store snapshot for viewer
          const snapshotImage: SnapshotImage = {
            url: URL.createObjectURL(imageFile),
            fileName: imageName,
            pageIndex: i,
            timestamp: Date.now(),
          };
          storeSnapshot(snapshotImage);

          completedTasks++;
          // Capture progress
          const captureProgress = Math.min(
            95,
            (completedTasks / totalTasks) * 95
          );
          smoothProgress(captureProgress);
          snapshotImages.set(i + 1, imageFile);

          // Start async upload (non-blocking) - captures continue immediately
          if (uploadOptions) {
            const spreadUploadPromise = uploadSnapshot({
              orderId: uploadOptions.orderId,
              eventToken: uploadOptions.eventToken,
              spreadIndex: i + 1,
              fileName: imageFile.name,
              imageBlob: imageFile,
            })
              .then(() => {
                uploadedCount++;
                if (uploadOptions.onUploadProgress) {
                  uploadOptions.onUploadProgress(uploadedCount);
                }
              })
              .catch((uploadError) => {
                trackError(uploadError as Error, {
                  errorType: 'snapshot_error',
                  component: 'useEditorSnapshot',
                  action: 'uploadSpreadSnapshot',
                  eventToken: uploadOptions.eventToken,
                  orderId: uploadOptions.orderId,
                  spreadIndex: i + 1,
                  fileName: imageFile.name,
                });
                console.error(`Spread ${i} upload failed:`, uploadError);
              });

            uploadPromises.push(spreadUploadPromise);
          }
        } catch (error) {
          trackError(error as Error, {
            errorType: 'snapshot_error',
            component: 'useEditorSnapshot',
            action: 'captureSpreadSnapshot',
            spreadIndex: i,
            totalSpreads,
          });
          console.error(`Failed to capture spread ${i}:`, error);
          completedTasks++;
          const captureProgress = Math.min(
            95,
            (completedTasks / totalTasks) * 95
          );
          smoothProgress(captureProgress);
        }
      }

      // Restore original page and disable snapshot mode
      setCurrentPageIndex(currentPageIndex);
      setSnapshotMode(false);
      smoothProgress(100);

      // Wait for all async uploads to complete (if any)
      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);
      }

      return snapshotImages;
    } catch (error) {
      trackError(error as Error, {
        errorType: 'snapshot_error',
        component: 'useEditorSnapshot',
        action: 'generateSnapshots',
        totalSpreads,
        currentPageIndex,
        hasUploadOptions: !!uploadOptions,
      });
      setCurrentPageIndex(currentPageIndex);
      setSnapshotMode(false);
      throw error;
    }
  };

  return {
    getSnapshotImages,
  };
};
