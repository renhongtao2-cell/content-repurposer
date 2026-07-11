"use client";

import { useState, useEffect } from "react";
import { platforms, tones } from "@/lib/constants";

interface PlatformContent {
  platform: string;
  title: string;
  content: string;
  hashtags?: string[];
  characterCount: number;
}

export default function App() {
  const [inputMode, setInputMode] = useState<"paste" | "url">("paste");
  const [sourceUrl, setSourceUrl] = useState("");
  const [urlScraping, setUrlScraping] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [scrapedTitle, setScrapedTitle] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "linkedin"]);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<PlatformContent[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("credits");
    if (saved) setCredits(parseInt(saved, 10));
  }, []);

  const saveCredits = (n: number) => {
    setCredits(n);
    localStorage.setItem("credits", String(n));
  };

  const buyCredits = async (amount: number) => {
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      alert(e.message);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleScrape = async () => {
    if (!sourceUrl.trim()) { setUrlError("Please enter a URL"); return; }
    setUrlError(""); setUrlScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scrape URL");
      const extra = data.data.author ? `\n\nAuthor: ${data.data.author}\nPublished: ${data.data.publishedDate || "N/A"}` : "";
      setScrapedTitle(data.data.title);
      setSourceContent(`Title: ${data.data.title}\n\n${data.data.content}${extra}`);
      setInputMode("paste"); // switch to paste mode with scraped content
    } catch (e: any) {
      setUrlError(e.message || "Failed to fetch content");
    } finally {
      setUrlScraping(false);
    }
  };

  const handleSubmit = async () => {
    if (!sourceContent.trim()) { setError("Please enter some content or scrape a URL"); return; }
    if (selectedPlatforms.length === 0) { setError("Please select at least one platform"); return; }
    if (credits === 0) { setShowBuyCredits(true); return; }

    setIsLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceContent, platforms: selectedPlatforms, tone: selectedTone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResults(data.data);
      if (credits !== null) saveCredits(credits - 1);
    } catch (e: any) {
      setError(e.message || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = sourceContent.split(/\s+/).filter(Boolean).length;

  return (
    <div className="px-6 pb-16 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {credits === null ? "🎉 Free Beta" : `💰 ${credits} credit${credits !== 1 ? "s" : ""} left`}
          </span>
          {credits !== null && credits <= 3 && (
            <button onClick={() => setShowBuyCredits(true)} className="text-xs text-blue-400 hover:text-blue-300 underline">
              Buy more →
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setInputMode("paste"); setScrapedTitle(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              inputMode === "paste"
                ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            📝 Paste Text
          </button>
          <button
            onClick={() => { setInputMode("url"); setSourceContent(""); setScrapedTitle(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              inputMode === "url"
                ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            🔗 Blog URL
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-2">
          {inputMode === "url" ? "Extract from URL" : "Paste Your Content"}
        </h2>

        {inputMode === "url" ? (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">
              Enter a blog/article URL. We'll extract the content automatically.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/blog/post-title"
                className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") handleScrape(); }}
              />
              <button
                onClick={handleScrape}
                disabled={urlScraping}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
              >
                {urlScraping ? "⏳ Scraping..." : "🔍 Scrape"}
              </button>
            </div>
            {urlError && <p className="mt-2 text-sm text-red-400">{urlError}</p>}
            {scrapedTitle && !urlError && (
              <p className="mt-2 text-sm text-green-400">✅ Scraped: {scrapedTitle}</p>
            )}
          </div>
        ) : (
          <>
            {scrapedTitle && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-400">📄 From: {scrapedTitle}</span>
                <button onClick={() => { setSourceContent(""); setScrapedTitle(""); setInputMode("url"); }} className="text-xs text-gray-500 hover:text-gray-300">
                  ← Change URL
                </button>
              </div>
            )}
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder={scrapedTitle ? "Content extracted from URL. Edit it here before generating..." : "Paste your blog post, article, video transcript, or any content here..."}
              className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-base leading-relaxed mb-4"
            />
            {sourceContent && (
              <div className="text-right text-xs text-gray-500 mb-6">{wordCount} words</div>
            )}
          </>
        )}

        {/* Platform selection */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Target Platforms</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedPlatforms.includes(p.id)
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone selection */}
        <div className="mb-8">
          <label className="text-sm text-gray-400 mb-3 block">Tone</label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedTone === t.id
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span> Generating...
            </>
          ) : (
            <>✨ Generate Social Media Posts</>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Your Generated Content ({results.length} posts)
          </h2>
          {results.map((item, idx) => (
            <ResultCard key={idx} item={item} />
          ))}
          <div className="text-center">
            <button
              onClick={() => {
                const all = results.map((r) => `--- ${r.title} ---\n${r.content}`).join("\n\n");
                navigator.clipboard.writeText(all);
              }}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              📋 Copy All Content
            </button>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      {showBuyCredits && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBuyCredits(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-2">Buy Credits</h3>
            <p className="text-sm text-gray-400 mb-6">Choose a package to continue generating content.</p>
            <div className="space-y-3 mb-6">
              {[
                { amount: 5, price: 2, label: "Starter" },
                { amount: 30, price: 8, label: "Creator", popular: true },
                { amount: 75, price: 15, label: "Pro" },
              ].map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => buyCredits(pkg.amount)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    pkg.popular
                      ? "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">
                      {pkg.label} — {pkg.amount} Credits
                      {pkg.popular && <span className="ml-2 text-xs text-blue-400">(Popular)</span>}
                    </div>
                    <div className="text-xs text-gray-500">$0.50/credit</div>
                  </div>
                  <div className="text-lg font-bold">${pkg.price}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowBuyCredits(false)} className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ item }: { item: PlatformContent }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <span className="text-xs text-gray-500 capitalize">{item.platform} — {item.characterCount} chars</span>
        </div>
        <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Copy">
          {copied ? "✅ Copied" : "📋 Copy"}
        </button>
      </div>
      <div className="p-6">
        <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm leading-relaxed bg-black/20 rounded-xl p-4">{item.content}</pre>
        {item.hashtags && item.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.hashtags.map((tag) => (
              <span key={tag} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

