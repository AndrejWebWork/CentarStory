export type Evidence = {
  brightness: number;
  warmth: number;
  saturation: number;
  green: number;
  horizontal: number;
  vertical: number;
};

export type ImageQualityIssue = "low-light" | "blurry" | null;

export type ReasonCode =
  | "warmth"
  | "cool"
  | "bright"
  | "muted"
  | "saturated"
  | "horizontal"
  | "vertical"
  | "green"
  | "pale";

export type Band = {
  min: number;
  max: number;
  weight: number;
  reason: ReasonCode;
};

export type Profile = {
  slug: string;
  bands: Partial<Record<keyof Evidence, Band>>;
};

export type Match = {
  slug: string;
  score: number;
  reasons: ReasonCode[];
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function evidenceFromImageData(image: ImageData): Evidence {
  const { width, height, data } = image;
  let red = 0;
  let green = 0;
  let blue = 0;
  let saturation = 0;
  let count = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      red += r;
      green += g;
      blue += b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      saturation += max === 0 ? 0 : (max - min) / max;
      count += 1;
    }
  }

  const safeCount = Math.max(1, count);
  const rn = red / safeCount / 255;
  const gn = green / safeCount / 255;
  const bn = blue / safeCount / 255;
  let horizontalEnergy = 0;
  let verticalEnergy = 0;
  let edges = 0;
  const stride = 4;

  for (let y = 0; y < height - stride; y += stride) {
    for (let x = 0; x < width - stride; x += stride) {
      const current = (y * width + x) * 4;
      const right = (y * width + (x + stride)) * 4;
      const down = ((y + stride) * width + x) * 4;
      const lum = ((data[current] ?? 0) + (data[current + 1] ?? 0) + (data[current + 2] ?? 0)) / 3;
      const lumRight = ((data[right] ?? 0) + (data[right + 1] ?? 0) + (data[right + 2] ?? 0)) / 3;
      const lumDown = ((data[down] ?? 0) + (data[down + 1] ?? 0) + (data[down + 2] ?? 0)) / 3;
      horizontalEnergy += Math.abs(lum - lumRight);
      verticalEnergy += Math.abs(lum - lumDown);
      edges += 1;
    }
  }

  const edgeBase = Math.max(1, edges) * 255;

  return {
    brightness: clamp((rn + gn + bn) / 3),
    warmth: clamp((rn - bn + 1) / 2),
    saturation: clamp(saturation / safeCount),
    green: clamp(Math.max(0, gn - Math.max(rn, bn)) * 3.2),
    horizontal: clamp((horizontalEnergy / edgeBase) * 4.2),
    vertical: clamp((verticalEnergy / edgeBase) * 4.2),
  };
}

export function assessImageQuality(evidence: Evidence): ImageQualityIssue {
  if (evidence.brightness < 0.08) return "low-light";
  if (evidence.horizontal + evidence.vertical < 0.045) return "blurry";
  return null;
}

export function analyzeSource(
  source: CanvasImageSource,
  width: number,
  height: number,
): Evidence {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = Math.max(1, Math.round((height / Math.max(1, width)) * 96));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("canvas-unavailable");
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return evidenceFromImageData(
    context.getImageData(0, 0, canvas.width, canvas.height),
  );
}

function fit(value: number, band: Band) {
  if (value >= band.min && value <= band.max) return 1;
  const center = (band.min + band.max) / 2;
  const half = Math.max(0.04, (band.max - band.min) / 2);
  const distance = Math.abs(value - center) - half;
  return clamp(1 - distance / 0.42);
}

export function matchProfiles(evidence: Evidence, profiles: Profile[]): Match[] {
  return profiles
    .map((profile) => {
      let weighted = 0;
      let weight = 0;
      const reasons: ReasonCode[] = [];
      for (const key of Object.keys(profile.bands) as (keyof Evidence)[]) {
        const band = profile.bands[key];
        if (!band) continue;
        const score = fit(evidence[key], band);
        weighted += score * band.weight;
        weight += band.weight;
        if (score >= 0.72) reasons.push(band.reason);
      }
      return {
        slug: profile.slug,
        score: weight === 0 ? 0 : Math.round((weighted / weight) * 100),
        reasons: [...new Set(reasons)],
      };
    })
    .sort((a, b) => b.score - a.score);
}
