import { NextResponse } from "next/server";
import { lookupReferenceChunkByRuleNumber } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ruleNumber = searchParams.get("rule_number")?.trim();
  if (!ruleNumber) {
    return NextResponse.json(
      { error: "rule_number is required" },
      { status: 400 },
    );
  }

  const codeVersion = searchParams.get("code_version") ?? undefined;
  const chunk = await lookupReferenceChunkByRuleNumber(ruleNumber, codeVersion);

  return NextResponse.json({ chunk });
}
