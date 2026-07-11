const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

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

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error('Gemini API error (' + response.status + '): ' + err);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error('Claude API error (' + response.status + '): ' + err);
  }
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callAI(prompt: string): Promise<string> {
  // Try Gemini first, fall back to Claude
  try {
    return await callGemini(prompt);
  } catch (e) {
    console.log('Gemini failed, trying Claude...', e);
    if (ANTHROPIC_API_KEY) {
      return await callClaude(prompt);
    }
    throw e;
  }
}

export async function repurposeContent(options: RepurposeOptions): Promise<PlatformContent[]> {
  const { sourceContent, platforms, tone = 'professional', count = 5 } = options;
  const toneMap: Record<string, string> = {
    professional: 'professional and authoritative',
    casual: 'casual and conversational',
    humorous: 'funny and witty',
    inspirational: 'inspirational and motivational',
  };
  const platformInstructions: Record<string, string> = {
    twitter: 'Create a Twitter thread of up to 8 tweets. Each tweet must be under 280 characters. Start with a compelling hook.',
    linkedin: 'Create a LinkedIn post of 300-2000 characters. Professional tone with proper paragraph breaks.',
    instagram: 'Create an Instagram caption of 100-300 characters. Include emojis and 10-15 hashtags.',
    tiktok: 'Create a TikTok video script of 15-30 seconds (80-150 words). Hook in first 3 seconds.',
    facebook: 'Create a Facebook post of 100-500 characters. Slightly casual. Include engagement question.',
  };
  const content = sourceContent.substring(0, 5000);
  const platList = platforms.join(', ');
  const platInstr = platforms.map(p => p.toUpperCase() + ': ' + (platformInstructions[p.toLowerCase()] || 'Create engaging content')).join('\\n');
  const prompt = 'You are a professional social media content creator.\\n\\nTask: Repurpose the following source content into platform-specific posts.\\n\\nSource Content:\\n' + content + '\\n\\nRequirements:\\n1. Tone: ' + (toneMap[tone] || 'professional') + '\\n2. Generate ' + count + ' unique posts for EACH platform listed: ' + platList + '\\n3. Each post must be tailored to the platform\\'s unique style\\n4. Include relevant hashtags\\n\\nPlatform instructions:\\n' + platInstr + '\\n\\nReturn ONLY a valid JSON array. No markdown, no explanation:\\n[\\n  {\\n    "platform": "twitter",\\n    "title": "Thread: Main Topic Here",\\n    "content": "Tweet 1\\\\n\\\\nTweet 2",\\n    "hashtags": ["#topic1"],\\n    "characterCount": 245\\n  }\\n]\\n\\nMake each post unique with different angles. Do NOT copy-paste the same content across platforms.';

  const text = await callAI(prompt);
  const jsonMatch = text.match(/`(?:json)?\\s*([\\s\\S]*?)`/);
  const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [{ platform: 'general', title: 'Repurposed Content', content: jsonText.substring(0, 500), hashtags: [], characterCount: jsonText.length }];
  }
}