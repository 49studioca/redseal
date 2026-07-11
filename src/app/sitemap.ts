import type { MetadataRoute } from "next";
import { allPublicSitemapRoutes, absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return allPublicSitemapRoutes().map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency:
      route === "/" ? "weekly" : route.startsWith("/trades/") ? "monthly" : "weekly",
    priority: route === "/" ? 1 : route === "/trades" || route === "/pricing" ? 0.9 : 0.75,
  }));
}
