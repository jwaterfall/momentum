import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Momentum",
    short_name: "Momentum",
    description: "Your personal growth dashboard",
    start_url: "/",
    display: "standalone",
    background_color: "#020618",
    theme_color: "#020618",
    scope: "/",
    icons: [
      {
        src: "/maskable-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
