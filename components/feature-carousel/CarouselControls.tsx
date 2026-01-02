"use client";

interface CarouselControlsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export default function CarouselControls({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: CarouselControlsProps) {
  return (
    <div className="flex gap-3 absolute right-0 top-0">
      {/* Left Button */}
      <button
        onClick={onScrollLeft}
        disabled={!canScrollLeft}
        aria-label="Scroll carousel left"
        className="relative w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group"
      >
        {/* Background glow */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500/20 to-pink-500/20 transition-opacity duration-300" />

        {/* Icon */}
        <svg
          className={`w-5 h-5 transform transition-all duration-300 ${
            !canScrollLeft ? 'text-gray-600' : 'text-white group-hover:text-pink-300'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Button */}
      <button
        onClick={onScrollRight}
        disabled={!canScrollRight}
        aria-label="Scroll carousel right"
        className="relative w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center group"
      >
        {/* Background glow */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500/20 to-pink-500/20 transition-opacity duration-300" />

        {/* Icon */}
        <svg
          className={`w-5 h-5 transform transition-all duration-300 ${
            !canScrollRight ? 'text-gray-600' : 'text-white group-hover:text-pink-300'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
