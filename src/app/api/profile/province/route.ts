import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { isProvinceCode } from "@/lib/provinces";

export async function PATCH(request: Request) {
  const body = await request.json();
  const province = String(body.province ?? "").trim().toUpperCase();

  if (!isProvinceCode(province)) {
    return NextResponse.json({ error: "invalid province" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ province });
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
    .update({ province })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ province });
}
