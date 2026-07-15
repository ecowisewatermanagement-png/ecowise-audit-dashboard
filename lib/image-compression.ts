import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.25,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

/** Compresses a photo client-side before it's uploaded to Supabase Storage. */
export async function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, COMPRESSION_OPTIONS);
}
