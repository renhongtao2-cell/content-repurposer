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

// Try to extract article content using common selectors
function extractArticleText(html: string): string {
  // Try to find article/main content using common patterns
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class=["'](?:post-content|article-content|entry-content|post_body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id=["'](?:post-content|article-body|content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return convertHtmlToText(match[1]);
    }
  }

  // Fallback: convert entire body
  return convertHtmlToText(html);
}

function convertHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li|tr|section|article|main)>/gi, "\n")
    .replace(/<a[^>]*href=["'][^"']*["'][^>]*>/gi, " [link]")
    .replace(/<\/?a>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function scrapeBlog(url: string): Promise<ScrapedContent> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Fetch the page with multiple attempts
  const fetchWithRetry = async (attempt: number): Promise<string> => {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ContentRepurposer/1.0; +https://content-repurposer.vercel.app)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok && response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (e) {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return fetchWithRetry(attempt + 1);
      }
      throw e;
    }
  };

  let html: string;
  try {
    html = await fetchWithRetry(1);
  } catch {
    throw new Error(`Could not fetch the URL. The site may be blocking automated requests.`);
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled Article";

  // Try article extraction first, fallback to full page
  let text = extractArticleText(html);

  // If article extraction didn't yield enough content, try full page
  if (text.split(/\s+/).filter(Boolean).length < 200) {
    text = convertHtmlToText(html);
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

  // Truncate to manageable size
  if (text.length > 15000) {
    text = text.substring(0, 15000);
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < 50) {
    throw new Error(
      "Could not extract enough content from this URL. " +
      "The site may be using JavaScript to load content. Try copying and pasting the text directly."
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
