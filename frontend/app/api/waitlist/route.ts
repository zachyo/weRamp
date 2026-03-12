import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

/**
 * POST /api/waitlist
 *
 * Adds an email to the waitlist.
 * Uses Supabase if configured, falls back to local JSON file for development.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try Supabase first
    const supabase = getSupabaseAdmin();
    if (supabase) {
      return await handleSupabase(supabase, normalizedEmail);
    }

    // Fallback: local JSON file (development only)
    return await handleJsonFallback(normalizedEmail);
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  }
}

// ─── Supabase Handler ─────────────────────────────────────────────────────────

async function handleSupabase(
  supabase: ReturnType<typeof getSupabaseAdmin> & object,
  email: string,
) {
  // Check for duplicate
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { message: "Already on waitlist" },
      { status: 200 },
    );
  }

  // Insert new entry
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // Handle unique constraint violation (race condition)
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Already on waitlist" },
        { status: 200 },
      );
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  }

  // Get total count
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return NextResponse.json(
    { success: true, count: count ?? 0 },
    { status: 201 },
  );
}

// ─── JSON Fallback (dev only) ─────────────────────────────────────────────────

async function handleJsonFallback(email: string) {
  const filePath = path.join(process.cwd(), "..", "waitlist.json");

  let waitlist: string[] = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, "utf8");
    waitlist = JSON.parse(fileData);
  }

  if (waitlist.includes(email)) {
    return NextResponse.json(
      { message: "Already on waitlist" },
      { status: 200 },
    );
  }

  waitlist.push(email);
  fs.writeFileSync(filePath, JSON.stringify(waitlist, null, 2));

  return NextResponse.json(
    { success: true, count: waitlist.length },
    { status: 201 },
  );
}
