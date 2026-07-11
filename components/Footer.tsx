export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-gray-500 mb-2">
          Built with Next.js + Google Gemini
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-600">
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Contact</a>
          <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-gray-400 transition-colors">Twitter</a>
        </div>
        <p className="text-xs text-gray-700 mt-4">
          © {new Date().getFullYear()} ContentRepurposer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}