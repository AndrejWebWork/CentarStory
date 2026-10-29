import type { Profile } from "@/lib/recognition/analyze";

export const profiles: Profile[] = [
  {
    slug: "stone-bridge",
    bands: {
      warmth: { min: 0.48, max: 0.68, weight: 1.3, reason: "warmth" },
      horizontal: { min: 0.42, max: 1, weight: 1.6, reason: "horizontal" },
      vertical: { min: 0.05, max: 0.48, weight: 0.8, reason: "horizontal" },
      brightness: { min: 0.32, max: 0.72, weight: 0.6, reason: "bright" },
      green: { min: 0, max: 0.28, weight: 0.4, reason: "muted" },
    },
  },
  {
    slug: "macedonia-square",
    bands: {
      warmth: { min: 0.58, max: 0.9, weight: 1.5, reason: "warmth" },
      vertical: { min: 0.4, max: 1, weight: 1.5, reason: "vertical" },
      saturation: { min: 0.18, max: 0.7, weight: 0.7, reason: "saturated" },
      brightness: { min: 0.35, max: 0.8, weight: 0.5, reason: "bright" },
    },
  },
  {
    slug: "porta-macedonia",
    bands: {
      warmth: { min: 0.5, max: 0.74, weight: 1.2, reason: "warmth" },
      vertical: { min: 0.38, max: 0.85, weight: 1.2, reason: "vertical" },
      horizontal: { min: 0.28, max: 0.7, weight: 0.8, reason: "horizontal" },
      saturation: { min: 0.05, max: 0.42, weight: 0.7, reason: "muted" },
    },
  },
  {
    slug: "old-railway-station",
    bands: {
      warmth: { min: 0.55, max: 0.82, weight: 1.4, reason: "warmth" },
      saturation: { min: 0.16, max: 0.55, weight: 0.8, reason: "saturated" },
      brightness: { min: 0.4, max: 0.82, weight: 0.7, reason: "bright" },
      horizontal: { min: 0.25, max: 0.7, weight: 0.6, reason: "horizontal" },
    },
  },
  {
    slug: "mother-teresa-house",
    bands: {
      brightness: { min: 0.62, max: 1, weight: 1.6, reason: "pale" },
      saturation: { min: 0, max: 0.22, weight: 1.3, reason: "muted" },
      warmth: { min: 0.42, max: 0.62, weight: 0.6, reason: "cool" },
      vertical: { min: 0.2, max: 0.7, weight: 0.5, reason: "vertical" },
    },
  },
  {
    slug: "skopje-fortress",
    bands: {
      green: { min: 0.12, max: 1, weight: 1.5, reason: "green" },
      warmth: { min: 0.4, max: 0.66, weight: 0.8, reason: "warmth" },
      brightness: { min: 0.3, max: 0.75, weight: 0.5, reason: "bright" },
      horizontal: { min: 0.2, max: 0.7, weight: 0.5, reason: "horizontal" },
    },
  },
  {
    slug: "cathedral-clement",
    bands: {
      saturation: { min: 0, max: 0.28, weight: 1.1, reason: "muted" },
      warmth: { min: 0.35, max: 0.58, weight: 0.9, reason: "cool" },
      vertical: { min: 0.3, max: 0.8, weight: 0.8, reason: "vertical" },
      brightness: { min: 0.35, max: 0.78, weight: 0.6, reason: "bright" },
    },
  },
  {
    slug: "daut-pasha-hammam",
    bands: {
      warmth: { min: 0.48, max: 0.78, weight: 1.3, reason: "warmth" },
      horizontal: { min: 0.3, max: 0.8, weight: 1.1, reason: "horizontal" },
      saturation: { min: 0, max: 0.38, weight: 0.8, reason: "muted" },
      brightness: { min: 0.28, max: 0.7, weight: 0.5, reason: "bright" },
    },
  },
  {
    slug: "archaeological-museum",
    bands: {
      warmth: { min: 0.32, max: 0.58, weight: 0.9, reason: "cool" },
      vertical: { min: 0.32, max: 0.85, weight: 1.1, reason: "vertical" },
      brightness: { min: 0.3, max: 0.75, weight: 0.6, reason: "bright" },
      saturation: { min: 0, max: 0.4, weight: 0.6, reason: "muted" },
    },
  },
  {
    slug: "contemporary-art",
    bands: {
      green: { min: 0.08, max: 0.7, weight: 1, reason: "green" },
      saturation: { min: 0, max: 0.35, weight: 0.8, reason: "muted" },
      brightness: { min: 0.28, max: 0.7, weight: 0.6, reason: "bright" },
      vertical: { min: 0.25, max: 0.75, weight: 0.5, reason: "vertical" },
    },
  },
];
