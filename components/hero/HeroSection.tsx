"use client";

import Image from "next/image";
import HeroHeadline from "./HeroHeadline";
import HeroSearch from "./HeroSearch";
import HeroTrustBar from "./HeroTrustBar";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <section
      className="relative w-full overflow-hidden mb-16"
      role="region"
      aria-label="Hero section"
    >
      {/* Hero Container */}
      <div className="relative w-full h-80 max-h-[300px] flex items-center">
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black z-0"></div>

        {/* Background Image - Full Width */}
        <div className="absolute inset-0 z-1 opacity-40">
          <Image
            src="/image/heroimage/heroimagepromptbase.webp"
            alt="Marketplace preview"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          
          {/* Gradient Overlay - Left to Right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full h-full">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 h-full flex items-center">
            {/* Content Column */}
            <div className="max-w-2xl">
              {/* Headline */}
              <HeroHeadline />

              {/* Search Bar */}
              <HeroSearch onSearch={onSearch} />

              {/* Trust Indicators */}
              <HeroTrustBar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
