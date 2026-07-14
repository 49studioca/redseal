import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api",
        "/api/",
        "/dashboard",
        "/dashboard/",
        "/instructor",
        "/instructor/",
        "/onboarding",
        "/onboarding/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
