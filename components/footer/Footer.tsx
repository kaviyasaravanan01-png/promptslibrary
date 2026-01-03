"use client";

import Link from 'next/link';

const linkClass = "text-sm text-gray-300 hover:text-white transition-colors";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-black via-gray-900 to-black border-t border-white/10 mt-16" aria-labelledby="footer-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h2 id="footer-heading" className="text-2xl font-bold text-white">Prompt Library</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Discover, buy, and deploy high-quality AI prompts crafted by expert prompt engineers.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-pink-600/30 hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              aria-label="Explore the marketplace"
            >
              Explore Marketplace
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Marketplace */}
          <nav className="space-y-3" aria-label="Marketplace links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Marketplace</h3>
            <div className="flex flex-col gap-2">
              <Link href="/marketplace" className={linkClass}>Browse All</Link>
              <Link href="/marketplace?is_featured=true" className={linkClass}>Featured</Link>
              <Link href="/marketplace?contentType=video_tutorial" className={linkClass}>Video Tutorials</Link>
              <Link href="/marketplace?expectedOutput=image" className={linkClass}>Photo Prompts</Link>
              <Link href="/marketplace?expectedOutput=video" className={linkClass}>Video Prompts</Link>
              <Link href="/marketplace?expectedOutput=code" className={linkClass}>Code Prompts</Link>
            </div>
          </nav>

          {/* Community */}
          <nav className="space-y-3" aria-label="Community links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Community</h3>
            <div className="flex flex-col gap-2">
              <Link href="/favorites" className={linkClass}>Favorites</Link>
              <Link href="/my/prompts" className={linkClass}>My Prompts</Link>
              <Link href="/admin/review" className={linkClass}>Admin Review</Link>
            </div>
          </nav>

          {/* Support */}
          <nav className="space-y-3" aria-label="Support links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Support</h3>
            <div className="flex flex-col gap-2">
              <Link href="/marketplace?q=help" className={linkClass}>Help Center</Link>
              <Link href="/marketplace?q=guides" className={linkClass}>Guides</Link>
              <Link href="mailto:support@promptlibrary.ai" className={linkClass}>support@promptlibrary.ai</Link>
              <Link href="/marketplace?q=terms" className={linkClass}>Terms &amp; Privacy</Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Prompt Library. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-300">
            <a href="https://twitter.com" className="hover:text-white" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016.11 2c-2.63 0-4.64 2.37-4.04 4.9A12.94 12.94 0 013 3s-4 9 5 13a13.2 13.2 0 01-7 2c9 5.5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com" className="hover:text-white" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4zM8.5 8h3.8v2.2h.05c.53-1 1.82-2.2 3.75-2.2 4.01 0 4.75 2.64 4.75 6.07V24h-4v-8.3c0-1.98-.04-4.53-2.76-4.53-2.76 0-3.18 2.16-3.18 4.38V24h-4z" />
              </svg>
            </a>
            <a href="https://github.com" className="hover:text-white" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.467-1.11-1.467-.909-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.893 1.531 2.341 1.089 2.91.833.091-.647.35-1.089.636-1.34-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.56 9.56 0 012.506.337c1.909-1.296 2.748-1.027 2.748-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.337-.012 2.419-.012 2.75 0 .268.18.58.688.481C19.138 20.193 22 16.44 22 12.017 22 6.484 17.523 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
