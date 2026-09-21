import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RealCost",
    short_name: "RealCost",
    description: "Turn any price into hours of your life.",
    start_url: "/",
    display: "standalone",
    background_color: "#07070b",
    theme_color: "#3b6ef5",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
