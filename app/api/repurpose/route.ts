import { NextRequest, NextResponse } from "next/server";
import { repurposeContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceContent, platforms, tone, count } = body;

    if (!sourceContent || !platforms?.length) {
      return NextResponse.json({ error: "Missing source content or platforms" }, { status: 400 });
    }
    if (sourceContent.length < 100) {
      return NextResponse.json({ error: "Content too short. Minimum 100 characters required." }, { status: 400 });
    }

    const result = await repurposeContent({
      sourceContent,
      platforms,
      tone: tone || "professional",
      count: count || 5,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Repurpose error:", error);
    return NextResponse.json({ error: "Failed to generate content. Please try again." }, { status: 500 });
  }
}