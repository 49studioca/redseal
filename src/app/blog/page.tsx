import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import {
  MarketingHeader,
  MarketingFooter,
  CtaBand,
} from "@/components/marketing/sections";
import { BlogTradeBadge } from "@/components/blog/trade-badge";
import { getPublishedPosts } from "@/lib/blog/posts";
import { SITE_NAME, absoluteUrl, jsonLd, organizationSchema } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — Red Seal Exam Prep Tips & Trade Guides",
  description:
    "Study strategies, trade guides, and Red Seal exam prep advice for Canadian apprentices and journeypersons. Practical, expert-written articles from RedSealGuide.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description:
      "Study strategies, trade guides, and Red Seal exam prep advice for Canadian tradespeople.",
    url: "/blog",
    type: "website",
  },
};

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts(60);
  const [featured, ...rest] = posts;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      {
        "@type": "Blog",
        "@id": `${absoluteUrl("/blog")}#blog`,
        name: `${SITE_NAME} Blog`,
        url: absoluteUrl("/blog"),
        inLanguage: "en-CA",
        blogPost: posts.slice(0, 20).map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: absoluteUrl(`/blog/${p.slug}`),
          datePublished: p.published_at || undefined,
        })),
      },
    ],
  };

  return (
    <div className="app-mobile-content min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingHeader />

      <section className="border-b border-[#F1ECE3] bg-gradient-to-b from-[#FBF8F2] to-white">
        <div className="mx-auto max-w-[1180px] px-6 pb-10 pt-12 md:pb-14 md:pt-16">
          <div className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
            RedSealGuide Blog
          </div>
          <h1 className="mt-2 max-w-[760px] font-[family-name:var(--font-barlow-condensed)] text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#1F2A37] md:text-[56px]">
            Red Seal exam prep tips, trade guides & study strategies
          </h1>
          <p className="mt-4 max-w-[640px] text-[16.5px] leading-relaxed text-[#4A5A6A]">
            Practical, expert-written advice to help Canadian apprentices and
            journeypersons pass their Red Seal certification exams.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E0D8] p-12 text-center text-[#64748B]">
            No articles published yet. Check back soon.
          </div>
        ) : (
          <>
            {featured ? (
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid gap-6 overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white transition hover:shadow-lg md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] bg-[#F1ECE3] md:aspect-auto">
                  {featured.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.cover_image_url}
                      alt={featured.cover_image_alt || featured.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <BlogTradeBadge
                      tradeSlug={featured.trade_slug}
                      tradeName={featured.trade_name}
                    />
                    {featured.category ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
                        {featured.category}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-[30px] font-extrabold leading-tight tracking-tight text-[#1F2A37] group-hover:text-[#C0271E] md:text-[34px]">
                    {featured.title}
                  </h2>
                  {featured.excerpt ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-[#4A5A6A]">
                      {featured.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-3 text-xs text-[#94A3B8]">
                    <span>{formatDate(featured.published_at)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.reading_minutes} min read
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}

            {rest.length ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white transition hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] bg-[#F1ECE3]">
                      {post.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || post.title}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <BlogTradeBadge
                          tradeSlug={post.trade_slug}
                          tradeName={post.trade_name}
                        />
                        {post.category ? (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F4564E]">
                            {post.category}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 font-[family-name:var(--font-barlow-semi)] text-[19px] font-bold leading-snug text-[#1F2A37] group-hover:text-[#C0271E]">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4A5A6A]">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-[#94A3B8]">
                        <span>{formatDate(post.published_at)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.reading_minutes} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <CtaBand />
      <MarketingFooter />
    </div>
  );
}
