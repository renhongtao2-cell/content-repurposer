"use client";

import { useState } from "react";
import { platforms, tones } from "@/lib/constants";

interface PlatformContent {
  platform: string;
  title: string;
  content: string;
  hashtags?: string[];
  characterCount: number;
}

export default function App() {
  const [sourceContent, setSourceContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "linkedin"]);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<PlatformContent[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!sourceContent.trim()) { setError("Please enter some content"); return; }
    if (selectedPlatforms.length === 0) { setError("Please select at least one platform"); return; }
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
    } catch (e: any) {
      setError(e.message || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = sourceContent.split(/\s+/).filter(Boolean).length;

  return (
    <div className="px-6 pb-16 max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-6">Paste Your Content</h2>
        <textarea
          value={sourceContent}
          onChange={(e) => setSourceContent(e.target.value)}
          placeholder="Paste your blog post, article, video transcript, or any content here..."
          className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-base leading-relaxed mb-4"
        />
        <div className="text-right text-xs text-gray-500 mb-6">{wordCount} words</div>
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
                const all = results
                  .map((r) => `--- ${r.title} ---\n${r.content}`)
                  .join("\n\n");
                navigator.clipboard.writeText(all);
              }}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              📋 Copy All Content
            </button>
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
          <span className="text-xs text-gray-500 capitalize">
            {item.platform} • {item.characterCount} chars
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Copy"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>
      <div className="p-6">
        <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm leading-relaxed bg-black/20 rounded-xl p-4">
          {item.content}
        </pre>
        {item.hashtags && item.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}