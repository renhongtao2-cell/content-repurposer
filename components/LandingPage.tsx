"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      setSuccess(true);
      setMessage("You are on the list! We will notify you when it is ready.");
      setEmail("");
    } catch (e: any) {
      setSuccess(false);
      setMessage(e.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative px-6 pt-20 pb-16 md:pt-32 md:pb-24 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Early Access — Free During Beta
        </div>
        <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          One Post,{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Every Platform
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop writing the same content over and over. Paste your blog post, article, or transcript —
          we will transform it into ready-to-publish content for Twitter, LinkedIn, Instagram, and more.
        </p>
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
            >
              {isSubmitting ? "Joining..." : "Get Early Access"}
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-sm ${success ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-600">
            No spam. Unsubscribe anytime. Join 2,847 creators already on the waitlist.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <span>⚡ No credit card required</span>
          <span>•</span>
          <span>🆓 Free beta</span>
          <span>•</span>
          <span>🔒 Private and secure</span>
        </div>
      </div>
    </section>
  );
}