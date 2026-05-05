import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_TAGS = ["kosan", "kamar"] as const;
type ValidTag = (typeof VALID_TAGS)[number];

export async function POST(req: NextRequest) {
  // Verify admin session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tag?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tag = body.tag as ValidTag;

  if (!VALID_TAGS.includes(tag)) {
    return NextResponse.json(
      { error: `Invalid tag. Must be one of: ${VALID_TAGS.join(", ")}` },
      { status: 400 }
    );
  }

  revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tag });
}