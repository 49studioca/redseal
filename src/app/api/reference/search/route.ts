import { NextResponse } from "next/server";
import { REFERENCE_CHUNKS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const codeVersion = searchParams.get("code_version");

  const query = q.toLowerCase();
  const chunks = REFERENCE_CHUNKS.filter((c) => {
    if (codeVersion && c.code_version !== codeVersion) return false;
    return (
      c.content.toLowerCase().includes(query) ||
      c.rule_number?.toLowerCase().includes(query) ||
      c.section_title?.toLowerCase().includes(query)
    );
  });

  return NextResponse.json({ chunks });
}
