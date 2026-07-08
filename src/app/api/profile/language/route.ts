import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { TRANSLATION_LANGUAGES } from "@/lib/translation/languages";

export async function PATCH(request: Request) {
  const body = await request.json();
  const language = String(body.preferred_language ?? "").trim();

  if (!TRANSLATION_LANGUAGES.some((l) => l.code === language)) {
    return NextResponse.json({ error: "invalid language" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ preferred_language: language });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ preferred_language: language })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferred_language: language });
}
