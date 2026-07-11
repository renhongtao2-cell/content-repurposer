import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentRepurposer — Write Once, Publish Everywhere",
  description: "Transform a single blog post, article, or video transcript into ready-to-publish content for Twitter, LinkedIn, Instagram, TikTok, and Facebook. Powered by Google Gemini AI.",
  keywords: ["content repurposing", "social media automation", "AI content", "blog to social media", "content creation tool", "multi-platform posting"],
  authors: [{ name: "ContentRepurposer" }],
  openGraph: {
    title: "ContentRepurposer — Write Once, Publish Everywhere",
    description: "Transform one piece of content into posts for every platform.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentRepurposer",
    description: "Write once, publish everywhere.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}