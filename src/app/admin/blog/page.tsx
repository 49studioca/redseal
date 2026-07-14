"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlogTradeBadge } from "@/components/blog/trade-badge";
import type { BlogPost } from "@/types";

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setPosts(data.posts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      setPosts((p) => p.filter((post) => post.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
            <Newspaper className="h-6 w-6 text-[#C0271E]" /> Blog
          </h1>
          <Link href="/admin/blog/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> New post
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-[#F4564E]/40 bg-[#FCEBEC] p-3 text-sm text-[#C0271E]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <Card className="mt-6 p-10 text-center">
            <p className="text-sm text-[#64748B]">
              No posts yet. Create your first AI-assisted article.
            </p>
            <Link href="/admin/blog/new" className="mt-4 inline-block">
              <Button>
                <Plus className="h-4 w-4" /> New post
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="mt-6 space-y-2">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        post.status === "published"
                          ? "bg-[#ECFDF5] text-[#047857]"
                          : "bg-[#F1ECE3] text-[#94A3B8]"
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.category ? (
                      <span className="text-xs text-[#94A3B8]">
                        {post.category}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 truncate font-semibold text-[#1F2A37]">
                    {post.title}
                  </div>
                  <div className="mt-1.5">
                    <BlogTradeBadge
                      tradeSlug={post.trade_slug}
                      tradeName={post.trade_name}
                    />
                  </div>
                  <div className="mt-1 truncate font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                    /blog/{post.slug}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {post.status === "published" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="flex h-9 w-9 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1ECE3]"
                      title="View"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1ECE3]"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    disabled={deleting === post.id}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-[#64748B] hover:bg-[#FCEBEC] hover:text-[#C0271E]"
                    title="Delete"
                  >
                    {deleting === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
