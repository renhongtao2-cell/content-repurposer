import { NextRequest, NextResponse } from "next/server";
import { scrapeBlog } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const content = await scrapeBlog(url);

    return NextResponse.json({
      success: true,
      data: {
        title: content.title,
        content: content.content,
        author: content.author,
        publishedDate: content.publishedDate,
        wordCount: content.wordCount,
      },
    });
  } catch (error) {
    console.error("Scrape error:", error);
    const msg = error instanceof Error ? error.message : "Failed to scrape URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
