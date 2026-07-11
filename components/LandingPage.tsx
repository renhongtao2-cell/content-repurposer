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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          {[
            {
              name: "Starter",
              price: "$2",
              credits: "5 Credits",
              desc: "Perfect for trying out",
              features: ["5 repurposes", "All platforms", "Basic tones"],
              highlighted: false,
            },
            {
              name: "Creator",
              price: "$8",
              credits: "30 Credits",
              desc: "Most popular",
              features: ["30 repurposes", "All platforms", "All tones", "Priority queue"],
              highlighted: true,
            },
            {
              name: "Pro",
              price: "$15",
              credits: "75 Credits",
              desc: "For serious marketers",
              features: ["75 repurposes", "All platforms", "All tones", "Priority queue", "Bulk export"],
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border text-left transition-all ${
                plan.highlighted
                  ? "bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
              <p className="text-3xl font-bold mb-1">{plan.price}</p>
              <p className="text-sm text-gray-400 mb-4">{plan.credits}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 rounded-xl text-sm font-medium transition-all border bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white hover:from-blue-600 hover:to-purple-600">
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Waitlist */}
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
          <span>💳 No credit card required</span>
          <span>•</span>
          <span>🎉 Free beta</span>
          <span>•</span>
          <span>🔒 Private and secure</span>
        </div>
      </div>
    </section>
  );
}
