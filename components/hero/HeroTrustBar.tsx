"use client";

import { Star } from "lucide-react";

export default function HeroTrustBar() {
  return (
    <div className="mt-8">
      {/* Rating Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-white">4.9</span>
        </div>

        {/* Stats Divider */}
        <div className="hidden sm:block w-px h-5 bg-gray-600"></div>

        {/* Review Count */}
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-white">33,000+</span> reviews
        </p>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-gray-600"></div>

        {/* Users Count */}
        <p className="text-sm text-gray-300">
          Trusted by{" "}
          <span className="font-semibold text-white">400,000+</span> users
        </p>
      </div>
    </div>
  );
}
