"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminReferencesPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", "CEC");
    formData.append("code_version", "CEC-2024");
    formData.append("title", file.name);

    const res = await fetch("/api/admin/references", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setMessage(data.message ?? "Upload complete");
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Reference Documents</h1>
        <p className="text-sm text-[#64748B]">
          Upload licensed code books for RAG generation and open-book viewer.
          Content is chunked and embedded into pgvector.
        </p>

        <Card className="mt-6 p-6">
          <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[#E5E0D8] p-8 hover:border-[#C0271E]">
            <Upload className="h-10 w-10 text-[#94A3B8]" />
            <span className="mt-3 font-semibold">
              Upload PDF (CEC, NPC, WHMIS)
            </span>
            <span className="mt-1 text-xs text-[#94A3B8]">
              Tagged with code_version for bulk updates
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {message && <p className="mt-4 text-sm text-[#047857]">{message}</p>}
          {uploading && (
            <p className="mt-4 text-sm">Processing and embedding chunks...</p>
          )}
        </Card>

        <Card className="mt-4 p-4 text-sm text-[#64748B]">
          <b>Licensing note:</b> Only upload documents you are licensed to use.
          The viewer shows rule numbers and excerpts, not wholesale
          reproduction.
        </Card>
      </div>
    </div>
  );
}
