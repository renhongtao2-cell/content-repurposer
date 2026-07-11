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
  const { sourceContent, platforms, tone = "professional", count = 5 } = options;
  const toneMap: Record<string, string> = {
    professional: "professional and authoritative",
    casual: "casual and conversational",
    humorous: "funny and witty",
    inspirational: "inspirational and motivational",
  };
  const platformInstructions: Record<string, string> = {
    twitter: "Create a Twitter thread of up to 8 tweets. Each tweet must be under 280 characters. Start with a compelling hook.",
    linkedin: "Create a LinkedIn post of 300-2000 characters. Professional tone with proper paragraph breaks.",
    instagram: "Create an Instagram caption of 100-300 characters. Include emojis and 10-15 hashtags.",
    tiktok: "Create a TikTok video script of 15-30 seconds (80-150 words). Hook in first 3 seconds.",
    facebook: "Create a Facebook post of 100-500 characters. Slightly casual. Include engagement question.",
  };
  const content = sourceContent.substring(0, 5000);
  const platList = platforms.join(", ");
  const platInstr = platforms
    .map((p) => p.toUpperCase() + ": " + (platformInstructions[p.toLowerCase()] || "Create engaging content"))
    .join("\\n");
  const prompt =
    "You are a professional social media content creator.\\n\\n" +
    "Task: Repurpose the following source content into platform-specific posts.\\n\\n" +
    "Source Content:\\n" +
    content +
    "\\n\\n" +
    "Requirements:\\n" +
    "1. Tone: " +
    (toneMap[tone] || "professional") +
    "\\n" +
    "2. Generate " +
    count +
    " unique posts for EACH platform listed: " +
    platList +
    "\\n" +
    "3. Each post must be tailored to the platform's unique style\\n" +
    "4. Include relevant hashtags\\n\\n" +
    "Platform instructions:\\n" +
    platInstr +
    "\\n\\n" +
    "Return ONLY a valid JSON array. No markdown, no explanation:\\n" +
    "[\\n" +
    "  {\\n" +
    "    \"platform\": \"twitter\",\\n" +
    "    \"title\": \"Thread: Main Topic Here\",\\n" +
    "    \"content\": \"Tweet 1\\\\n\\\\nTweet 2\",\\n" +
    "    \"hashtags\": [\"#topic1\"],\\n" +
    "    \"characterCount\": 245\\n" +
    "  }\\n" +
    "]\\n\\n" +
    "Make each post unique with different angles. Do NOT copy-paste the same content across platforms.";

  const text = await callAnyProvider(prompt);
  console.log("[AI Response]", text.substring(0, 200));

  // Try multiple parsing strategies
  let jsonText = text.trim();

  // Strategy 1: Extract from markdown code block ```json ... ```
  const codeBlockMatch = jsonText.match(/```(?:json)?\\s*([\\s\\S]*?)```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  // Strategy 2: Find first [ and last ]
  const firstBracket = jsonText.indexOf("[");
  const lastBracket = jsonText.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    jsonText = jsonText.substring(firstBracket, lastBracket + 1);
  }

  try {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        platform: item.platform || "general",
        title: item.title || "Content",
        content: item.content || "",
        hashtags: item.hashtags || [],
        characterCount: item.characterCount || item.content?.length || 0,
      }));
    }
    return [parsed];
  } catch (parseError) {
    console.error("[Parse Error]", parseError);
    // Fallback: try to extract individual items from the raw text
    const items: PlatformContent[] = [];
    const itemMatches = jsonText.match(/\\{[^}]*"platform"[^}]*\\}/g);
    if (itemMatches && itemMatches.length > 0) {
      for (const item of itemMatches) {
        try {
          const parsed = JSON.parse(item);
          items.push({
            platform: parsed.platform || "general",
            title: parsed.title || "Content",
            content: parsed.content || "",
            hashtags: parsed.hashtags || [],
            characterCount: parsed.characterCount || 0,
          });
        } catch {}
      }
    }
    if (items.length > 0) return items;

    // Ultimate fallback
    return [
      {
        platform: "general",
        title: "Repurposed Content",
        content: jsonText.substring(0, 500),
        hashtags: [],
        characterCount: jsonText.length,
      },
    ];
  }
}
