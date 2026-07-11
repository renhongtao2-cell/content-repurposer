/**
 * Blog/Article Content Scraper
 * Extracts readable article text from any blog URL
 */

interface ScrapedContent {
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  wordCount: number;
}

// Simple HTML content extractor — works without external deps
export async function scrapeBlog(url: string): Promise<ScrapedContent> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Fetch the page
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ContentRepurposer/1.0)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled Article";

  // Remove script/style/tags
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n+/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Limit to last 10000 chars to avoid noise
  if (text.length > 10000) {
    text = text.substring(text.length - 10000);
  }

  // Extract author from meta tags
  const authorMatch = html.match(
    /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i
  );
  const author = authorMatch?.[1];

  // Extract published date
  const dateMatch = html.match(
    /<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i
  );
  const publishedDate = dateMatch?.[1];

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < 50) {
    throw new Error(
      "Could not extract enough content from this URL. Try pasting the text directly."
    );
  }

  return {
    title,
    content: text,
    author,
    publishedDate,
    wordCount,
  };
}
