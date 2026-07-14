import Link from "next/link";
import { Clock } from "lucide-react";
import { getPublishedPosts } from "@/lib/blog/posts";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function TradeBlogPosts({ tradeSlug }: { tradeSlug: string }) {
  const posts = await getPublishedPosts(3, tradeSlug);
  if (!posts.length) return null;

  return (
    <section className="border-t border-[#E5E0D8] bg-[#FBF8F2]">
      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
              From the blog
            </div>
            <h2 className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-[28px] font-extrabold tracking-tight text-[#1F2A37]">
              Related exam prep articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-semibold text-[#C0271E] hover:underline"
          >
            All articles →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-[#E5E0D8] bg-white p-5 transition hover:shadow-lg"
            >
              <h3 className="font-[family-name:var(--font-barlow-semi)] text-[17px] font-bold leading-snug text-[#1F2A37] group-hover:text-[#C0271E]">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4A5A6A]">
                  {post.excerpt}
                </p>
              ) : null}
              <div className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
                <span>{formatDate(post.published_at)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.reading_minutes} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
