import type { MetadataRoute } from "next";
import { allPublicSitemapRoutes, absoluteUrl } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/blog/posts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = allPublicSitemapRoutes().map(
    (route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency:
        route === "/"
          ? "weekly"
          : route.startsWith("/trades/")
            ? "monthly"
            : "weekly",
      priority:
        route === "/" ? 1 : route === "/trades" || route === "/pricing" ? 0.9 : 0.75,
    }),
  );

  const posts = await getPublishedPosts(200);
  const blogIndex: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/blog"),
      lastModified: posts[0]?.updated_at ? new Date(posts[0].updated_at) : now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updated_at || post.published_at || now),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...blogIndex, ...blogEntries];
}
