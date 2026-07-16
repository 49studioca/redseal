"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ImagePlus,
  Save,
  Eye,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { TRADES } from "@/data/seed";
import type { BlogFaqItem, BlogPost } from "@/types";

type FormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  keywords: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  cover_image_url: string;
  cover_image_alt: string;
  author_name: string;
  trade_slug: string;
  status: "draft" | "published";
  featured: boolean;
  content_html: string;
  content_json: Record<string, unknown> | null;
  faq: BlogFaqItem[];
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Exam Prep",
  tags: "",
  keywords: "",
  seo_title: "",
  seo_description: "",
  canonical_url: "",
  cover_image_url: "",
  cover_image_alt: "",
  author_name: "RedSealGuide Team",
  trade_slug: "",
  status: "draft",
  featured: false,
  content_html: "",
  content_json: null,
  faq: [],
};

function toForm(post: BlogPost): FormState {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    category: post.category ?? "Exam Prep",
    tags: post.tags.join(", "),
    keywords: post.keywords.join(", "),
    seo_title: post.seo_title ?? "",
    seo_description: post.seo_description ?? "",
    canonical_url: post.canonical_url ?? "",
    cover_image_url: post.cover_image_url ?? "",
    cover_image_alt: post.cover_image_alt ?? "",
    author_name: post.author_name,
    trade_slug: post.trade_slug ?? "",
    status: post.status,
    featured: post.featured,
    content_html: post.content_html,
    content_json: post.content_json,
    faq: post.faq,
  };
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const inputClass =
  "mt-1 w-full rounded-lg border border-[#E5E0D8] bg-white p-2.5 text-sm focus:border-[#C0271E] focus:outline-none";
const labelClass = "text-sm font-semibold text-[#1F2A37]";

export function BlogEditorForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imaging, setImaging] = useState(false);
  const [faqing, setFaqing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // AI generation inputs
  const [aiTopic, setAiTopic] = useState("");
  const [aiSourceUrl, setAiSourceUrl] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");

  const set = useCallback(
    <K extends keyof FormState>(key: K, val: FormState[K]) =>
      setForm((f) => ({ ...f, [key]: val })),
    [],
  );

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/blog/${postId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setForm(toForm(data.post));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const selectedTrade = TRADES.find((t) => t.slug === form.trade_slug);
  const isEditing = Boolean(form.id);
  const isPublished = isEditing && form.status === "published";

  const runAiGenerate = async () => {
    if (!aiTopic.trim() && !aiSourceUrl.trim()) {
      setError("Enter a topic or paste a source link.");
      return;
    }
    setGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          sourceUrl: aiSourceUrl,
          brief: aiBrief,
          targetKeywords: aiKeywords,
          tradeContext: selectedTrade
            ? `${selectedTrade.name} (${selectedTrade.code})`
            : "General Red Seal exam prep (all Canadian trades)",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      const d = data.draft;
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        slug: d.slug || f.slug,
        excerpt: d.excerpt || f.excerpt,
        category: d.category || f.category,
        tags: Array.isArray(d.tags) ? d.tags.join(", ") : f.tags,
        keywords: Array.isArray(d.keywords)
          ? d.keywords.join(", ")
          : f.keywords,
        seo_title: d.seo_title || f.seo_title,
        seo_description: d.seo_description || f.seo_description,
        content_html: d.content_html || f.content_html,
        faq: Array.isArray(d.faq) ? d.faq : f.faq,
      }));
      const sourceLabel = data.source?.title || data.source?.url;
      setNotice(
        sourceLabel
          ? `AI draft loaded from “${sourceLabel}”. Review, then generate a cover image and publish.`
          : "AI draft loaded into the form. Review, then generate a cover image and publish.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const runImageGenerate = async () => {
    if (!form.title.trim()) {
      setError("Add a title before generating an image.");
      return;
    }
    setImaging(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content_html: form.content_html,
          keywords: form.keywords,
          tradeName: selectedTrade?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Image generation failed");
      setForm((f) => ({
        ...f,
        cover_image_url: data.src,
        cover_image_alt: f.cover_image_alt || data.alt || f.title,
      }));
      setNotice(
        data.source === "generated"
          ? "Cover image generated."
          : "Cover image sourced to match the content and hosted.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image generation failed");
    } finally {
      setImaging(false);
    }
  };

  const runFaqGenerate = async () => {
    if (!form.title.trim()) {
      setError("Add a title (or generate content) before generating an FAQ.");
      return;
    }
    setFaqing(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/blog/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          content_html: form.content_html,
          keywords: form.keywords,
          tradeContext: selectedTrade
            ? `${selectedTrade.name} (${selectedTrade.code})`
            : "General Red Seal exam prep (all Canadian trades)",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "FAQ generation failed");
      const generated: BlogFaqItem[] = Array.isArray(data.faq) ? data.faq : [];
      if (!generated.length) {
        setError("AI returned no FAQ items. Try again after adding content.");
        return;
      }
      setForm((f) => {
        const existing = f.faq.filter(
          (item) => item.question.trim() || item.answer.trim(),
        );
        return { ...f, faq: [...existing, ...generated] };
      });
      setNotice(`Added ${generated.length} AI-generated FAQ item(s).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "FAQ generation failed");
    } finally {
      setFaqing(false);
    }
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      category: form.category || null,
      tags: splitList(form.tags),
      keywords: splitList(form.keywords),
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      canonical_url: form.canonical_url || null,
      cover_image_url: form.cover_image_url || null,
      cover_image_alt: form.cover_image_alt || null,
      og_image_url: form.cover_image_url || null,
      author_name: form.author_name || "RedSealGuide Team",
      trade_slug: form.trade_slug || null,
      content_html: form.content_html,
      content_json: form.content_json,
      faq: form.faq.filter((f) => f.question.trim() && f.answer.trim()),
      status,
      featured: form.featured,
    };
    try {
      const res = await fetch(
        form.id ? `/api/admin/blog/${form.id}` : "/api/admin/blog",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      const wasEditing = Boolean(form.id);
      if (!wasEditing) {
        router.push(`/admin/blog/${data.post.id}`);
        router.refresh();
      } else {
        setForm(toForm(data.post));
        setNotice(
          status === "published"
            ? "Changes saved and published."
            : "Saved as draft.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading post…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        <div className="flex items-center gap-2">
          {form.id && form.status === "published" ? (
            <Link href={`/blog/${form.slug}`} target="_blank">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" /> View
              </Button>
            </Link>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => save("draft")}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {isPublished ? "Unpublish" : "Save draft"}
          </Button>
          <Button size="sm" onClick={() => save("published")} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPublished ? (
              <Save className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isPublished ? "Update post" : "Publish"}
          </Button>
        </div>
      </div>

      <h1 className="mt-4 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        {form.id ? "Edit post" : "New blog post"}
      </h1>

      {error ? (
        <div className="mt-4 rounded-lg border border-[#F4564E]/40 bg-[#FCEBEC] p-3 text-sm text-[#C0271E]">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="mt-4 rounded-lg border border-[#10B981]/40 bg-[#ECFDF5] p-3 text-sm text-[#047857]">
          {notice}
        </div>
      ) : null}

      {/* AI content generator */}
      <Card className="mt-6 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#F4A11A]" />
          <h2 className="font-semibold">AI content generator</h2>
        </div>
        <p className="mt-1 text-xs text-[#64748B]">
          Paste a source link and/or describe a topic. The AI writes an original
          SEO draft related to that content and fills the fields below.
        </p>
        <div className="mt-3 grid gap-3">
          <div>
            <label className={labelClass}>Source link</label>
            <input
              type="url"
              value={aiSourceUrl}
              onChange={(e) => setAiSourceUrl(e.target.value)}
              placeholder="https://… — article, guide, or page to base the post on"
              className={inputClass}
            />
          </div>
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Topic or working title (optional if you pasted a link)"
            className={inputClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Trade scope</label>
              <select
                value={form.trade_slug}
                onChange={(e) => set("trade_slug", e.target.value)}
                className={inputClass}
              >
                <option value="">General — Red Seal (all trades)</option>
                {[...TRADES]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((trade) => (
                    <option key={trade.slug} value={trade.slug}>
                      {trade.name} ({trade.code})
                    </option>
                  ))}
              </select>
            </div>
            <input
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              placeholder="Target keywords (comma separated)"
              className={inputClass}
            />
          </div>
          <input
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            placeholder="Optional angle / notes"
            className={inputClass}
          />
          <div>
            <Button
              variant="dark"
              onClick={runAiGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {aiSourceUrl.trim()
                    ? "Reading link & generating…"
                    : "Generating…"}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Main content */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Post title (H1)"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Excerpt / dek</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="One or two sentence summary shown on cards and previews."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Body</label>
            <div className="mt-1">
              <TiptapEditor
                value={form.content_html}
                onChange={(html, json) => {
                  setForm((f) => ({
                    ...f,
                    content_html: html,
                    content_json: json,
                  }));
                }}
              />
            </div>
          </div>

          {/* FAQ */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">FAQ (structured data)</h3>
                <p className="text-xs text-[#64748B]">
                  Powers FAQPage schema + &ldquo;People Also Ask&rdquo;
                  snippets.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="dark"
                  size="sm"
                  onClick={runFaqGenerate}
                  disabled={faqing}
                >
                  {faqing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate with AI
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    set("faq", [...form.faq, { question: "", answer: "" }])
                  }
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {form.faq.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">No FAQ items yet.</p>
              ) : (
                form.faq.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#E5E0D8] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={item.question}
                        onChange={(e) => {
                          const next = [...form.faq];
                          next[i] = { ...next[i], question: e.target.value };
                          set("faq", next);
                        }}
                        placeholder="Question"
                        className="w-full rounded-md border border-[#E5E0D8] p-2 text-sm focus:border-[#C0271E] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "faq",
                            form.faq.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-[#94A3B8] hover:text-[#C0271E]"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={item.answer}
                      onChange={(e) => {
                        const next = [...form.faq];
                        next[i] = { ...next[i], answer: e.target.value };
                        set("faq", next);
                      }}
                      rows={2}
                      placeholder="Answer"
                      className="mt-2 w-full rounded-md border border-[#E5E0D8] p-2 text-sm focus:border-[#C0271E] focus:outline-none"
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold">Cover image</h3>
            {form.cover_image_url ? (
              <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg bg-[#F1ECE3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.cover_image_url}
                  alt={form.cover_image_alt || form.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="mt-3 flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-[#E5E0D8] text-xs text-[#94A3B8]">
                No cover image
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 w-full"
              onClick={runImageGenerate}
              disabled={imaging}
            >
              {imaging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" /> Generate from content
                </>
              )}
            </Button>
            <input
              value={form.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="…or paste an image URL"
              className={inputClass}
            />
            <input
              value={form.cover_image_alt}
              onChange={(e) => set("cover_image_alt", e.target.value)}
              placeholder="Image alt text"
              className={inputClass}
            />
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold">Publishing</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelClass}>URL slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="url-slug"
                  className={`${inputClass} font-[family-name:var(--font-ibm-mono)] text-xs`}
                />
              </div>
              <div>
                <label className={labelClass}>Trade scope</label>
                <select
                  value={form.trade_slug}
                  onChange={(e) => set("trade_slug", e.target.value)}
                  className={inputClass}
                >
                  <option value="">General — Red Seal (all trades)</option>
                  {[...TRADES]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((trade) => (
                      <option key={trade.slug} value={trade.slug}>
                        {trade.name} ({trade.code})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {form.trade_slug
                    ? `Linked to ${selectedTrade?.name ?? form.trade_slug} exam prep.`
                    : "Applies to all Red Seal trades, not one specific trade."}
                </p>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={inputClass}
                >
                  {[
                    "Exam Prep",
                    "Study Tips",
                    "Trade Guides",
                    "Career",
                    "News",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input
                  value={form.author_name}
                  onChange={(e) => set("author_name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="electrician, study-plan"
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#475569]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                />
                Featured post
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold">SEO</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelClass}>
                  SEO title{" "}
                  <span className="font-normal text-[#94A3B8]">
                    ({form.seo_title.length}/60)
                  </span>
                </label>
                <input
                  value={form.seo_title}
                  onChange={(e) => set("seo_title", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Meta description{" "}
                  <span className="font-normal text-[#94A3B8]">
                    ({form.seo_description.length}/160)
                  </span>
                </label>
                <textarea
                  value={form.seo_description}
                  onChange={(e) => set("seo_description", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Focus keywords (comma sep.)
                </label>
                <input
                  value={form.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Canonical URL (optional)</label>
                <input
                  value={form.canonical_url}
                  onChange={(e) => set("canonical_url", e.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
