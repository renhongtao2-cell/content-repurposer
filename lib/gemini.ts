import { callAnyProvider } from "./ai-providers";

export interface RepurposeOptions {
  sourceContent: string;
  platforms: string[];
  tone?: string;
  count?: number;
}

export interface PlatformContent {
  platform: string;
  title: string;
  content: string;
  hashtags?: string[];
  characterCount: number;
}

export async function repurposeContent(options: RepurposeOptions): Promise<PlatformContent[]> {
  const { sourceContent, platforms, tone = "professional", count = 1 } = options;
  const toneMap: Record<string, string> = {
    professional: "professional and authoritative",
    casual: "casual and conversational",
    humorous: "funny and witty",
    inspirational: "inspirational and motivational",
  };
  const platformInstructions: Record<string, string> = {
    twitter: "Create a Twitter thread of up to 5 tweets. Each under 280 chars. Start with a hook.",
    linkedin: "Create a LinkedIn post of 300-1500 chars with paragraph breaks.",
    instagram: "Create an Instagram caption of 100-250 chars with emojis and 10-15 hashtags.",
    tiktok: "Create a TikTok script of 80-150 words with a hook in first 3 seconds.",
    facebook: "Create a Facebook post of 100-400 chars with an engagement question.",
  };
  const content = sourceContent.substring(0, 4000);
  const platList = platforms.join(", ");
  const platInstr = platforms
    .map((p) => "- " + p.toUpperCase() + ": " + (platformInstructions[p.toLowerCase()] || "Create engaging content"))
    .join("\n");

  const prompt = [
    "You are a professional social media content creator.",
    "",
    "Repurpose the following content into platform-specific posts.",
    "",
    "PLATFORMS: " + platList,
    "TONE: " + (toneMap[tone] || "professional"),
    "COUNT: " + count + " post(s) per platform",
    "",
    "PLATFORM INSTRUCTIONS:",
    platInstr,
    "",
    "SOURCE CONTENT:",
    content,
    "",
    "RETURN FORMAT: A valid JSON array. NOTHING ELSE. No markdown, no explanation.",
    "",
    "JSON format:",
    '[',
    '  {',
    '    "platform": "twitter",',
    '    "title": "Your title here",',
    '    "content": "Post content here",',
    '    "hashtags": ["#tag1", "#tag2"],',
    '    "characterCount": 245',
    '  }',
    ']',
    "",
    "Rules:",
    "- Return EXACTLY one post per platform (total = " + platforms.length + " posts)",
    "- Each post must be unique and tailored to that platform",
    "- Return ONLY the JSON array, nothing else",
  ].join("\n");

  const text = await callAnyProvider(prompt);
  console.log("[AI Response preview]:", text.substring(0, 300));

  // Extract JSON from response
  let jsonStr = text.trim();

  // Remove markdown code blocks
  jsonStr = jsonStr.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "");

  // Find the JSON array
  const firstBracket = jsonStr.indexOf("[");
  const lastBracket = jsonStr.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1) {
    jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [parsed];

    return parsed.map((item: any) => ({
      platform: item.platform || "general",
      title: item.title || "Content",
      content: item.content || "",
      hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
      characterCount: item.characterCount || (item.content?.length || 0),
    }));
  } catch (e) {
    console.error("[JSON Parse Error]", e);
    // Fallback
    return [
      {
        platform: "general",
        title: "Repurposed Content",
        content: jsonStr.substring(0, 500),
        hashtags: [],
        characterCount: jsonStr.length,
      },
    ];
  }
}
