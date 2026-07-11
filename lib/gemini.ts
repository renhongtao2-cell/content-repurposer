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
    .join("\n");
  const prompt =
    "You are a professional social media content creator.\n\n" +
    "Task: Repurpose the following source content into platform-specific posts.\n\n" +
    "Source Content:\n" +
    content +
    "\n\n" +
    "Requirements:\n" +
    "1. Tone: " +
    (toneMap[tone] || "professional") +
    "\n" +
    "2. Generate " +
    count +
    " unique posts for EACH platform listed: " +
    platList +
    "\n" +
    "3. Each post must be tailored to the platform's unique style\n" +
    "4. Include relevant hashtags\n\n" +
    "Platform instructions:\n" +
    platInstr +
    "\n\n" +
    "Return ONLY a valid JSON array. No markdown, no explanation:\n" +
    "[\n" +
    '  {\n' +
    '    "platform": "twitter",\n' +
    '    "title": "Thread: Main Topic Here",\n' +
    '    "content": "Tweet 1\\n\\nTweet 2",\n' +
    '    "hashtags": ["#topic1"],\n' +
    '    "characterCount": 245\n' +
    "  }\n" +
    "]\n\n" +
    "Make each post unique with different angles. Do NOT copy-paste the same content across platforms.";

  const text = await callAnyProvider(prompt);
  const jsonMatch = text.match(/`(?:json)?\s*([\s\S]*?)`/);
  const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
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

