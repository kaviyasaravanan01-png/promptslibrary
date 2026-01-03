"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function ExploreMarketplaceCTA() {
  return (
    <section className="w-full py-12">
      <Link
        href="/marketplace"
        className="group relative block overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        aria-label="Explore the marketplace"
      >
        {/* Background image */}
        <div className="relative w-full h-72 md:h-80">
          <Image
            src="/image/exploremarketplace/exploremarketplace.webp"
            alt="Explore the marketplace"
            fill
            priority={false}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 sm:px-10 md:px-14 lg:px-16 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Explore the Marketplace
            </h2>
            <p className="text-base md:text-lg text-gray-200/90 leading-relaxed max-w-2xl mb-6">
              Discover thousands of quality, tested AI prompts made by expert prompt engineers
            </p>
            <div>
              <span className="inline-flex">
                <span className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-pink-600/30 transform transition duration-200 group-hover:scale-[1.03] group-hover:shadow-pink-500/40">
                  Explore Marketplace
                </span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
