import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/recognition/types";

export type PrepareError = "type" | "size" | "file";

export function validateFile(file: File): PrepareError | null {
  const typeOk = ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number]) || /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!typeOk) return "type";
  if (file.size > MAX_UPLOAD_BYTES) return "size";
  return null;
}

export async function canvasFromFile(file: File): Promise<HTMLCanvasElement> {
  const invalid = validateFile(file);
  if (invalid) throw new Error(invalid);
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    return drawToCanvas(image);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function canvasFromVideo(video: HTMLVideoElement) {
  return drawToCanvas(video, video.videoWidth || 1280, video.videoHeight || 720);
}

export function jpegFromCanvas(canvas: HTMLCanvasElement, quality = 0.82) {
  const max = 1280;
  const scale = Math.min(1, max / Math.max(canvas.width, canvas.height));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(canvas.width * scale));
  out.height = Math.max(1, Math.round(canvas.height * scale));
  const context = out.getContext("2d");
  if (!context) throw new Error("file");
  context.drawImage(canvas, 0, 0, out.width, out.height);
  const dataUrl = out.toDataURL("image/jpeg", quality);
  if (dataUrl.length * 0.75 > MAX_UPLOAD_BYTES) throw new Error("size");
  return { canvas: out, dataUrl };
}

function dimension(source: CanvasImageSource, key: "naturalWidth" | "naturalHeight" | "width" | "height") {
  const record = source as unknown as Record<string, number>;
  const value = record[key];
  if (Number.isFinite(value) && value > 0) return value;
  return 0;
}

function drawToCanvas(source: CanvasImageSource, width?: number, height?: number) {
  const canvas = document.createElement("canvas");
  const w = width || dimension(source, "naturalWidth") || dimension(source, "width") || 1;
  const h = height || dimension(source, "naturalHeight") || dimension(source, "height") || 1;
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("file");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("file"));
    image.src = url;
  });
}
