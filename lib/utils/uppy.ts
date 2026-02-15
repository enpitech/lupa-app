import Uppy from '@uppy/core';
import Compressor from 'compressorjs';
import { ImageData } from '@/stores/album/types';
import i18n from '@/i18n';
import { UPPY_FILE_SOURCES, API_GROUPA_UPLOAD_SOURCE } from '@/utils/appConst';
import type { UppyOptionsWithOptionalRestrictions } from '@uppy/core/lib/Uppy';
import { trackError } from '@/utils/datadogErrorTracking';
import { openInvalidFilesModal } from '@/lib/utils/openInvalidFilesModal';
import useFilesProgressTracker from '@/stores/uploadProgress';
import { Meta, UppyFile } from '@uppy/core';

export interface PhotoUploadMeta extends Meta {
  width?: number;
  height?: number;
  imageSrc?: string;
  invalidWidth?: number;
  invalidHeight?: number;
  api?: string;
  should_compress?: boolean;
  should_resize?: boolean;
}

export type PhotoUppyFile = UppyFile<PhotoUploadMeta, Record<string, never>>;

const thresholdSizeForCompression = 15728640; // 15 MB
export interface UploaderConfig {
  maxFiles?: number;
  maxResolution?: number;
  minResolution?: number;
  compressQuality?: number;
}

export interface UppyPhotoUploaderAnalytics {
  upload: {
    startTime: number;
    times: number[];
    successCount: number;
    failureCount: number;
  };
  compression: {
    startTime: number;
    endTime: number;
  };
}

function isResolutionValid(
  width: number,
  height: number,
  minResolution: number
): boolean {
  return width >= minResolution && height >= minResolution;
}

function getMaxDimensionConstraints(
  width: number,
  height: number,
  maxResolution: number
): { maxWidth: number | undefined; maxHeight: number | undefined } {
  const shorterDimension = Math.min(width, height);

  // If image is already within limits, no constraints needed
  if (shorterDimension <= maxResolution) {
    return { maxWidth: undefined, maxHeight: undefined };
  }

  const isWidthShorter = shorterDimension === width;
  return {
    maxWidth: isWidthShorter ? maxResolution : undefined,
    maxHeight: isWidthShorter ? undefined : maxResolution,
  };
}

/*
  Handle 2 queue systems to limit concurrent image processing jobs for device uploads.
  1. runningQueue: Set of currently running jobs (max size = MAX_CONCURRENT_JOBS)
  2. waitingQueue: Array of jobs waiting to be started when a slot is free
*/

interface ProcessingJob {
  file: PhotoUppyFile;
  minResolution: number;
  maxResolution: number;
  uppyInstance: Uppy<Meta, Record<string, never>>;
  filesAddedRef: React.MutableRefObject<number>;
  filesLength: React.MutableRefObject<number>;
  invalidFilesArrayRef: React.MutableRefObject<PhotoUppyFile[]>;
}

const MAX_CONCURRENT_JOBS = 100;
const runningQueue: Set<Promise<void>> = new Set();
const waitingQueue: ProcessingJob[] = [];

const executeJob = async (job: ProcessingJob): Promise<void> => {
  const promise = runDeviceFileProcessing(
    job.file,
    job.minResolution,
    job.maxResolution,
    job.uppyInstance,
    job.filesAddedRef,
    job.filesLength,
    job.invalidFilesArrayRef
  );

  runningQueue.add(promise);

  try {
    await promise;
  } catch (e) {
    console.error('Job failed during image processing:', e);
  } finally {
    runningQueue.delete(promise);

    // Check if there are jobs waiting to be started
    processQueue();
  }
};

const processQueue = () => {
  while (runningQueue.size < MAX_CONCURRENT_JOBS && waitingQueue.length > 0) {
    const nextJob = waitingQueue.shift();
    if (nextJob) {
      executeJob(nextJob);
    }
  }
};

export const addDeviceFileToQueue = (job: ProcessingJob) => {
  waitingQueue.push(job);
  processQueue();
};

export function runDeviceFileProcessing(
  file: PhotoUppyFile,
  minResolution: number,
  maxResolution: number,
  uppyInstance: Uppy<Meta, Record<string, never>>,
  filesAddedRef: React.MutableRefObject<number>,
  filesLength: React.MutableRefObject<number>,
  invalidFilesArrayRef: React.MutableRefObject<PhotoUppyFile[]>
): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image();

    img.onload = async () => {
      const width = img.width;
      const height = img.height;

      await processAndValidateFile(
        file,
        width,
        height,
        minResolution,
        maxResolution,
        filesAddedRef,
        filesLength,
        uppyInstance,
        invalidFilesArrayRef,
        fileUrl
      );
      resolve();
    };

    img.onerror = () => {
      console.error('Failed to load image for dimension check:', file);
      trackError(new Error('Failed to load image for dimension check'), {
        errorType: 'image_processing_error',
        action: 'handleDeviceFile',
        fileName: file.name,
      });
      // In the error path, we still need to increment and check completion.
      filesAddedRef.current++;

      useFilesProgressTracker.getState().incrementProcessingDone();

      checkAllFilesProcessed(
        filesAddedRef,
        filesLength,
        invalidFilesArrayRef,
        uppyInstance,
        maxResolution
      );

      resolve();
    };

    const fileUrl = URL.createObjectURL(file.data);
    img.src = fileUrl;
  });
}
export function handleFileAdded(
  filesAddedRef: React.MutableRefObject<number>,
  maxResolution: number,
  minResolution: number,
  file: PhotoUppyFile,
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>,
  filesLength: React.MutableRefObject<number>,
  invalidFilesArrayRef: React.MutableRefObject<PhotoUppyFile[]>
) {
  const fileSourceType = file.source;

  switch (fileSourceType) {
    case UPPY_FILE_SOURCES.GOOGLE_PHOTOS_PICKER:
      // Google Photos: dimensions available in metadata
      handleGooglePhotosFile(
        file,
        minResolution,
        maxResolution,
        uppyInstance,
        filesAddedRef,
        filesLength,
        invalidFilesArrayRef
      );
      break;

    case UPPY_FILE_SOURCES.DASHBOARD_MODAL:
      // Device upload: need to load image to get dimensions
      addDeviceFileToQueue({
        file,
        minResolution,
        maxResolution,
        uppyInstance,
        filesAddedRef,
        filesLength,
        invalidFilesArrayRef,
      });
      break;

    default:
      console.error('Unhandled file source type for file:', file);
      // Remove unhandled file + increment counters to avoid hanging
      uppyInstance.removeFile(file.id);
      filesAddedRef.current++;
      checkAllFilesProcessed(
        filesAddedRef,
        filesLength,
        invalidFilesArrayRef,
        uppyInstance,
        maxResolution
      );
      break;
  }
}

function determineApiSource(file: PhotoUppyFile): string | null {
  return file.source === UPPY_FILE_SOURCES.GOOGLE_PHOTOS_PICKER
    ? API_GROUPA_UPLOAD_SOURCE.PICASA
    : file.source === UPPY_FILE_SOURCES.DASHBOARD_MODAL
    ? API_GROUPA_UPLOAD_SOURCE.NATIVE
    : null;
}

async function processAndValidateFile(
  file: PhotoUppyFile,
  width: number,
  height: number,
  minResolution: number,
  maxResolution: number,
  filesAddedRef: React.MutableRefObject<number>,
  filesLength: React.MutableRefObject<number>,
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>,
  invalidFilesArrayRef: React.MutableRefObject<PhotoUppyFile[]>,
  fileUrl?: string
): Promise<void> {
  const isValid = isResolutionValid(width, height, minResolution);
  const isGooglePhotos = file.source === UPPY_FILE_SOURCES.GOOGLE_PHOTOS_PICKER;

  if (!isValid) {
    // For invalid files, fetch Google Photos image to show preview in modal
    if (isGooglePhotos) {
      const imgUrl = await getImageFromGooglePhotos(file, maxResolution);
      if (imgUrl) {
        fileUrl = imgUrl;
      }
    }

    file.meta = {
      ...file.meta,
      imageSrc: fileUrl,
      invalidWidth: width,
      invalidHeight: height,
    };
    invalidFilesArrayRef.current.push(file);
    // For invalid files, we dont revoke in order to show preview in modal (will be revoked after modal closes)
  } else {
    const apiSource = determineApiSource(file);

    // For device files, revoke temporary blob to free memory
    // For google photos, we didnt create blob URL yet.
    if (!isGooglePhotos) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    }

    // For Google Photos uploads always resize and never compress on frontend.
    // For device uploads >15MB, frontend will attempt compression/resize first.
    //       If successful, these flags will be updated to false in setupImageCompression.
    uppyInstance.setFileMeta(file.id, {
      width,
      height,
      api: apiSource ?? undefined,
      should_compress: true,
      should_resize: !isGooglePhotos,
      // Don't set imageSrc here for Google Photos - will be fetched later
    });
  }

  // Increment processed counter
  filesAddedRef.current++;
  useFilesProgressTracker.getState().incrementProcessingDone();

  // Check if all files processed
  checkAllFilesProcessed(
    filesAddedRef,
    filesLength,
    invalidFilesArrayRef,
    uppyInstance,
    maxResolution
  );

  return;
}
function handleGooglePhotosFile(
  file: PhotoUppyFile,
  minResolution: number,
  maxResolution: number,
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>,
  filesAddedRef: React.MutableRefObject<number>,
  filesLength: React.MutableRefObject<number>,
  invalidFilesArrayRef: React.MutableRefObject<PhotoUppyFile[]>
) {
  // Extract dimensions from metadata
  const width = (file?.meta?.width as number) || 0;
  const height = (file?.meta?.height as number) || 0;

  processAndValidateFile(
    file,
    width,
    height,
    minResolution,
    maxResolution,
    filesAddedRef,
    filesLength,
    uppyInstance,
    invalidFilesArrayRef
  );
}

export function checkAllFilesProcessed(
  filesAddedRef: React.MutableRefObject<number>,
  filesLength: React.MutableRefObject<number>,
  invalidFilesArrayRef: React.MutableRefObject<PhotoUppyFile[]>,
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>,
  maxResolution: number
) {
  if (areAllFilesProcessed(filesAddedRef, filesLength)) {
    if (invalidFilesArrayRef.current.length > 0) {
      openInvalidFilesModal(invalidFilesArrayRef.current, uppyInstance);
    }

    // Fetch images for valid Google Photos files asynchronously
    fetchValidGooglePhotosImages(uppyInstance, maxResolution);

    filesAddedRef.current = 0;
    filesLength.current = 0;
    invalidFilesArrayRef.current = [];
    useFilesProgressTracker.getState().resetProcessingProgress();
  }
}

/**
 * Fetch Google Photos images for valid files after all validation is complete
 * This runs asynchronously and doesn't block the UI
 */
async function fetchValidGooglePhotosImages(
  uppyInstance: Uppy<Meta, Record<string, never>>,
  maxResolution: number
): Promise<void> {
  const files = uppyInstance.getFiles();

  // Filter for valid Google Photos files (those without invalidWidth)
  const validGooglePhotosFiles = files.filter(
    (file) =>
      file.source === UPPY_FILE_SOURCES.GOOGLE_PHOTOS_PICKER &&
      !file.meta?.invalidWidth
  );

  if (validGooglePhotosFiles.length === 0) {
    return;
  }

  // Fetch all images in parallel
  await Promise.all(
    validGooglePhotosFiles.map(async (file) => {
      try {
        // Set the image src in file.preview
        await getImageFromGooglePhotos(file, maxResolution);
        // Update Uppy file state to trigger re-render with preview
        uppyInstance.setFileState(file.id, { preview: file.preview });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Can’t set state')
        ) {
          // Image is beeing removed, skip tracking
          return;
        }

        trackError(
          error instanceof Error
            ? error
            : new Error('Failed to fetch Google Photos image'),
          {
            errorType: 'image_processing_error',
            action: 'fetchValidGooglePhotosImages',
            fileName: file.name,
          }
        );
      }
    })
  );
}

export async function getImageFromGooglePhotos(
  file: PhotoUppyFile,
  maxResolution: number
): Promise<string | null> {
  if (!file.remote || !file.remote.body) {
    trackError(
      new Error('Invalid file structure: remote or remote.body is missing'),
      {
        errorType: 'image_processing_error',
        action: 'getImageFromGooglePhotos',
        fileName: file.name,
        hasRemote: !!file.remote,
      }
    );
    return null;
  }

  const googleAccessToken = file.remote.body.accessToken;
  let imageUrl = file.remote.body.url as string;

  if (!imageUrl) {
    trackError(
      new Error('Invalid file structure: remote.body.url is missing'),
      {
        errorType: 'image_processing_error',
        action: 'getImageFromGooglePhotos',
        fileName: file.name,
      }
    );
    return null;
  }

  const width = file?.meta?.width as number;
  const height = file?.meta?.height as number;
  // Use helper function to determine dimension constraints
  const { maxWidth, maxHeight } = getMaxDimensionConstraints(
    width,
    height,
    maxResolution
  );

  // Only if one of maxWidth or maxHeight is set, we add the parameter
  if (maxWidth || maxHeight) {
    // Build Google Photos URL parameter (w{width}-h{height} format)
    const maxParam = `${maxWidth ? `w${maxWidth}` : ''}-${
      maxHeight ? `h${maxHeight}` : ''
    }`;
    if (imageUrl.includes('=')) {
      imageUrl = imageUrl.replace(/=[^=]*$/, `=${maxParam}`);
    } else {
      imageUrl += `=${maxParam}`;
    }
  }

  try {
    file.remote.body.url = imageUrl;
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();
    const fileUrl = URL.createObjectURL(blob);
    file.preview = fileUrl;
    return fileUrl;
  } catch (error) {
    trackError(
      error instanceof Error
        ? error
        : new Error('Failed to fetch Google Photos image'),
      {
        errorType: 'image_processing_error',
        action: 'getImageFromGooglePhotos',
        fileName: file.name,
        statusCode: (error as { status?: number })?.status,
        imageUrl,
      }
    );
    return null;
  }
}

export function setupImageCompression(
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>,
  compressQuality: number,
  maxResolution: number
) {
  const compress = (blob: Blob, width: number, height: number) => {
    return new Promise<Blob>((resolve, reject) => {
      const { maxWidth, maxHeight } = getMaxDimensionConstraints(
        width,
        height,
        maxResolution
      );

      // If no constraints needed, resolve with original blob
      if (!maxWidth && !maxHeight) {
        return resolve(blob);
      }

      return new Compressor(blob, {
        quality: compressQuality,
        retainExif: true,
        maxWidth,
        maxHeight,
        ...uppyInstance.opts,
        success(result) {
          return resolve(result as Blob);
        },
        error(err) {
          trackError(
            err instanceof Error ? err : new Error('Image compression failed'),
            {
              errorType: 'image_processing_error',
              action: 'compressImage',
              width,
              height,
              compressQuality,
            }
          );
          return reject(err);
        },
      });
    });
  };

  uppyInstance.addPreProcessor((fileIDs) => {
    const promises = fileIDs.map((fileID) => {
      const file = uppyInstance.getFile(fileID);
      // Skip compression for non-image files, Google Photos, or small files (backend will handle)
      if (
        !file ||
        !file.type.startsWith('image/') ||
        file.source === UPPY_FILE_SOURCES.GOOGLE_PHOTOS_PICKER ||
        (file?.size || 0) <= thresholdSizeForCompression
      ) {
        return Promise.resolve();
      }
      // Image is larger than 15MB - client side compression.
      uppyInstance.emit('preprocess-progress', file, {
        mode: 'indeterminate',
        message: i18n.t('compressingImages'),
      });
      return compress(
        file.data,
        file.meta.width as number,
        file.meta.height as number
      )
        .then((compressedBlob) => {
          uppyInstance.setFileState(fileID, { data: compressedBlob });

          // Compression and resize successful - update flags to false (backend doesn't need to do it)
          uppyInstance.setFileMeta(fileID, {
            should_compress: false,
            should_resize: false,
          });
        })
        .catch((err) => {
          trackError(
            err instanceof Error
              ? err
              : new Error(`Failed to compress ${fileID}`),
            {
              errorType: 'image_processing_error',
              action: 'imageCompressionPreProcessor',
              fileId: fileID,
              fileName: file.name,
              width: file.meta.width as number,
              height: file.meta.height as number,
            }
          );
          uppyInstance.log(`Failed to compress ${fileID}:`, 'warning');
          uppyInstance.log(err, 'warning');
        });
    });

    return Promise.all(promises).then(() => {
      fileIDs.forEach((fileID) => {
        const file = uppyInstance.getFile(fileID);
        uppyInstance.emit('preprocess-complete', file);
      });
    });
  });
}

export function uploadImageSuccess(
  response: {
    body?: Record<string, never> | undefined;
    status: number;
    bytesUploaded?: number;
    uploadURL?: string;
  },
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>,
  addImage: (image: ImageData) => void
): void {
  const uploadResponse = response.body;
  if (uploadResponse) {
    if (!uploadResponse.isValid) {
      uppyInstance.info(uploadResponse.Error, 'error', 5000);
    } else {
      addImage(uploadResponse.payload);
    }
  }
}

function areAllFilesProcessed(
  filesAddedRef: React.MutableRefObject<number>,
  filesLength: React.MutableRefObject<number>
): boolean {
  return filesAddedRef.current === filesLength.current;
}

// Clean up all blob URLs created uppy files after upload completes/cancels to free memory
export function revokeAllBlobUrls(
  uppyInstance: Uppy<Meta, Record<string, never>>
): void {
  const files = uppyInstance.getFiles();
  files.forEach((file) => {
    revokeSingleFileBlobUrl(file);
  });
}

// Clean up blob URLs for a single file
export function revokeSingleFileBlobUrl(file: PhotoUppyFile): void {
  if (file.preview && file.preview.startsWith('blob:')) {
    URL.revokeObjectURL(file.preview);
  }
}

// Simple hash function to generate stable numeric ID from string
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateImageData(file: PhotoUppyFile): ImageData {
  const stableUniqueId = hashStringToNumber(file.id);

  return {
    uniqueId: stableUniqueId,
    creation_date: new Date().toISOString(),
    event_token: '',
    facesVision: '',
    imageMediumHeight: 0,
    imageMediumWidth: 0,
    imageOriginalHeight: file.meta.height as number,
    imageOriginalWidth: file.meta.width as number,
    image_id: file.id,
    image_name: file.name || 'Uploaded Photo',
    image_text: '',
    image_url_medium: file.preview!,
    image_url_thumb: file.preview!,
    insert_date: new Date().toISOString(),
    isMaster: true,
    isOwner: true,
    isPostCardEnabled: false,
    isStack: false,
    ownerid: 0,
    ownername: '',
    roiDefault: [],
    status: '',
  };
}

export function generateUppyOptions(
  maxFiles: number
): UppyOptionsWithOptionalRestrictions<PhotoUploadMeta, Record<string, never>> {
  return {
    restrictions: {
      maxNumberOfFiles: maxFiles,
      allowedFileTypes: ['image/*', '.heic', '.heif', '.HEIC', '.HEIF'],
    },
    autoProceed: false,
    allowMultipleUploadBatches: true,
  };
}
