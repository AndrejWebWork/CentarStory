export type SkeletonPoint = { x: number; y: number };
export type SkeletonEdge = { a: number; b: number };

export type SkeletonMesh = {
  width: number;
  height: number;
  points: SkeletonPoint[];
  edges: SkeletonEdge[];
};

const SAMPLE_WIDTH = 160;
const CELL = 6;
const MAX_POINTS = 86;

function luminance(data: Uint8ClampedArray, index: number) {
  return ((data[index] ?? 0) * 0.299 + (data[index + 1] ?? 0) * 0.587 + (data[index + 2] ?? 0) * 0.114) / 255;
}

function sampleCanvas(canvas: HTMLCanvasElement) {
  const width = SAMPLE_WIDTH;
  const height = Math.max(96, Math.round((canvas.height / Math.max(1, canvas.width)) * SAMPLE_WIDTH));
  const work = document.createElement("canvas");
  work.width = width;
  work.height = height;
  const context = work.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(canvas, 0, 0, width, height);
  return { width, height, image: context.getImageData(0, 0, width, height) };
}

function sobel(image: ImageData) {
  const { width, height, data } = image;
  const mag = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = (y * width + x) * 4;
      const left = luminance(data, i - 4);
      const right = luminance(data, i + 4);
      const up = luminance(data, ((y - 1) * width + x) * 4);
      const down = luminance(data, ((y + 1) * width + x) * 4);
      const gx = right - left;
      const gy = down - up;
      mag[y * width + x] = Math.hypot(gx, gy);
    }
  }
  return mag;
}

function collectPoints(width: number, height: number, mag: Float32Array) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < mag.length; i += 1) {
    const value = mag[i] ?? 0;
    if (value <= 0) continue;
    sum += value;
    count += 1;
  }
  const mean = sum / Math.max(1, count);
  const threshold = Math.max(0.045, mean * 1.15);
  const points: SkeletonPoint[] = [];

  for (let cy = 1; cy < height - 1; cy += CELL) {
    for (let cx = 1; cx < width - 1; cx += CELL) {
      let best = 0;
      let bx = cx;
      let by = cy;
      const xEnd = Math.min(width - 2, cx + CELL);
      const yEnd = Math.min(height - 2, cy + CELL);
      for (let y = cy; y < yEnd; y += 1) {
        for (let x = cx; x < xEnd; x += 1) {
          const value = mag[y * width + x] ?? 0;
          if (value > best) {
            best = value;
            bx = x;
            by = y;
          }
        }
      }
      if (best >= threshold) points.push({ x: bx, y: by });
    }
  }

  const marginX = Math.round(width * 0.08);
  const marginY = Math.round(height * 0.06);
  const step = Math.max(6, Math.round(width / 18));
  for (let x = marginX; x < width - marginX; x += step) {
    let top = -1;
    let bottom = -1;
    for (let y = marginY; y < height - marginY; y += 1) {
      if ((mag[y * width + x] ?? 0) < threshold * 0.9) continue;
      if (top < 0) top = y;
      bottom = y;
    }
    if (top >= 0) points.push({ x, y: top });
    if (bottom >= 0 && bottom - top > 8) points.push({ x, y: bottom });
  }

  points.sort((a, b) => (mag[b.y * width + b.x] ?? 0) - (mag[a.y * width + a.x] ?? 0));
  const kept: SkeletonPoint[] = [];
  const minGap = CELL * 0.72;
  for (const point of points) {
    if (kept.some((other) => Math.hypot(other.x - point.x, other.y - point.y) < minGap)) continue;
    kept.push(point);
    if (kept.length >= MAX_POINTS) break;
  }
  return kept;
}

function biasedDistance(a: SkeletonPoint, b: SkeletonPoint) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const dist = Math.hypot(dx, dy);
  const axis = dy < dx * 0.38 || dx < dy * 0.38;
  return dist * (axis ? 0.62 : 1.18);
}

function connectPoints(points: SkeletonPoint[], width: number, height: number) {
  const maxDist = Math.hypot(width, height) * 0.2;
  const pairs: Array<{ a: number; b: number; score: number }> = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const from = points[i];
      const to = points[j];
      if (!from || !to) continue;
      const dist = Math.hypot(from.x - to.x, from.y - to.y);
      if (dist < 3 || dist > maxDist) continue;
      pairs.push({ a: i, b: j, score: biasedDistance(from, to) });
    }
  }
  pairs.sort((left, right) => left.score - right.score);

  const parent = points.map((_, index) => index);
  function find(index: number): number {
    let current = index;
    while (parent[current] !== current) {
      const next = parent[current] ?? current;
      parent[current] = parent[next] ?? next;
      current = parent[current] ?? current;
    }
    return current;
  }

  const degree = new Array<number>(points.length).fill(0);
  const edges: SkeletonEdge[] = [];

  for (const pair of pairs) {
    const rootA = find(pair.a);
    const rootB = find(pair.b);
    if (rootA === rootB) continue;
    if ((degree[pair.a] ?? 0) >= 3 || (degree[pair.b] ?? 0) >= 3) continue;
    parent[rootA] = rootB;
    degree[pair.a] = (degree[pair.a] ?? 0) + 1;
    degree[pair.b] = (degree[pair.b] ?? 0) + 1;
    edges.push({ a: pair.a, b: pair.b });
  }

  for (const pair of pairs) {
    if (edges.length > points.length + 18) break;
    if ((degree[pair.a] ?? 0) >= 4 || (degree[pair.b] ?? 0) >= 4) continue;
    if (edges.some((edge) => (edge.a === pair.a && edge.b === pair.b) || (edge.a === pair.b && edge.b === pair.a))) {
      continue;
    }
    const from = points[pair.a];
    const to = points[pair.b];
    if (!from || !to) continue;
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    const axis = dy < dx * 0.32 || dx < dy * 0.32;
    if (!axis) continue;
    degree[pair.a] = (degree[pair.a] ?? 0) + 1;
    degree[pair.b] = (degree[pair.b] ?? 0) + 1;
    edges.push({ a: pair.a, b: pair.b });
  }

  return edges;
}

export function skeletonFromCanvas(canvas: HTMLCanvasElement): SkeletonMesh | null {
  const sample = sampleCanvas(canvas);
  if (!sample) return null;
  const mag = sobel(sample.image);
  const points = collectPoints(sample.width, sample.height, mag);
  if (points.length < 8) return null;
  return {
    width: sample.width,
    height: sample.height,
    points,
    edges: connectPoints(points, sample.width, sample.height),
  };
}
