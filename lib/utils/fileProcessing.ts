import { FileMetadata } from '@/types/fileMetadata';

export async function processImageFile(
  file: File,
  supportedTypes: string[]
): Promise<FileMetadata | null> {
  if (!supportedTypes.includes(file.type)) {
    // TODO: Add error handling
    return null;
  }

  return new Promise<FileMetadata | null>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      const fileMetadata: FileMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.width,
        height: img.height,
        fileUrl: objectUrl,
      };
      resolve(fileMetadata);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // TODO: Add error handling
      resolve(null);
    };
  });
}
