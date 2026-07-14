import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";
import { uploadUserAvatar } from "@/lib/storage/upload-avatar";

export async function POST(request: Request) {
  if (!usesSupabaseData()) {
    return NextResponse.json(
      { error: "Avatar upload is unavailable in demo mode" },
      { status: 400 },
    );
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const avatarUrl = await uploadUserAvatar({
      userId: user.id,
      bytes,
      contentType: file.type || "image/jpeg",
    });

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not upload avatar" },
      { status: 400 },
    );
  }
}
