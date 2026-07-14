import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronRight } from "lucide-react";
import {
  MarketingHeader,
  MarketingFooter,
  CtaBand,
} from "@/components/marketing/sections";
import { BlogTradeBadge } from "@/components/blog/trade-badge";
import {
  getPublishedPostBySlug,
  getPublishedPostSlugs,
  getRelatedPosts,
} from "@/lib/blog/posts";
import { htmlToPlainText, stripInlineFaqSection } from "@/lib/blog/utils";
import {
  SITE_NAME,
  absoluteUrl,
  jsonLd,
  blogPostingSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: "Article not found", robots: { index: false } };
  }

  const title = post.seo_title || post.title;
  const description =
    post.seo_description ||
    post.excerpt ||
    `Red Seal exam prep insights from ${SITE_NAME}.`;
  const url = `/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.keywords.length ? post.keywords : undefined,
    authors: [{ name: post.author_name }],
    alternates: { canonical: post.canonical_url || url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: [post.author_name],
      tags: post.tags,
      images: post.cover_image_url
        ? [
            {
              url: post.cover_image_url,
              alt: post.cover_image_alt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  // Avoid duplicating the FAQ: when we render the structured FAQ block below,
  // strip any inline "Frequently Asked Questions" section from the body.
  const bodyHtml = post.faq.length
    ? stripInlineFaqSection(post.content_html)
    : post.content_html;
  const wordCount = htmlToPlainText(bodyHtml)
    .split(/\s+/)
    .filter(Boolean).length;

  const graph: object[] = [
    blogPostingSchema({
      ...post,
      wordCount,
      trade_slug: post.trade_slug,
      trade_name: post.trade_name,
    }),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
  ];
  if (post.faq.length) {
    graph.push(faqSchema(post.faq));
  }

  return (
    <div className="app-mobile-content min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({ "@context": "https://schema.org", "@graph": graph }),
        }}
      />
      <MarketingHeader />

      <article>
        <div className="mx-auto max-w-[780px] px-6 pb-8 pt-10 md:pt-14">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
            <Link href="/blog" className="hover:text-[#C0271E]">
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <BlogTradeBadge
              tradeSlug={post.trade_slug}
              tradeName={post.trade_name}
            />
            {post.category ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-[#F4564E]">{post.category}</span>
              </>
            ) : null}
          </nav>

          <h1 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[36px] font-extrabold leading-[1.08] tracking-tight text-[#1F2A37] md:text-[46px]">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-[18px] leading-relaxed text-[#4A5A6A]">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#94A3B8]">
            <span className="font-semibold text-[#475569]">
              {post.author_name}
            </span>
            {post.published_at ? (
              <span>{formatDate(post.published_at)}</span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.reading_minutes} min read
            </span>
          </div>
        </div>

        {post.cover_image_url ? (
          <div className="mx-auto max-w-[980px] px-6">
            <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-[#F1ECE3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.cover_image_alt || post.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-[780px] px-6 py-10 md:py-12">
          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {post.tags.length ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F1ECE3] px-3 py-1 text-xs font-medium text-[#64748B]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {post.faq.length ? (
            <section className="mt-12">
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[28px] font-extrabold tracking-tight text-[#1F2A37]">
                Frequently asked questions
              </h2>
              <div className="mt-4 divide-y divide-[#E5E0D8] border-y border-[#E5E0D8]">
                {post.faq.map((item, i) => (
                  <details key={i} className="group py-4">
                    <summary className="cursor-pointer list-none font-semibold text-[#1F2A37] marker:hidden">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#4A5A6A]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-[#F1ECE3] bg-[#FBF8F2]">
          <div className="mx-auto max-w-[1180px] px-6 py-12">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[26px] font-extrabold tracking-tight text-[#1F2A37]">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white transition hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] bg-[#F1ECE3]">
                    {r.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.cover_image_url}
                        alt={r.cover_image_alt || r.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-barlow-semi)] text-[16px] font-bold leading-snug text-[#1F2A37] group-hover:text-[#C0271E]">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
      <MarketingFooter />
    </div>
  );
}
