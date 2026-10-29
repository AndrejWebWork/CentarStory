import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CentarStory",
    short_name: "CentarStory",
    description:
      "A cultural guide to monuments, museums, food, and movement in the Municipality of Centar, Skopje.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3eee6",
    theme_color: "#1c1612",
    lang: "en",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
