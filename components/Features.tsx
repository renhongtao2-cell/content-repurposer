import { platforms } from "@/lib/constants";

const features = [
  {
    icon: "📝",
    title: "Paste Anything",
    desc: "Blog posts, articles, transcripts, notes — paste any long-form content and we'll do the rest.",
  },
  {
    icon: "🤖",
    title: "AI-Powered",
    desc: "Our AI understands your content and creates platform-specific posts that sound natural and engaging.",
  },
  {
    icon: "📱",
    title: "Multi-Platform",
    desc: platforms.map((p) => p.label).join(", ") + ".",
  },
  {
    icon: "⚡",
    title: "Instant Results",
    desc: "Get 5+ unique posts for each platform in seconds. No more spending hours on social media.",
  },
  {
    icon: "🎯",
    title: "Customizable Tone",
    desc: "Choose from Professional, Casual, Funny, or Inspirational to match your brand voice.",
  },
  {
    icon: "📋",
    title: "One-Click Copy",
    desc: "Copy any post instantly. Ready to paste directly into your social media apps.",
  },
];

export default function Features() {
  return (
    <section className="px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Everything You Need
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Stop wasting time creating content for each platform separately.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}